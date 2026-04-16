const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

// Phase-1 in-memory token storage; Phase 2 moves to a persistent database.
let storedTokens = null;

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
    storedTokens = tokens;
    oauth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });

    res.json({
      message: 'Authenticated successfully',
      email: profile.data.emailAddress,
    });
  } catch (err) {
    res.status(500).json({ error: 'OAuth failed', details: err.message });
  }
});

router.get('/status', (req, res) => {
  res.json({ authenticated: !!storedTokens });
});

module.exports = router;
module.exports.getAuthenticatedClient = getAuthenticatedClient;
