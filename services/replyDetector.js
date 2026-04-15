const cron = require('node-cron');
const { checkForReply } = require('./gmail');
const { getActiveSequences, cancelSequence } = require('./scheduler');
const { getAuthenticatedClient } = require('../routes/auth');

let cronJob = null;

/**
 * Poll all active sequences for replies. If a reply is detected,
 * cancel the sequence so no more follow-ups are sent.
 */
async function pollForReplies() {
  const auth = getAuthenticatedClient();
  if (!auth) return;

  const active = getActiveSequences();
  if (active.length === 0) return;

  console.log(`Reply detector: Checking ${active.length} active sequence(s)...`);

  for (const { sequenceId, threadId } of active) {
    try {
      const hasReply = await checkForReply(auth, threadId);
      if (hasReply) {
        console.log(`Reply detector: Reply found on sequence ${sequenceId}, cancelling.`);
        cancelSequence(sequenceId);
      }
    } catch (err) {
      console.error(`Reply detector: Error checking sequence ${sequenceId}:`, err.message);
    }
  }
}

/**
 * Start polling for replies every 15 minutes.
 */
function startReplyPolling() {
  if (cronJob) return;
  cronJob = cron.schedule('*/15 * * * *', pollForReplies);
  console.log('Reply detector: Polling every 15 minutes');
}

function stopReplyPolling() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
  }
}

module.exports = { startReplyPolling, stopReplyPolling, pollForReplies };
