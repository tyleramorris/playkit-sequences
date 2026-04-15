require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/auth');
const sequenceRoutes = require('./routes/sequence');
const { startReplyPolling } = require('./services/replyDetector');

const app = express();
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/sequence', sequenceRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'running', message: 'PlayKit Sequences API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReplyPolling();
});
