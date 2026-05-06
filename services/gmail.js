const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const ATTACHMENTS_DIR = path.join(__dirname, '..', 'attachments');

const MIME_TYPES = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

/**
 * Read all PDF and DOCX files for a given template.
 * Checks attachments/<templateId>/ first; falls back to the root attachments/ dir.
 */
function getAttachments(templateId) {
  const templateDir = templateId ? path.join(ATTACHMENTS_DIR, templateId) : null;
  const dir =
    templateDir && fs.existsSync(templateDir) ? templateDir : ATTACHMENTS_DIR;

  if (!fs.existsSync(dir)) return [];

  const attachments = [];
  for (const file of fs.readdirSync(dir)) {
    const ext = path.extname(file).toLowerCase();
    const mimeType = MIME_TYPES[ext];
    if (!mimeType) continue;
    const content = fs.readFileSync(path.join(dir, file)).toString('base64');
    attachments.push({ filename: file, mimeType, content });
  }

  return attachments;
}

function formatAddressList(addresses) {
  if (!addresses) return '';
  if (Array.isArray(addresses)) return addresses.join(', ');
  return addresses;
}

function buildEmailHeaders({ to, cc, from, subject, messageId, references }) {
  const headers = [
    `To: ${formatAddressList(to)}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
  ];

  if (cc && (Array.isArray(cc) ? cc.length : cc)) {
    headers.splice(1, 0, `Cc: ${formatAddressList(cc)}`);
  }

  if (messageId) {
    headers.push(`In-Reply-To: ${messageId}`);
    headers.push(`References: ${references || messageId}`);
  }

  return headers;
}

/**
 * Build a raw RFC 2822 email string, base64url-encoded for the Gmail API.
 * Supports multiple To recipients and optional Cc recipients. When messageId
 * is provided, sets In-Reply-To / References headers so Gmail keeps the
 * message in the same thread.
 */
function toHtmlBody(body) {
  return body.replace(/\n/g, '<br>\r\n');
}

function buildRawEmail({ to, cc, from, subject, body, messageId, references }) {
  const headers = buildEmailHeaders({ to, cc, from, subject, messageId, references });
  headers.push('Content-Type: text/html; charset=UTF-8');

  const email = headers.join('\r\n') + '\r\n\r\n' + toHtmlBody(body);
  return Buffer.from(email).toString('base64url');
}

/**
 * Build a multipart/mixed RFC 2822 email with file attachments,
 * base64url-encoded for the Gmail API.
 */
function buildRawEmailWithAttachments({ to, cc, from, subject, body, messageId, references, attachments }) {
  const boundary = `boundary_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const headers = buildEmailHeaders({ to, cc, from, subject, messageId, references });
  headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);

  const parts = [];

  // HTML body part
  parts.push(
    `--${boundary}\r\n` +
    'Content-Type: text/html; charset=UTF-8\r\n\r\n' +
    toHtmlBody(body)
  );

  // Attachment parts
  for (const att of attachments) {
    parts.push(
      `--${boundary}\r\n` +
      `Content-Type: ${att.mimeType}\r\n` +
      'Content-Transfer-Encoding: base64\r\n' +
      `Content-Disposition: attachment; filename="${att.filename}"\r\n\r\n` +
      att.content
    );
  }

  parts.push(`--${boundary}--`);

  const email = headers.join('\r\n') + '\r\n\r\n' + parts.join('\r\n');
  return Buffer.from(email).toString('base64url');
}

/**
 * Send an email via the Gmail API.
 * Returns { threadId, messageId } so follow-ups can thread correctly.
 */
async function sendEmail(auth, { to, cc, subject, body, threadId, messageId, references, includeAttachments, templateId }) {
  const gmail = google.gmail({ version: 'v1', auth });

  const profile = await gmail.users.getProfile({ userId: 'me' });
  const from = profile.data.emailAddress;

  let raw;
  const attachments = includeAttachments ? getAttachments(templateId) : [];
  if (attachments.length > 0) {
    console.log(`[gmail] Attaching ${attachments.length} file(s): ${attachments.map((a) => a.filename).join(', ')}`);
    raw = buildRawEmailWithAttachments({ to, cc, from, subject, body, messageId, references, attachments });
  } else {
    raw = buildRawEmail({ to, cc, from, subject, body, messageId, references });
  }

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
