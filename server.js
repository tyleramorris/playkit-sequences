require('dotenv').config();
const path = require('path');
const express = require('express');
const authRoutes = require('./routes/auth');
const sequenceRoutes = require('./routes/sequence');
const sequencesRoutes = require('./routes/sequences');
const { startReplyPolling } = require('./services/replyDetector');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/sequence', sequenceRoutes);
app.use('/sequences', sequencesRoutes);

app.get('/templates', (req, res) => {
  try {
    const templates = require('./templates.json');
    res.json(templates);
  } catch (err) {
    console.error('[Templates] Failed to load templates.json:', err.message);
    res.status(500).json({ error: 'Failed to load templates' });
  }
});

// Logging dashboard (served at the backend root per PRD).
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReplyPolling();
});
