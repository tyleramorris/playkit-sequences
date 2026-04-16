const express = require('express');
const { getAllSequences } = require('../services/scheduler');

const router = express.Router();

/**
 * GET /sequences — returns all active and completed sequences for the dashboard.
 */
router.get('/', (req, res) => {
  res.json(getAllSequences());
});

module.exports = router;
