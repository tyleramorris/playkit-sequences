const express = require('express');
const { getAllSequences, pushNextEmail } = require('../services/scheduler');

const router = express.Router();

/**
 * GET /sequences — returns all active and completed sequences for the dashboard.
 */
router.get('/', (req, res) => {
  res.json(getAllSequences());
});

/**
 * POST /sequences/:id/push-next — immediately send the next pending follow-up.
 */
router.post('/:id/push-next', async (req, res) => {
  try {
    const result = await pushNextEmail(req.params.id);
    if (!result.found) return res.status(404).json({ error: 'Sequence not found' });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
