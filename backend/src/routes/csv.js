// ============================================================
//  CSV Import Routes
//  Handles file upload + auto-parsing for:
//    Robinhood, SoFi, thinkorswim (manual), Webull (manual), Generic
// ============================================================

const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const { parse } = require('csv-parse/sync');

// Store uploads in memory (no disk writes needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.csv$/i)) {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
});

// ── POST /import/csv/upload ───────────────────────────────────
// Body: multipart/form-data with field "file" and optional "broker"
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const broker = (req.body.broker || 'auto').toLowerCase();
  const csv    = req.file.buffer.toString('utf8');

  try {
    // Auto-detect broker if not specified
    const detected = broker === 'auto' ? detectBroker(csv) : broker;
    const trades   = parseCSV(csv, detected);

    console.log(`[CSV] Parsed ${trades.length} trades from ${detected} format`);
    res.json({
      success:        true,
      broker:         detected,
      count:          trades.length,
      trades,
    });
  } catch (err) {
    console.error('[CSV] Parse error:', err.message);
    res.status(422).json({ error: 'Could not parse CSV file.', message: err.message });
  }
});

// ── Auto-detect broker from CSV column headers ────────────────
function detectBroker(csvText) {
  const firstLine = csvText.split('\n')[0].toLowerCase();

  if (firstLine.includes('exec time') || firstLine.includes('spread') || firstLine.includes('thinkorswim')) {
    return 'thinkorswim';
  }
  if (firstLine.includes('activity date') && firstLine.includes('process date')) {
    return 'robinhood';
  }
  if (firstLine.includes('trade date') && firstLine.includes('settlement date') && firstLine.includes('sofi')) {
    return 'sofi';
  }
  if (firstLine.includes('filled time') || firstLine.includes('avg cost') && firstLine.includes('webull')) {
    return 'webull';
  }
  return 'generic';
}

// ── Route to broker-specific parser ──────────────────────────
function parseCSV(csvText, broker) {
  switch (broker) {
    case 'robinhood':   return parseRobinhood(csvText);
    case 'sofi':        return parseSoFi(csvText);
    case 'thinkorswim': return parseThinkorswim(csvText);
    case 'webull':      return parseWebull(csvText);
    default:            return parseGeneric(csvText);
  }
}

// ── Robinhood CSV Parser ──────────────────────────────────────
// Columns: Activity Date, Process Date, Settle Date, Instrument,
//          Description, Trans Code, Quantity, Price, Amount
function parseRobinhood(csvText) {
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  const trades = [];

  for (const row of rows) {
    const code = (row['Trans Code'] || '').toUpperCase();
    // Only process buys and sells
    if (!['BUY', 'SELL', 'SLD', 'BOT'].includes(code)) continue;

    const qty   = Math.abs(parseFloat(row['Quantity'])  || 0);
    const price = Math.abs(parseFloat(row['Price'])     || 0);

    if (!qty || !price) continue;

    trades.push({
      broker:     'robinhood',
      symbol:     row['Instrument']?.trim(),
      direction:  code === 'BUY' || code === 'BOT' ? 'Long' : 'Short',
      quantity:   qty,
      entryPrice: price,
      exitPrice:  null,
      entryTime:  row['Activity Date'] || row['Process Date'],
      pnl:        parseFloat(row['Amount']) || null,
      _source:    'csv',
    });
  }
  return trades;
}

// ── SoFi CSV Parser ───────────────────────────────────────────
// Columns: Date, Type, Description, Symbol, Shares, Price, Amount
function parseSoFi(csvText) {
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  const trades = [];

  for (const row of rows) {
    const type = (row['Type'] || row['Transaction Type'] || '').toUpperCase();
    if (!type.includes('BUY') && !type.includes('SELL')) continue;

    const qty   = Math.abs(parseFloat(row['Shares'] || row['Quantity']) || 0);
    const price = Math.abs(parseFloat(row['Price']) || 0);

    if (!qty || !price) continue;

    trades.push({
      broker:     'sofi',
      symbol:     (row['Symbol'] || row['Ticker'])?.trim(),
      direction:  type.includes('BUY') ? 'Long' : 'Short',
      quantity:   qty,
      entryPrice: price,
      exitPrice:  null,
      entryTime:  row['Date'] || row['Trade Date'],
      pnl:        parseFloat(row['Amount']) || null,
      _source:    'csv',
    });
  }
  return trades;
}

// ── thinkorswim CSV Parser ────────────────────────────────────
// The TOS AccountStatement.csv has multiple sections.
// We look for the "Trade History" or order sections.
// Columns: Exec Time, Spread, Side, Qty, Symbol, Exp, Strike, Type, Price
function parseThinkorswim(csvText) {
  const trades = [];
  const lines  = csvText.split('\n');

  // Find the section that contains trade history
  let inTradeSection = false;
  let headers = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // TOS CSV has section headers like "Account Trade History"
    if (trimmed.toLowerCase().includes('account trade history') ||
        trimmed.toLowerCase().includes('trade history')) {
      inTradeSection = true;
      continue;
    }

    // Section ends at the next blank line or new section header
    if (inTradeSection && trimmed === '') {
      inTradeSection = false;
      continue;
    }

    if (inTradeSection && headers.length === 0) {
      headers = trimmed.split(',').map(h => h.trim().replace(/"/g, ''));
      continue;
    }

    if (inTradeSection && headers.length > 0 && trimmed) {
      const values = trimmed.split(',').map(v => v.trim().replace(/"/g, ''));
      const row    = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));

      const side = (row['Side'] || row['Action'] || '').toUpperCase();
      if (!['BUY', 'SELL', 'BOT', 'SLD'].includes(side)) continue;

      const qty   = Math.abs(parseFloat(row['Qty']) || 0);
      const price = Math.abs(parseFloat(row['Price']) || 0);
      if (!qty || !price) continue;

      trades.push({
        broker:      'thinkorswim',
        symbol:      row['Symbol']?.trim(),
        direction:   side === 'BUY' || side === 'BOT' ? 'Long' : 'Short',
        quantity:    qty,
        entryPrice:  price,
        exitPrice:   null,
        entryTime:   row['Exec Time'] || row['Date'],
        optionType:  row['Type']   || null, // PUT / CALL
        strikePrice: row['Strike'] || null,
        expiryDate:  row['Exp']    || null,
        pnl:         null,
        _source:     'csv',
      });
    }
  }

  // If no section found, fall back to generic parse
  return trades.length > 0 ? trades : parseGeneric(csvText);
}

// ── Webull CSV Parser ─────────────────────────────────────────
// Columns: Symbol, Side, Filled Qty, Avg Cost, Filled Time, Order Type
function parseWebull(csvText) {
  const rows = parse(csvText, { columns: true, skip_empty_lines: true, trim: true });
  const trades = [];

  for (const row of rows) {
    const side = (row['Side'] || row['Action'] || '').toUpperCase();
    if (!side.includes('BUY') && !side.includes('SELL')) continue;

    const qty   = Math.abs(parseFloat(row['Filled Qty'] || row['Quantity']) || 0);
    const price = Math.abs(parseFloat(row['Avg Cost']   || row['Price'])    || 0);

    if (!qty || !price) continue;

    trades.push({
      broker:     'webull',
      symbol:     row['Symbol']?.trim(),
      direction:  side.includes('BUY') ? 'Long' : 'Short',
      quantity:   qty,
      entryPrice: price,
      exitPrice:  null,
      entryTime:  row['Filled Time'] || row['Date'],
      pnl:        null,
      _source:    'csv',
    });
  }
  return trades;
}

// ── Generic CSV Parser ────────────────────────────────────────
// Tries to handle any CSV with: date, symbol, side/action, qty, price
function parseGeneric(csvText) {
  const rows = parse(csvText, {
    columns:           true,
    skip_empty_lines:  true,
    trim:              true,
    relax_column_count: true,
  });
  const trades = [];

  for (const row of rows) {
    // Try to find the relevant columns by common names
    const keys    = Object.keys(row).map(k => k.toLowerCase());
    const getCol  = (...names) => {
      for (const n of names) {
        const match = keys.find(k => k.includes(n));
        if (match) return row[Object.keys(row)[keys.indexOf(match)]];
      }
      return null;
    };

    const side   = (getCol('side', 'action', 'type', 'trans') || '').toUpperCase();
    const symbol = getCol('symbol', 'ticker', 'instrument');
    const qty    = Math.abs(parseFloat(getCol('qty', 'quantity', 'shares', 'amount')) || 0);
    const price  = Math.abs(parseFloat(getCol('price', 'avg', 'cost', 'execution')) || 0);
    const date   = getCol('date', 'time', 'activity');

    if (!symbol || !qty || !price) continue;
    const isBuy = side.includes('BUY') || side.includes('BOT') || side === 'B';

    trades.push({
      broker:     'generic',
      symbol:     symbol.trim(),
      direction:  isBuy ? 'Long' : 'Short',
      quantity:   qty,
      entryPrice: price,
      exitPrice:  null,
      entryTime:  date,
      pnl:        null,
      _source:    'csv',
    });
  }
  return trades;
}

module.exports = router;
