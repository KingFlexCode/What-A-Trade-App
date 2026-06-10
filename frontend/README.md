# WhatATrade! — Frontend

React 18 trading journal. Connects to the `whatatrade-backend` Node.js server.

## Quick start

```bash
npm install
npm run dev        # → http://localhost:3000
```

Make sure the backend is running on http://localhost:3001 first.

## Build for production

```bash
npm run build      # output → /dist
```

Deploy `/dist` to Vercel, Netlify, or any static host.

## Tech stack

| | |
|---|---|
| React 18 | UI library |
| React Router v6 | Page routing |
| Zustand | Global state |
| Recharts | Charts |
| Tailwind CSS | Styling |
| Axios | API calls |
| Vite | Dev server + bundler |

## Project structure

```
src/
├── components/
│   ├── ui/
│   │   ├── index.jsx       # Button, Badge, Panel, Toggle, KPICard…
│   │   └── Logo.jsx        # WhatATrade! wordmark + pulse underline (Logo E)
│   └── layout/
│       ├── AppLayout.jsx   # Sidebar + topbar
│       └── NotificationPanel.jsx
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── OnboardingPage.jsx  # 4-step wizard
│   ├── DashboardPage.jsx
│   ├── TradesPage.jsx
│   ├── TradeDetailPage.jsx
│   ├── LogTradePage.jsx    # Live Finnhub quote lookup
│   ├── CalendarPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── RiskPage.jsx
│   ├── InsightsPage.jsx
│   ├── PlaybooksPage.jsx
│   ├── BrokersPage.jsx
│   └── SettingsPage.jsx
├── store/useStore.js       # Zustand — trades, auth, settings, brokers
├── services/api.js         # All API calls
└── utils/helpers.js        # Formatting helpers
```

## Broker connections

- **thinkorswim** — Schwab OAuth (add keys to backend `.env`)
- **Webull** — Webull OpenAPI OAuth (add keys to backend `.env`)
- **Robinhood** — CSV import
- **SoFi** — CSV import

See `whatatrade-backend/README.md` for broker setup.
