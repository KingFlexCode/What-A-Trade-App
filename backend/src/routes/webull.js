// ============================================================
//  Webull OAuth Routes
//  Docs: https://developer.webull.com/apis/docs
// ============================================================

const express = require('express');
const router  = express.Router();
const webullService = require('../services/webullService');

// ── Step 1: Redirect user to Webull login ────────────────────
router.get('/connect', (req, res) => {
  if (!process.env.WEBULL_APP_KEY || process.env.WEBULL_APP_KEY === 'YOUR_WEBULL_APP_KEY_HERE') {
    return res.status(503).json({
      error: 'Webull credentials not configured yet.',
      message: 'Add WEBULL_APP_KEY and WEBULL_APP_SECRET to your .env file after creating your developer account at https://developer.webull.com',
    });
  }

  const params = new URLSearchParams({
    app_key:       process.env.WEBULL_APP_KEY,
    redirect_uri:  process.env.WEBULL_REDIRECT_URI,
    response_type: 'code',
    scope:         'trade.readonly',
  });

  const authUrl = `https://openapi.webull.com/oauth2/authorize?${params.toString()}`;
  console.log('[Webull] Redirecting user to OAuth login...');
  res.redirect(authUrl);
});

// ── Step 2: Webull redirects back here with an auth code ─────
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('[Webull] OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}?broker=webull&status=error&reason=${error}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?broker=webull&status=error&reason=no_code`);
  }

  try {
    console.log('[Webull] Exchanging auth code for tokens...');
    const tokenData = await webullService.exchangeCodeForToken(code);

    req.session.webullToken        = tokenData.access_token;
    req.session.webullRefreshToken = tokenData.refresh_token;
    req.session.webullTokenExpiry  = Date.now() + (tokenData.expires_in || 3600) * 1000;

    // Fetch account info
    const account = await webullService.getAccount(tokenData.access_token);
    if (account) {
      req.session.webullAccountMask = '****' + (account.accountId || '').slice(-4);
    }

    console.log('[Webull] ✅ Connected successfully');
    res.redirect(`${process.env.FRONTEND_URL}?broker=webull&status=connected`);
  } catch (err) {
    console.error('[Webull] Token exchange failed:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}?broker=webull&status=error&reason=token_exchange_failed`);
  }
});

// ── Sync: Pull latest trades from Webull ─────────────────────
router.post('/sync', async (req, res) => {
  if (!req.session.webullToken) {
    return res.status(401).json({ error: 'Not connected to Webull. Please connect first.' });
  }

  try {
    // Refresh token if needed
    if (Date.now() > req.session.webullTokenExpiry - 300_000) {
      console.log('[Webull] Token expiring soon, refreshing...');
      const refreshed = await webullService.refreshToken(req.session.webullRefreshToken);
      req.session.webullToken       = refreshed.access_token;
      req.session.webullTokenExpiry = Date.now() + (refreshed.expires_in || 3600) * 1000;
    }

    // Fetch orders
    const orders = await webullService.getOrders(req.session.webullToken);
    const trades  = webullService.mapOrdersToTrades(orders);

    req.session.webullLastSync = new Date().toISOString();

    console.log(`[Webull] ✅ Synced ${trades.length} trades`);
    res.json({
      success:  true,
      broker:   'webull',
      count:    trades.length,
      trades,
      lastSync: req.session.webullLastSync,
    });
  } catch (err) {
    console.error('[Webull] Sync failed:', err.message);
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// ── Disconnect ────────────────────────────────────────────────
router.post('/disconnect', (req, res) => {
  delete req.session.webullToken;
  delete req.session.webullRefreshToken;
  delete req.session.webullTokenExpiry;
  delete req.session.webullAccountMask;
  delete req.session.webullLastSync;
  console.log('[Webull] Disconnected');
  res.json({ success: true });
});

module.exports = router;
