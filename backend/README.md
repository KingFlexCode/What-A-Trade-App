# WhatATrade! — Backend

Node.js/Express backend for the WhatATrade! trading journal.
Handles broker OAuth sync, CSV import, and the unified trade store.

## Quick start

```bash
cp .env.example .env   # fill in your broker keys when ready
npm install
npm run dev            # → http://localhost:3001
```

## Health check

```bash
curl http://localhost:3001/health
```

## API endpoints

### Broker OAuth
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/schwab/connect` | Redirect to Schwab login |
| GET | `/auth/schwab/callback` | OAuth callback |
| POST | `/auth/schwab/sync` | Pull latest trades |
| POST | `/auth/schwab/disconnect` | Disconnect |
| GET | `/auth/webull/connect` | Redirect to Webull login |
| GET | `/auth/webull/callback` | OAuth callback |
| POST | `/auth/webull/sync` | Pull latest trades |
| POST | `/auth/webull/disconnect` | Disconnect |

### CSV import
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/import/csv/upload` | Upload CSV (`file` + `broker` fields) |

Supported broker values: `robinhood` `sofi` `thinkorswim` `webull` `auto`

### Trades
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/trades` | List trades (`?broker=` `?symbol=` `?from=` `?to=`) |
| POST | `/trades` | Add one or many trades |
| PATCH | `/trades/:id` | Update journal fields |
| DELETE | `/trades/:id` | Delete a trade |
| GET | `/trades/summary` | Win rate, P&L, profit factor |

## Setting up broker credentials

### thinkorswim (Schwab)
1. https://developer.schwab.com → register free app
2. Set redirect URI: `http://localhost:3001/auth/schwab/callback`
3. Add `SCHWAB_CLIENT_ID` + `SCHWAB_CLIENT_SECRET` to `.env`

### Webull
1. https://developer.webull.com → register free app (Connect API tier)
2. Set redirect URI: `http://localhost:3001/auth/webull/callback`
3. Add `WEBULL_APP_KEY` + `WEBULL_APP_SECRET` to `.env`
