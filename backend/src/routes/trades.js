// ============================================================
//  Trades Routes — Unified trade store
//  Currently in-memory (perfect for development).
//  When you're ready for a database, just swap the `store`
//  object for DB calls — the routes stay the same.
// ============================================================

const express = require('express');
const router  = express.Router();
const { v4: uuidv4 } = require('uuid');

// ── In-memory store (swap this for a DB later) ───────────────
// Structure: { [userId]: Trade[] }
// For now we use a single "default" user during dev.
const store = { default: [] };

function getStore(req) {
  const userId = req.session?.userId || 'default';
  if (!store[userId]) store[userId] = [];
  return store[userId];
}

// ── GET /trades — list all trades ─────────────────────────────
router.get('/', (req, res) => {
  const trades = getStore(req);

  // Optional filters from query params
  const { broker, symbol, direction, from, to } = req.query;
  let filtered = trades;

  if (broker)    filtered = filtered.filter(t => t.broker    === broker);
  if (symbol)    filtered = filtered.filter(t => t.symbol    === symbol.toUpperCase());
  if (direction) filtered = filtered.filter(t => t.direction === direction);
  if (from)      filtered = filtered.filter(t => new Date(t.entryTime) >= new Date(from));
  if (to)        filtered = filtered.filter(t => new Date(t.entryTime) <= new Date(to));

  // Sort by entry time, newest first
  filtered.sort((a, b) => new Date(b.entryTime) - new Date(a.entryTime));

  res.json({ count: filtered.length, trades: filtered });
});

// ── POST /trades — add one or many trades ────────────────────
// Accepts a single trade object OR an array (for bulk import)
router.post('/', (req, res) => {
  const trades = getStore(req);
  const input  = Array.isArray(req.body) ? req.body : [req.body];

  const added = [];
  for (const t of input) {
    if (!t.symbol || !t.entryPrice) continue;

    const trade = {
      id:         uuidv4(),
      createdAt:  new Date().toISOString(),

      // Core fields
      broker:     t.broker     || 'manual',
      symbol:     t.symbol.toUpperCase().trim(),
      assetType:  t.assetType  || 'EQUITY',
      direction:  t.direction  || 'Long',
      quantity:   parseFloat(t.quantity)   || 0,
      entryPrice: parseFloat(t.entryPrice) || 0,
      exitPrice:  t.exitPrice ? parseFloat(t.exitPrice) : null,
      entryTime:  t.entryTime  || new Date().toISOString(),
      exitTime:   t.exitTime   || null,

      // Calculated fields
      pnl:        computePnl(t),
      rr:         computeRR(t),

      // Options fields
      optionType:  t.optionType  || null,
      strikePrice: t.strikePrice || null,
      expiryDate:  t.expiryDate  || null,

      // Journal fields
      setup:       t.setup    || null,
      tags:        t.tags     || [],
      emotion:     t.emotion  || null,
      notes:       t.notes    || '',
      commission:  parseFloat(t.commission) || 0,

      // Metadata
      source: t._source || 'manual',
    };

    // Dedup: skip if a trade with same brokerOrderId already exists
    if (t.brokerOrderId) {
      const exists = trades.some(e => e.brokerOrderId === t.brokerOrderId);
      if (exists) continue;
      trade.brokerOrderId = t.brokerOrderId;
    }

    trades.push(trade);
    added.push(trade);
  }

  res.status(201).json({ added: added.length, trades: added });
});

// ── PATCH /trades/:id — update a trade (add notes, setup, etc.)
router.patch('/:id', (req, res) => {
  const trades = getStore(req);
  const idx    = trades.findIndex(t => t.id === req.params.id);

  if (idx === -1) return res.status(404).json({ error: 'Trade not found' });

  // Only allow updating journal fields, not broker data
  const allowed = ['setup', 'tags', 'emotion', 'notes', 'exitPrice', 'exitTime', 'commission'];
  for (const field of allowed) {
    if (req.body[field] !== undefined) trades[idx][field] = req.body[field];
  }

  // Recompute P&L if exit price was updated
  if (req.body.exitPrice) {
    trades[idx].pnl = computePnl(trades[idx]);
    trades[idx].rr  = computeRR(trades[idx]);
  }

  trades[idx].updatedAt = new Date().toISOString();
  res.json(trades[idx]);
});

// ── DELETE /trades/:id ────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const trades   = getStore(req);
  const before   = trades.length;
  const filtered = trades.filter(t => t.id !== req.params.id);
  store[req.session?.userId || 'default'] = filtered;

  if (filtered.length === before) return res.status(404).json({ error: 'Trade not found' });
  res.json({ success: true });
});

// ── GET /trades/summary — aggregated stats ────────────────────
router.get('/summary', (req, res) => {
  const trades = getStore(req).filter(t => t.exitPrice); // closed trades only

  if (!trades.length) return res.json({ message: 'No closed trades yet' });

  const wins   = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const totalPnl = trades.reduce((s, t) => s + (t.pnl || 0), 0);
  const avgWin   = wins.length   ? wins.reduce((s, t)   => s + t.pnl, 0) / wins.length   : 0;
  const avgLoss  = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0;

  res.json({
    totalTrades:  trades.length,
    winners:      wins.length,
    losers:       losses.length,
    winRate:      ((wins.length / trades.length) * 100).toFixed(1) + '%',
    netPnl:       totalPnl.toFixed(2),
    avgWin:       avgWin.toFixed(2),
    avgLoss:      avgLoss.toFixed(2),
    profitFactor: avgLoss !== 0 ? Math.abs(avgWin / avgLoss).toFixed(2) : 'N/A',
  });
});

// ── Helpers ───────────────────────────────────────────────────
function computePnl(trade) {
  const entry = parseFloat(trade.entryPrice);
  const exit  = parseFloat(trade.exitPrice);
  const qty   = parseFloat(trade.quantity);
  const fee   = parseFloat(trade.commission) || 0;

  if (!exit || !entry || !qty) return null;

  const gross = trade.direction === 'Long'
    ? (exit - entry) * qty
    : (entry - exit) * qty;

  return parseFloat((gross - fee).toFixed(2));
}

function computeRR(trade) {
  const entry = parseFloat(trade.entryPrice);
  const exit  = parseFloat(trade.exitPrice);
  const stop  = parseFloat(trade.stopLoss);

  if (!exit || !entry || !stop) return null;

  const risk   = Math.abs(entry - stop);
  const reward = Math.abs(exit  - entry);
  if (risk === 0) return null;

  return parseFloat((reward / risk).toFixed(2));
}

module.exports = router;
