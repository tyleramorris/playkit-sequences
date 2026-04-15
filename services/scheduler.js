const cron = require('node-cron');
const { sendEmail } = require('./gmail');
const { getAuthenticatedClient } = require('../routes/auth');

// In-memory store: sequenceId -> { to, subject, threadId, messageId, references, emails, scheduledJobs, status }
const activeSequences = new Map();

let sequenceCounter = 0;

/**
 * Start a new email sequence.
 * Sends Email 1 immediately, then schedules follow-ups.
 *
 * @param {Object} params
 * @param {string} params.to - Recipient email
 * @param {string} params.subject - Email subject
 * @param {Array<{body: string, delayMinutes: number}>} params.emails - Array of email steps
 * @returns {Object} { sequenceId, threadId }
 */
async function startSequence({ to, subject, emails }) {
  const auth = getAuthenticatedClient();
  if (!auth) throw new Error('Not authenticated. Visit /auth/google first.');
  if (!emails || emails.length === 0) throw new Error('At least one email is required.');

  const sequenceId = String(++sequenceCounter);

  // Send Email 1 immediately
  const firstEmail = emails[0];
  const result = await sendEmail(auth, {
    to,
    subject,
    body: firstEmail.body,
  });

  const sequence = {
    to,
    subject,
    threadId: result.threadId,
    messageId: result.messageId,
    references: result.messageId,
    emails,
    sentCount: 1,
    scheduledJobs: [],
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  // Schedule remaining emails
  for (let i = 1; i < emails.length; i++) {
    const step = emails[i];
    const delayMs = (step.delayMinutes || 60) * 60 * 1000;

    const timeout = setTimeout(async () => {
      try {
        if (sequence.status !== 'active') return;

        const currentAuth = getAuthenticatedClient();
        if (!currentAuth) {
          console.error(`Sequence ${sequenceId}: Auth expired, skipping email ${i + 1}`);
          return;
        }

        const res = await sendEmail(currentAuth, {
          to: sequence.to,
          subject: sequence.subject,
          body: step.body,
          threadId: sequence.threadId,
          messageId: sequence.messageId,
          references: sequence.references,
        });

        // Update references chain for next email
        sequence.messageId = res.messageId;
        sequence.references = `${sequence.references} ${res.messageId}`;
        sequence.sentCount++;

        console.log(`Sequence ${sequenceId}: Sent email ${sequence.sentCount}/${emails.length}`);

        // If all emails sent, mark complete
        if (sequence.sentCount >= emails.length) {
          sequence.status = 'completed';
          console.log(`Sequence ${sequenceId}: Completed`);
        }
      } catch (err) {
        console.error(`Sequence ${sequenceId}: Failed to send email ${i + 1}:`, err.message);
      }
    }, delayMs);

    sequence.scheduledJobs.push(timeout);
  }

  activeSequences.set(sequenceId, sequence);
  console.log(`Sequence ${sequenceId}: Started with ${emails.length} emails to ${to}`);

  return { sequenceId, threadId: result.threadId };
}

/**
 * Cancel an active sequence and clear all pending scheduled emails.
 */
function cancelSequence(sequenceId) {
  const sequence = activeSequences.get(sequenceId);
  if (!sequence) return { found: false };
  if (sequence.status !== 'active') return { found: true, status: sequence.status };

  sequence.scheduledJobs.forEach(clearTimeout);
  sequence.scheduledJobs = [];
  sequence.status = 'cancelled';

  console.log(`Sequence ${sequenceId}: Cancelled`);
  return { found: true, status: 'cancelled' };
}

function getSequence(sequenceId) {
  return activeSequences.get(sequenceId) || null;
}

function getAllSequences() {
  const result = [];
  for (const [id, seq] of activeSequences) {
    result.push({
      sequenceId: id,
      to: seq.to,
      subject: seq.subject,
      status: seq.status,
      sentCount: seq.sentCount,
      totalEmails: seq.emails.length,
      createdAt: seq.createdAt,
    });
  }
  return result;
}

function getActiveSequences() {
  const result = [];
  for (const [id, seq] of activeSequences) {
    if (seq.status === 'active') {
      result.push({ sequenceId: id, threadId: seq.threadId });
    }
  }
  return result;
}

module.exports = { startSequence, cancelSequence, getSequence, getAllSequences, getActiveSequences };
