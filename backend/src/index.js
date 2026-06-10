// ============================================================
//  WhatATrade! Backend — Main Server
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const schwabRoutes = require('./routes/schwab');
const webullRoutes = require('./routes/webull');
const csvRoutes    = require('./routes/csv');
const tradesRoutes = require('./routes/trades');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session — stores broker tokens per user during development.
// In production swap this for a real session store (Redis, DB, etc.)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── Routes ───────────────────────────────────────────────────
app.use('/auth/schwab', schwabRoutes);   // thinkorswim OAuth
app.use('/auth/webull', webullRoutes);   // Webull OAuth
app.use('/import/csv',  csvRoutes);      // CSV file uploads
app.use('/trades',      tradesRoutes);   // Unified trade store

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    brokers: {
      schwab: !!process.env.SCHWAB_CLIENT_ID && process.env.SCHWAB_CLIENT_ID !== 'YOUR_SCHWAB_CLIENT_ID_HERE',
      webull: !!process.env.WEBULL_APP_KEY   && process.env.WEBULL_APP_KEY   !== 'YOUR_WEBULL_APP_KEY_HERE',
    },
  });
});

// ── Connection status endpoint (used by frontend dashboard) ──
app.get('/status', (req, res) => {
  res.json({
    schwab: {
      connected:   !!req.session.schwabToken,
      accountMask: req.session.schwabAccountMask || null,
      lastSync:    req.session.schwabLastSync    || null,
    },
    webull: {
      connected:   !!req.session.webullToken,
      accountMask: req.session.webullAccountMask || null,
      lastSync:    req.session.webullLastSync    || null,
    },
  });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀  WhatATrade! backend running on http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/health`);
  console.log(`   Status:  http://localhost:${PORT}/status\n`);

  const sb = process.env.SCHWAB_CLIENT_ID !== 'YOUR_SCHWAB_CLIENT_ID_HERE';
  const wb = process.env.WEBULL_APP_KEY   !== 'YOUR_WEBULL_APP_KEY_HERE';
  console.log(`   Schwab credentials: ${sb ? '✅  loaded' : '⏳  not set yet (.env.example)'}`);
  console.log(`   Webull credentials: ${wb ? '✅  loaded' : '⏳  not set yet (.env.example)'}\n`);
});
