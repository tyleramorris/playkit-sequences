const { google } = require('googleapis');

function formatAddressList(addresses) {
  if (!addresses) return '';
  if (Array.isArray(addresses)) return addresses.join(', ');
  return addresses;
}

/**
 * Build a raw RFC 2822 email string, base64url-encoded for the Gmail API.
 * Supports multiple To recipients and optional Cc recipients. When messageId
 * is provided, sets In-Reply-To / References headers so Gmail keeps the
 * message in the same thread.
 */
function buildRawEmail({ to, cc, from, subject, body, messageId, references }) {
  const headers = [
    `To: ${formatAddressList(to)}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
  ];

  if (cc && (Array.isArray(cc) ? cc.length : cc)) {
    headers.splice(1, 0, `Cc: ${formatAddressList(cc)}`);
  }

  if (messageId) {
    headers.push(`In-Reply-To: ${messageId}`);
    headers.push(`References: ${references || messageId}`);
  }

  const email = headers.join('\r\n') + '\r\n\r\n' + body;
  return Buffer.from(email).toString('base64url');
}

/**
 * Send an email via the Gmail API.
 * Returns { threadId, messageId } so follow-ups can thread correctly.
 */
async function sendEmail(auth, { to, cc, subject, body, threadId, messageId, references }) {
  const gmail = google.gmail({ version: 'v1', auth });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const from = profile.data.emailAddress;

  const raw = buildRawEmail({ to, cc, from, subject, body, messageId, references });

  const params = {
    userId: 'me',
    requestBody: { raw },
  };
  if (threadId) {
    params.requestBody.threadId = threadId;
  }

  const res = await gmail.users.messages.send(params);

  const sentMsg = await gmail.users.messages.get({
    userId: 'me',
    id: res.data.id,
    format: 'metadata',
    metadataHeaders: ['Message-ID'],
  });

  const sentMessageId = sentMsg.data.payload.headers.find(
    (h) => h.name === 'Message-ID'
  )?.value;

  return {
    threadId: res.data.threadId,
    gmailMessageId: res.data.id,
    messageId: sentMessageId,
  };
}

/**
 * Check if a thread has any reply from someone other than the sender.
 * Uses Gmail labelIds (SENT vs INBOX) as the primary signal, with the
 * From header as a fallback. Logs what it finds for easier debugging.
 */
async function checkForReply(auth, threadId) {
  const gmail = google.gmail({ version: 'v1', auth });

  const thread = await gmail.users.threads.get({
    userId: 'me',
    id: threadId,
    format: 'metadata',
    metadataHeaders: ['From', 'Subject', 'Date'],
  });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const myEmail = profile.data.emailAddress.toLowerCase();

  const messages = thread.data.messages || [];
  console.log(
    `  [gmail] thread ${threadId}: ${messages.length} message(s), me=${myEmail}`
  );

  let replyFound = false;
  for (const msg of messages) {
    const headers = msg.payload?.headers || [];
    const from =
      headers.find((h) => h.name === 'From')?.value || '(no From header)';
    const subject = headers.find((h) => h.name === 'Subject')?.value || '';
    const date = headers.find((h) => h.name === 'Date')?.value || '';
    const labels = msg.labelIds || [];
    const isSent = labels.includes('SENT');
    const isDraft = labels.includes('DRAFT');
    const fromIsMe = from.toLowerCase().includes(myEmail);
    const isReply = !isSent && !isDraft && !fromIsMe;

    console.log(
      `    [gmail] msg ${msg.id} | from="${from}" | date="${date}" | ` +
        `labels=[${labels.join(',')}] | sent=${isSent} fromMe=${fromIsMe} reply=${isReply}` +
        (subject ? ` | subject="${subject}"` : '')
    );

    if (isReply) replyFound = true;
  }

  console.log(`  [gmail] thread ${threadId}: replyFound=${replyFound}`);
  return replyFound;
}

module.exports = { sendEmail, checkForReply };
