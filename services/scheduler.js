const { sendEmail } = require('./gmail');
const { getAuthenticatedClient } = require('../routes/auth');
const { FOLLOWUPS, resolveFirstNames, extractGreetingFromBody } = require('./followupTemplates');
const { getDeal } = require('./attio');

/**
 * In-memory store of sequences, keyed by internal sequence id.
 * Sequences also carry dealId so they can be cancelled / looked up by deal.
 * Phase 2 will move this to a persistent database.
 */
const sequences = new Map();
let sequenceCounter = 0;

/**
 * Derive the follow-up subject line ("RE: <original subject>") without
 * stacking multiple "RE:" prefixes if the user already wrote one.
 */
function replySubject(subject) {
  return /^re:/i.test(subject.trim()) ? subject : `RE: ${subject}`;
}

/**
 * Start a new sequence per PRD:
 *   - Send Email 1 immediately (body already has variables resolved by the frontend)
 *   - Capture the Gmail thread id
 *   - Schedule Emails 2, 3, 4 on days 5, 14, 21 as replies in the same thread
 *
 * firstNames is an array aligned with recipients order (same length). It's used to
 * resolve {First Name} and {First Name N} tokens in the hardcoded follow-up bodies.
 */
async function startSequence({ recipients, cc, subject, body, dealId, templateId, companyName, contractLink }) {
  const auth = getAuthenticatedClient();
  if (!auth) throw new Error('Not authenticated. Visit /auth first.');
  if (!recipients || recipients.length === 0) throw new Error('At least one recipient is required.');
  if (!subject) throw new Error('Subject is required.');
  if (!body) throw new Error('Body is required.');
  if (!dealId) throw new Error('dealId is required.');

  const sequenceId = String(++sequenceCounter);

  const greetingName = companyName ? `${companyName} team` : extractGreetingFromBody(body);
  const email1Body = body
    .replace('{First Name}', greetingName || '')
    .replace('{Contract Link}', contractLink || '');
  const sent = await sendEmail(auth, { to: recipients, cc, subject, body: email1Body });

  // Look up deal name for the dashboard (best effort).
  let dealName = dealId;
  try {
    const deal = await getDeal(dealId);
    dealName = deal.name;
  } catch (_) {}

  const sequence = {
    id: sequenceId,
    dealId,
    dealName,
    companyName: companyName || null,
    contractLink: contractLink || null,
    recipients,
    firstNames: [],
    cc: cc || [],
    subject,
    body,
    greetingName,
    threadId: sent.threadId,
    messageId: sent.messageId,
    references: sent.messageId,
    sentCount: 1,
    totalEmails: 1 + FOLLOWUPS.length,
    status: 'active',
    exitReason: null,
    scheduledJobs: [],
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };

  const followupSubject = replySubject(subject);

  for (const step of FOLLOWUPS) {
    const timeout = setTimeout(async () => {
      if (sequence.status !== 'active') return;
      const currentAuth = getAuthenticatedClient();
      if (!currentAuth) {
        console.error(`Sequence ${sequenceId}: auth expired, skipping step ${step.step}`);
        return;
      }
      try {
        const resolvedBody = resolveFirstNames(step.body, sequence.firstNames, sequence.greetingName);
        const res = await sendEmail(currentAuth, {
          to: sequence.recipients,
          cc: sequence.cc,
          subject: followupSubject,
          body: resolvedBody,
          threadId: sequence.threadId,
          messageId: sequence.messageId,
          references: sequence.references,
        });
        sequence.messageId = res.messageId;
        sequence.references = `${sequence.references} ${res.messageId}`;
        sequence.sentCount += 1;
        sequence.lastActivityAt = new Date().toISOString();
        console.log(`Sequence ${sequenceId}: sent step ${step.step} (${step.label})`);

        if (sequence.sentCount >= sequence.totalEmails) {
          sequence.status = 'completed';
          sequence.exitReason = 'completed';
          console.log(`Sequence ${sequenceId}: completed`);
        }
      } catch (err) {
        console.error(`Sequence ${sequenceId}: failed step ${step.step}:`, err.message);
      }
    }, step.delayMs);

    sequence.scheduledJobs.push(timeout);
  }

  sequences.set(sequenceId, sequence);
  console.log(
    `Sequence ${sequenceId}: started for deal ${dealId} to ${recipients.join(', ')}`
  );

  return { sequenceId, threadId: sent.threadId };
}

/**
 * Cancel any active sequence(s) for the given deal. PRD cancels "by deal id".
 * Optional reason records why the sequence exited (reply, meeting, manual).
 */
function cancelSequenceByDeal(dealId, reason = 'cancelled') {
  let cancelled = 0;
  for (const seq of sequences.values()) {
    if (seq.dealId === dealId && seq.status === 'active') {
      seq.scheduledJobs.forEach(clearTimeout);
      seq.scheduledJobs = [];
      seq.status = reason === 'cancelled' ? 'cancelled' : 'completed';
      seq.exitReason = reason;
      seq.lastActivityAt = new Date().toISOString();
      cancelled += 1;
    }
  }
  return { cancelled };
}

function cancelSequenceById(sequenceId, reason = 'cancelled') {
  const seq = sequences.get(sequenceId);
  if (!seq) return { found: false };
  if (seq.status !== 'active') return { found: true, status: seq.status };
  seq.scheduledJobs.forEach(clearTimeout);
  seq.scheduledJobs = [];
  seq.status = reason === 'cancelled' ? 'cancelled' : 'completed';
  seq.exitReason = reason;
  seq.lastActivityAt = new Date().toISOString();
  return { found: true, status: seq.status };
}

/**
 * Immediately send the next pending follow-up for a sequence, bypassing its timer.
 */
async function pushNextEmail(sequenceId) {
  const sequence = sequences.get(sequenceId);
  if (!sequence) return { found: false };
  if (sequence.status !== 'active') return { found: true, status: sequence.status };

  const followupIndex = sequence.sentCount - 1;
  if (followupIndex >= FOLLOWUPS.length) return { found: true, done: true };

  const step = FOLLOWUPS[followupIndex];

  const timeout = sequence.scheduledJobs[followupIndex];
  if (timeout) clearTimeout(timeout);
  sequence.scheduledJobs[followupIndex] = null;

  const auth = getAuthenticatedClient();
  if (!auth) throw new Error('Not authenticated. Visit /auth first.');

  const followupSubject = replySubject(sequence.subject);
  const resolvedBody = resolveFirstNames(step.body, sequence.firstNames, sequence.greetingName);

  const res = await sendEmail(auth, {
    to: sequence.recipients,
    cc: sequence.cc,
    subject: followupSubject,
    body: resolvedBody,
    threadId: sequence.threadId,
    messageId: sequence.messageId,
    references: sequence.references,
  });

  sequence.messageId = res.messageId;
  sequence.references = `${sequence.references} ${res.messageId}`;
  sequence.sentCount += 1;
  sequence.lastActivityAt = new Date().toISOString();
  console.log(`Sequence ${sequenceId}: pushed step ${step.step} (${step.label})`);

  if (sequence.sentCount >= sequence.totalEmails) {
    sequence.status = 'completed';
    sequence.exitReason = 'completed';
    console.log(`Sequence ${sequenceId}: completed`);
  }

  return { found: true, step: step.step, label: step.label };
}

function getAllSequences() {
  return Array.from(sequences.values()).map((seq) => ({
    sequenceId: seq.id,
    dealId: seq.dealId,
    dealName: seq.dealName,
    companyName: seq.companyName,
    recipients: seq.recipients,
    cc: seq.cc,
    subject: seq.subject,
    status: seq.status,
    sentCount: seq.sentCount,
    totalEmails: seq.totalEmails,
    exitReason: seq.exitReason,
    lastActivityAt: seq.lastActivityAt,
    createdAt: seq.createdAt,
  }));
}

function getActiveSequences() {
  const result = [];
  for (const seq of sequences.values()) {
    if (seq.status === 'active') {
      result.push({
        sequenceId: seq.id,
        dealId: seq.dealId,
        threadId: seq.threadId,
        createdAt: seq.createdAt,
      });
    }
  }
  return result;
}

module.exports = {
  startSequence,
  cancelSequenceByDeal,
  cancelSequenceById,
  getAllSequences,
  getActiveSequences,
  pushNextEmail,
};
