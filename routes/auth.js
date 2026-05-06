const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const TOKENS_PATH = path.join(__dirname, '..', 'tokens.json');

// Load persisted tokens from disk on startup
let storedTokens = null;
try {
  if (fs.existsSync(TOKENS_PATH)) {
    storedTokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    console.log('[auth] Loaded tokens from tokens.json');
  }
} catch (err) {
  console.error('[auth] Failed to load tokens.json:', err.message);
}

function saveTokens(tokens) {
  storedTokens = tokens;
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
  console.log('[auth] Saved tokens to tokens.json');
}

function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
}

function getAuthenticatedClient() {
  if (!storedTokens) return null;
  const client = createOAuth2Client();
  client.setCredentials(storedTokens);
  client.on('tokens', (tokens) => {
    console.log('[auth] Token refreshed, persisting updated tokens');
    saveTokens({ ...storedTokens, ...tokens });
  });
  return client;
}

// GET /auth — initiates Gmail OAuth flow
router.get('/', (req, res) => {
  const oauth2Client = createOAuth2Client();
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
  });
  res.redirect(authUrl);
});

// GET /auth/callback — handles OAuth callback
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing authorization code' });

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    saveTokens(tokens);
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    res.redirect('https://playkit-sequences-production.up.railway.app/');
  } catch (err) {
    res.status(500).json({ error: 'OAuth failed', details: err.message });
  }
});

router.get('/status', (req, res) => {
  res.json({ authenticated: !!storedTokens });
});

module.exports = router;
module.exports.getAuthenticatedClient = getAuthenticatedClient;
module.exports.saveTokens = saveTokens;
