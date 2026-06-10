# WhatATrade! 🚀

> *Log the trades worth talking about.*

**WhatATrade!** is a modern, AI-powered trading journal built for serious traders. Track every trade, analyse your patterns, manage your risk, and improve your performance — all in a beautifully designed app.

---

## Why WhatATrade! beats the competition

| | WhatATrade! | TradeZella | TraderSync | Edgewonk |
|---|---|---|---|---|
| Price | **$14/mo** | $49/mo | $79/mo | $197/yr |
| Design | **Beautiful** | OK | Dated | Old |
| AI insights | **All plans** | All plans | $79 plan only | Weekly email |
| Mobile app | **Yes (RN)** | No | No | No |
| Broker auto-sync | **TOS + Webull** | 500+ | 700+ | Limited |
| Personality | **WhatATrade!** | Generic | Generic | Generic |

---

## Repo structure

```
whatatrade/
├── frontend/          React 18 web app (Vite + Tailwind)
├── backend/           Node.js + Express API server
└── README.md          You are here
```

---

## Quick start

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/whatatrade.git
cd whatatrade
```

### 2. Start the backend
```bash
cd backend
cp .env.example .env        # fill in your values
npm install
npm run dev                  # runs on http://localhost:3001
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev                  # runs on http://localhost:3000
```

Open `http://localhost:3000` — you'll see the WhatATrade! login screen.

---

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
# Required
SESSION_SECRET=your-long-random-secret

# Optional — add when you create developer accounts
SCHWAB_CLIENT_ID=...         # from developer.schwab.com
SCHWAB_CLIENT_SECRET=...
WEBULL_APP_KEY=...            # from developer.webull.com
WEBULL_APP_SECRET=...
```

The app runs fine without broker credentials — those features just show a "coming soon" message until you add the keys.

---

## Tech stack

### Frontend
- **React 18** — UI library
- **React Router v6** — client-side routing
- **Zustand** — global state management
- **Recharts** — charts (equity curve, P&L bars, donut)
- **Tailwind CSS** — utility-first styling
- **Axios** — HTTP client
- **date-fns** — date formatting
- **Vite** — dev server + bundler

### Backend
- **Node.js + Express** — API server
- **express-session** — session management
- **Axios** — broker API calls
- **csv-parse** — CSV file parsing
- **multer** — file upload handling

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | KPIs, equity curve, broker status, recent trades |
| `/trades` | Trade log | Filterable table with all trades |
| `/trades/:id` | Trade detail | Full breakdown, chart, journal editor |
| `/log` | Log trade | Add a new trade with live Finnhub quote lookup |
| `/calendar` | Calendar | Monthly P&L calendar view |
| `/analytics` | Analytics | Hourly P&L, setup win rates, instrument breakdown |
| `/risk` | Risk mgmt | Daily loss limit, position sizer, parameters |
| `/insights` | AI insights | Claude-powered pattern detection |
| `/playbooks` | Playbooks | Trading strategy cards with per-setup stats |
| `/brokers` | Brokers | TOS + Webull sync, Robinhood + SoFi CSV import |
| `/settings` | Settings | Profile, notifications, sync, appearance, risk rules |
| `/login` | Login | Email or broker SSO |
| `/signup` | Signup | Create account + plan selection |
| `/onboarding` | Onboarding | 4-step setup wizard |

---

## API endpoints

### Auth — broker OAuth
```
GET  /auth/schwab/connect      → redirect to Schwab login
GET  /auth/schwab/callback     → OAuth callback
POST /auth/schwab/sync         → pull latest thinkorswim trades
POST /auth/schwab/disconnect

GET  /auth/webull/connect      → redirect to Webull login
GET  /auth/webull/callback     → OAuth callback
POST /auth/webull/sync         → pull latest Webull trades
POST /auth/webull/disconnect
```

### CSV import
```
POST /import/csv/upload        → upload CSV (field: file + broker)
  broker values: robinhood | sofi | thinkorswim | webull | auto
```

### Trades
```
GET    /trades                 → list (filters: ?broker= ?symbol= ?from= ?to=)
POST   /trades                 → add one or many
PATCH  /trades/:id             → update journal fields
DELETE /trades/:id             → delete
GET    /trades/summary         → win rate, P&L, profit factor
```

### Status
```
GET /health                    → server health + credential check
GET /status                    → connected brokers + last sync times
```

---

## Broker setup

### thinkorswim (Schwab)
1. Create free account at [developer.schwab.com](https://developer.schwab.com)
2. Register a new app
3. Set redirect URI: `http://localhost:3001/auth/schwab/callback`
4. Add `SCHWAB_CLIENT_ID` + `SCHWAB_CLIENT_SECRET` to `.env`

### Webull
1. Create free account at [developer.webull.com](https://developer.webull.com)
2. Register app under the **Connect API** tier
3. Set redirect URI: `http://localhost:3001/auth/webull/callback`
4. Add `WEBULL_APP_KEY` + `WEBULL_APP_SECRET` to `.env`

### Robinhood + SoFi
CSV import only (no public API available). Users export from their broker app and upload.

---

## Live quote lookup (Finnhub)

The Log Trade page has a live price lookup powered by Finnhub's free API.

1. Create free account at [finnhub.io](https://finnhub.io)
2. Copy your API key
3. Paste it into the Log Trade page — that's it, no config needed

Free tier: 60 requests/minute — more than enough for looking up prices.

---

## Roadmap

- [ ] PostgreSQL database (swap in-memory store)
- [ ] JWT authentication (replace mock auth)
- [ ] React Native mobile app (iOS + Android)
- [ ] Claude AI coach (conversational insights on your trade data)
- [ ] Landing page (marketing site)
- [ ] CSV export
- [ ] Trade screenshot uploads
- [ ] Prop firm account support

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## License

MIT — do whatever you want with it.

---

*WhatATrade! — Log the trades worth talking about.*
