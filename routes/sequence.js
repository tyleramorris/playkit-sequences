const express = require('express');
const {
  startSequence,
  cancelSequenceByDeal,
} = require('../services/scheduler');

const router = express.Router();

/**
 * POST /sequence/start
 * Starts a new sequence. Sends Email 1 immediately and schedules 2–4.
 * Body: { recipients: string[], cc?: string[], subject: string, body: string, dealId: string }
 */
router.post('/start', async (req, res) => {
  const { recipients, firstNames, cc, subject, body, dealId, startDate, templateId } = req.body || {};

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'recipients (array) is required' });
  }
  if (!subject || !body || !dealId) {
    return res.status(400).json({ error: 'subject, body, and dealId are required' });
  }
  if (firstNames && (!Array.isArray(firstNames) || firstNames.length !== recipients.length)) {
    return res.status(400).json({
      error: 'firstNames must be an array the same length as recipients',
    });
  }
  if (!startDate || typeof startDate !== 'string') {
    return res.status(400).json({ error: 'startDate (YYYY-MM-DD) is required' });
  }
  const parsedStartDate = new Date(startDate + 'T00:00:00');
  if (Number.isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({ error: 'startDate must be a valid YYYY-MM-DD date' });
  }
  const formattedStartDate = parsedStartDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });
  const finalBody = body.replace('[START DATE]', formattedStartDate);

  try {
    const result = await startSequence({
      recipients,
      firstNames: firstNames || [],
      cc: Array.isArray(cc) ? cc : [],
      subject,
      body: finalBody,
      dealId,
      templateId: typeof templateId === 'string' ? templateId : undefined,
    });
    res.json({ message: 'Sequence started', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /sequence/cancel
 * Cancels the active sequence for a given deal.
 * Body: { dealId: string }
 */
router.post('/cancel', (req, res) => {
  const { dealId } = req.body || {};
  if (!dealId) return res.status(400).json({ error: 'dealId is required' });

  const { cancelled } = cancelSequenceByDeal(dealId, 'cancelled');
  if (cancelled === 0) {
    return res.status(404).json({ error: 'No active sequence for that deal' });
  }
  res.json({ message: 'Sequence cancelled', cancelled });
});

module.exports = router;
