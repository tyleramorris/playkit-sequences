const cron = require('node-cron');
const { checkForReply } = require('./gmail');
const { hasMeetingBookedSince } = require('./attio');
const { getActiveSequences, cancelSequenceById } = require('./scheduler');
const { getAuthenticatedClient } = require('../routes/auth');

let cronJob = null;

/**
 * Poll every 15 minutes per PRD. For each active sequence:
 *   1. Check the Gmail thread for a reply from anyone other than Julia.
 *   2. Check Attio for a meeting booked on the deal since the sequence started.
 * Either signal cancels the sequence with the appropriate exit reason.
 */
async function pollForReplies() {
  const auth = getAuthenticatedClient();
  if (!auth) return;

  const active = getActiveSequences();
  if (active.length === 0) return;

  console.log(`Reply detector: checking ${active.length} active sequence(s)...`);

  for (const { sequenceId, threadId, dealId, createdAt } of active) {
    console.log(
      `Reply detector: checking sequence ${sequenceId} (thread=${threadId}, deal=${dealId || 'none'})`
    );
    try {
      const hasReply = await checkForReply(auth, threadId);
      if (hasReply) {
        console.log(`Reply detector: reply on sequence ${sequenceId}`);
        cancelSequenceById(sequenceId, 'reply');
        continue;
      }
    } catch (err) {
      console.error(`Reply detector: gmail check failed for ${sequenceId}:`, err.message);
    }

    try {
      if (dealId && process.env.ATTIO_API_TOKEN) {
        const meeting = await hasMeetingBookedSince(dealId, createdAt);
        if (meeting) {
          console.log(`Reply detector: meeting booked on deal ${dealId}`);
          cancelSequenceById(sequenceId, 'meeting');
        }
      }
    } catch (err) {
      console.error(`Reply detector: attio check failed for ${sequenceId}:`, err.message);
    }
  }
}

function startReplyPolling() {
  if (cronJob) return;
  cronJob = cron.schedule('*/15 * * * *', pollForReplies);
  console.log('Reply detector: polling every 15 minutes');
}

function stopReplyPolling() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}

module.exports = { startReplyPolling, stopReplyPolling, pollForReplies };
