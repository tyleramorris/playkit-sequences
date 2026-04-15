const { google } = require('googleapis');

/**
 * Build a raw RFC 2822 email string, base64url-encoded for the Gmail API.
 * If threadId is provided, sets In-Reply-To and References headers to keep
 * the email in the same thread.
 */
function buildRawEmail({ to, from, subject, body, messageId, references }) {
  const headers = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=UTF-8',
  ];

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
async function sendEmail(auth, { to, subject, body, threadId, messageId, references }) {
  const gmail = google.gmail({ version: 'v1', auth });

  // Get sender address
  const profile = await gmail.users.getProfile({ userId: 'me' });
  const from = profile.data.emailAddress;

  const raw = buildRawEmail({ to, from, subject, body, messageId, references });

  const params = {
    userId: 'me',
    requestBody: { raw },
  };
  if (threadId) {
    params.requestBody.threadId = threadId;
  }

  const res = await gmail.users.messages.send(params);

  // Fetch the sent message to get its Message-ID header
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
 */
async function checkForReply(auth, threadId) {
  const gmail = google.gmail({ version: 'v1', auth });

  const thread = await gmail.users.threads.get({
    userId: 'me',
    id: threadId,
    format: 'metadata',
    metadataHeaders: ['From'],
  });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const myEmail = profile.data.emailAddress.toLowerCase();

  // If any message in the thread is NOT from us, it's a reply
  const hasReply = thread.data.messages.some((msg) => {
    const from = msg.payload.headers.find((h) => h.name === 'From')?.value || '';
    return !from.toLowerCase().includes(myEmail);
  });

  return hasReply;
}

module.exports = { sendEmail, checkForReply };
