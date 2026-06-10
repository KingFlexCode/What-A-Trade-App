// ============================================================
//  Schwab (thinkorswim) OAuth Routes
//  Docs: https://developer.schwab.com/products/trader-api
// ============================================================

const express = require('express');
const router  = express.Router();
const schwabService = require('../services/schwabService');

// ── Step 1: Redirect user to Schwab login ────────────────────
// Frontend calls: GET /auth/schwab/connect
// This redirects the user's browser to Schwab's OAuth login page.
router.get('/connect', (req, res) => {
  if (!process.env.SCHWAB_CLIENT_ID || process.env.SCHWAB_CLIENT_ID === 'YOUR_SCHWAB_CLIENT_ID_HERE') {
    return res.status(503).json({
      error: 'Schwab credentials not configured yet.',
      message: 'Add SCHWAB_CLIENT_ID and SCHWAB_CLIENT_SECRET to your .env file after creating your developer account at https://developer.schwab.com',
    });
  }

  const params = new URLSearchParams({
    client_id:     process.env.SCHWAB_CLIENT_ID,
    redirect_uri:  process.env.SCHWAB_REDIRECT_URI,
    response_type: 'code',
    scope:         'readonly',
  });

  const authUrl = `https://api.schwabapi.com/v1/oauth/authorize?${params.toString()}`;
  console.log('[Schwab] Redirecting user to OAuth login...');
  res.redirect(authUrl);
});

// ── Step 2: Schwab redirects back here with an auth code ─────
// Schwab calls: GET /auth/schwab/callback?code=...
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    console.error('[Schwab] OAuth error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}?broker=schwab&status=error&reason=${error}`);
  }

  if (!code) {
    return res.redirect(`${process.env.FRONTEND_URL}?broker=schwab&status=error&reason=no_code`);
  }

  try {
    console.log('[Schwab] Exchanging auth code for tokens...');
    const tokenData = await schwabService.exchangeCodeForToken(code);

    // Store token in session (swap for DB storage in production)
    req.session.schwabToken        = tokenData.access_token;
    req.session.schwabRefreshToken = tokenData.refresh_token;
    req.session.schwabTokenExpiry  = Date.now() + tokenData.expires_in * 1000;

    // Fetch account info to show masked account number
    const accounts = await schwabService.getAccounts(tokenData.access_token);
    if (accounts && accounts.length > 0) {
      const acctNum = accounts[0].securitiesAccount?.accountNumber || '';
      req.session.schwabAccountMask = '****' + acctNum.slice(-4);
    }

    console.log('[Schwab] ✅ Connected successfully');
    res.redirect(`${process.env.FRONTEND_URL}?broker=schwab&status=connected`);
  } catch (err) {
    console.error('[Schwab] Token exchange failed:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}?broker=schwab&status=error&reason=token_exchange_failed`);
  }
});

// ── Sync: Pull latest trades from Schwab ─────────────────────
// Frontend calls: POST /auth/schwab/sync
router.post('/sync', async (req, res) => {
  if (!req.session.schwabToken) {
    return res.status(401).json({ error: 'Not connected to Schwab. Please connect first.' });
  }

  try {
    // Refresh token if it's close to expiry (within 5 minutes)
    if (Date.now() > req.session.schwabTokenExpiry - 300_000) {
      console.log('[Schwab] Token expiring soon, refreshing...');
      const refreshed = await schwabService.refreshToken(req.session.schwabRefreshToken);
      req.session.schwabToken       = refreshed.access_token;
      req.session.schwabTokenExpiry = Date.now() + refreshed.expires_in * 1000;
    }

    // Fetch accounts then orders
    const accounts = await schwabService.getAccounts(req.session.schwabToken);
    const accountId = accounts[0]?.securitiesAccount?.accountNumber;

    if (!accountId) throw new Error('No account found');

    // Fetch orders from the last 90 days (adjust as needed)
    const fromDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const orders   = await schwabService.getOrders(req.session.schwabToken, accountId, fromDate);

    // Map Schwab order format → WhatATrade! trade format
    const trades = schwabService.mapOrdersToTrades(orders);

    req.session.schwabLastSync = new Date().toISOString();

    console.log(`[Schwab] ✅ Synced ${trades.length} trades`);
    res.json({
      success: true,
      broker:  'thinkorswim',
      count:   trades.length,
      trades,
      lastSync: req.session.schwabLastSync,
    });
  } catch (err) {
    console.error('[Schwab] Sync failed:', err.message);
    res.status(500).json({ error: 'Sync failed', message: err.message });
  }
});

// ── Disconnect ────────────────────────────────────────────────
router.post('/disconnect', (req, res) => {
  delete req.session.schwabToken;
  delete req.session.schwabRefreshToken;
  delete req.session.schwabTokenExpiry;
  delete req.session.schwabAccountMask;
  delete req.session.schwabLastSync;
  console.log('[Schwab] Disconnected');
  res.json({ success: true });
});

module.exports = router;
