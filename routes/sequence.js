const express = require('express');
const { startSequence, cancelSequence, getSequence, getAllSequences } = require('../services/scheduler');
const router = express.Router();

// Start a new email sequence
router.post('/start', async (req, res) => {
  const { to, subject, emails } = req.body;

  if (!to || !subject || !emails) {
    return res.status(400).json({ error: 'Missing required fields: to, subject, emails' });
  }

  try {
    const result = await startSequence({ to, subject, emails });
    res.json({ message: 'Sequence started', ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a sequence
router.post('/:id/cancel', (req, res) => {
  const result = cancelSequence(req.params.id);
  if (!result.found) return res.status(404).json({ error: 'Sequence not found' });
  res.json({ message: 'Sequence cancelled', status: result.status });
});

// Get a specific sequence
router.get('/:id', (req, res) => {
  const seq = getSequence(req.params.id);
  if (!seq) return res.status(404).json({ error: 'Sequence not found' });
  res.json({
    to: seq.to,
    subject: seq.subject,
    status: seq.status,
    sentCount: seq.sentCount,
    totalEmails: seq.emails.length,
    createdAt: seq.createdAt,
  });
});

// List all sequences
router.get('/', (req, res) => {
  res.json(getAllSequences());
});

module.exports = router;
