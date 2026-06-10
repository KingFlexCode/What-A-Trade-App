-- ============================================================
--  WhatATrade! — Supabase Database Schema
--  
--  HOW TO USE:
--  1. Go to https://supabase.com → your project
--  2. Click "SQL Editor" in the left sidebar
--  3. Paste this entire file and click "Run"
--  That's it — all your tables are created.
-- ============================================================

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name    TEXT,
  last_name     TEXT,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── User settings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES users(id) ON DELETE CASCADE,
  account_balance     NUMERIC DEFAULT 10000,
  risk_per_trade      NUMERIC DEFAULT 1,
  daily_loss_limit    NUMERIC DEFAULT 500,
  weekly_drawdown     NUMERIC DEFAULT 1500,
  max_trades_per_day  INTEGER DEFAULT 5,
  sync_frequency      TEXT DEFAULT '15min',
  accent_color        TEXT DEFAULT '#378ADD',
  compact_mode        BOOLEAN DEFAULT FALSE,
  show_cents          BOOLEAN DEFAULT TRUE,
  currency            TEXT DEFAULT 'USD',
  timezone            TEXT DEFAULT 'America/New_York',
  notif_sync          BOOLEAN DEFAULT TRUE,
  notif_loss_alert    BOOLEAN DEFAULT TRUE,
  notif_ai_insight    BOOLEAN DEFAULT TRUE,
  notif_goal          BOOLEAN DEFAULT FALSE,
  notif_weekly        BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ── Trades ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Core trade data
  symbol          TEXT NOT NULL,
  direction       TEXT NOT NULL CHECK (direction IN ('Long', 'Short')),
  quantity        NUMERIC NOT NULL,
  entry_price     NUMERIC NOT NULL,
  exit_price      NUMERIC,
  stop_loss       NUMERIC,
  commission      NUMERIC DEFAULT 0,

  -- Calculated
  pnl             NUMERIC,
  rr              NUMERIC,

  -- Classification
  setup           TEXT,
  instrument      TEXT DEFAULT 'Stock',
  broker          TEXT DEFAULT 'manual',
  broker_order_id TEXT,

  -- Options fields
  option_type     TEXT,
  strike_price    NUMERIC,
  expiry_date     DATE,

  -- Journal
  emotion         TEXT,
  tags            TEXT[],
  notes           TEXT,

  -- Timestamps
  trade_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time      TIMESTAMPTZ,
  exit_time       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Playbooks ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  rules       TEXT,
  color       TEXT DEFAULT '#378ADD',
  active      BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Goals ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  month           TEXT NOT NULL,   -- e.g. "2025-05"
  pnl_target      NUMERIC,
  win_rate_target NUMERIC,
  max_trades      INTEGER,
  profit_factor   NUMERIC,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Broker connections ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS broker_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
  broker           TEXT NOT NULL,
  access_token     TEXT,
  refresh_token    TEXT,
  token_expiry     TIMESTAMPTZ,
  account_mask     TEXT,
  last_sync        TIMESTAMPTZ,
  connected        BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, broker)
);

-- ── Indexes for fast queries ──────────────────────────────────
CREATE INDEX IF NOT EXISTS trades_user_id_idx    ON trades(user_id);
CREATE INDEX IF NOT EXISTS trades_date_idx       ON trades(trade_date);
CREATE INDEX IF NOT EXISTS trades_symbol_idx     ON trades(symbol);
CREATE INDEX IF NOT EXISTS trades_broker_idx     ON trades(broker);

-- ── Row Level Security (RLS) — users only see their own data ──
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades             ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbooks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_connections ENABLE ROW LEVEL SECURITY;

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
