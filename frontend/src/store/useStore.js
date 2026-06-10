import { create } from 'zustand'

// ── Sample trade data (replaced by real API data) ─────────────
const SAMPLE_TRADES = [
  { id:'1', date:'2025-05-19', symbol:'AAPL', direction:'Long',  setup:'Breakout',       qty:200, entry:182.50, exit:186.20, stopLoss:180.75, pnl:740,  rr:2.1,  emotion:'Confident', tags:['followed plan','gap play'],   notes:'Clean breakout above $182 on volume. Held full target.',     broker:'thinkorswim' },
  { id:'2', date:'2025-05-18', symbol:'NVDA', direction:'Short', setup:'Mean reversion',  qty:50,  entry:892.00, exit:875.50, stopLoss:900.00, pnl:825,  rr:3.2,  emotion:'Focused',   tags:['followed plan'],               notes:'Extended intraday move, faded into resistance.',              broker:'webull'       },
  { id:'3', date:'2025-05-17', symbol:'SPY',  direction:'Long',  setup:'VWAP bounce',     qty:100, entry:520.10, exit:518.40, stopLoss:519.00, pnl:-170, rr:-0.8, emotion:'FOMO',      tags:['early exit','oversize'],       notes:'Chased the move, poor entry timing.',                         broker:'robinhood'    },
  { id:'4', date:'2025-05-16', symbol:'QQQ',  direction:'Long',  setup:'Trend follow',    qty:150, entry:445.20, exit:448.90, stopLoss:443.50, pnl:555,  rr:1.9,  emotion:'Disciplined',tags:['followed plan'],              notes:'Textbook pullback entry in uptrend.',                         broker:'thinkorswim'  },
  { id:'5', date:'2025-05-15', symbol:'TSLA', direction:'Short', setup:'Breakout',        qty:75,  entry:178.60, exit:182.40, stopLoss:180.00, pnl:-285, rr:-1.2, emotion:'Greedy',    tags:['revenge trade','oversize'],    notes:'Went short too early, trend was still up.',                  broker:'sofi'         },
  { id:'6', date:'2025-05-14', symbol:'MSFT', direction:'Long',  setup:'VWAP bounce',     qty:100, entry:415.30, exit:419.80, stopLoss:413.50, pnl:450,  rr:2.4,  emotion:'Confident', tags:['followed plan','news catalyst'],notes:'Strong open, held VWAP, clean exit at target.',               broker:'thinkorswim'  },
  { id:'7', date:'2025-05-13', symbol:'AMZN', direction:'Long',  setup:'Trend follow',    qty:80,  entry:184.20, exit:188.50, stopLoss:182.50, pnl:344,  rr:1.7,  emotion:'Focused',   tags:['followed plan'],               notes:'Rode the afternoon momentum.',                                broker:'webull'       },
  { id:'8', date:'2025-05-12', symbol:'META', direction:'Long',  setup:'Breakout',        qty:60,  entry:472.10, exit:479.80, stopLoss:469.00, pnl:462,  rr:2.5,  emotion:'Confident', tags:['gap play','news catalyst'],    notes:'Post-earnings breakout, clean setup.',                        broker:'thinkorswim'  },
  { id:'9', date:'2025-05-09', symbol:'AMD',  direction:'Short', setup:'Mean reversion',  qty:120, entry:158.40, exit:154.20, stopLoss:161.00, pnl:504,  rr:1.6,  emotion:'Disciplined',tags:['followed plan'],              notes:'Extended above daily range, clean fade.',                     broker:'webull'       },
  { id:'10',date:'2025-05-08', symbol:'COIN', direction:'Long',  setup:'Breakout',        qty:100, entry:215.40, exit:221.80, stopLoss:212.50, pnl:640,  rr:2.2,  emotion:'Focused',   tags:['news catalyst','gap play'],   notes:'Crypto sentiment turned bullish, clean breakout.',           broker:'robinhood'    },
]

const SAMPLE_NOTIFICATIONS = [
  { id:'n1', type:'sync',    title:'thinkorswim synced',            body:'3 new trades imported',                  time:'2m ago',   read:false },
  { id:'n2', type:'risk',    title:'Daily loss limit at 60%',       body:'Consider stopping for today',             time:'1h ago',   read:false },
  { id:'n3', type:'insight', title:'New AI insight available',       body:'FOMO trades costing $1,200/mo',           time:'Yesterday',read:true  },
  { id:'n4', type:'goal',    title:'Monthly goal 97% complete!',    body:'$4,830 of $5,000 target reached',         time:'2d ago',   read:true  },
]

export const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────
  user: null,
  isAuthenticated: false,
  login: (userData) => set({ user: userData, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false, trades: [] }),

  // ── Onboarding ────────────────────────────────────────────
  onboardingComplete: false,
  completeOnboarding: () => set({ onboardingComplete: true }),

  // ── Trades ────────────────────────────────────────────────
  trades: SAMPLE_TRADES,
  addTrade: (trade) => set((s) => ({
    trades: [{ ...trade, id: Date.now().toString() }, ...s.trades],
  })),
  updateTrade: (id, updates) => set((s) => ({
    trades: s.trades.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),
  deleteTrade: (id) => set((s) => ({
    trades: s.trades.filter((t) => t.id !== id),
  })),
  importTrades: (newTrades) => set((s) => ({
    trades: [
      ...newTrades.map((t, i) => ({ ...t, id: `import-${Date.now()}-${i}` })),
      ...s.trades,
    ],
  })),

  // ── Broker connections ────────────────────────────────────
  brokers: {
    thinkorswim: { connected: true,  lastSync: '2025-05-19T09:47:00Z', accountMask: '****4821', method: 'oauth'  },
    webull:      { connected: true,  lastSync: '2025-05-19T09:47:00Z', accountMask: '****9203', method: 'oauth'  },
    robinhood:   { connected: false, lastSync: '2025-05-18T11:22:00Z', accountMask: null,        method: 'csv'   },
    sofi:        { connected: false, lastSync: '2025-05-15T15:05:00Z', accountMask: null,        method: 'csv'   },
  },
  updateBroker: (name, data) => set((s) => ({
    brokers: { ...s.brokers, [name]: { ...s.brokers[name], ...data } },
  })),

  // ── Notifications ─────────────────────────────────────────
  notifications: SAMPLE_NOTIFICATIONS,
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  })),
  addNotification: (n) => set((s) => ({
    notifications: [{ ...n, id: Date.now().toString(), read: false }, ...s.notifications],
  })),

  // ── Settings ──────────────────────────────────────────────
  settings: {
    accountBalance:   48220,
    riskPerTrade:     1,
    dailyLossLimit:   500,
    weeklyDrawdown:   1500,
    maxTradesPerDay:  5,
    syncFrequency:    '15min',
    notifications: {
      syncComplete:    true,
      dailyLossAlert:  true,
      aiInsight:       true,
      goalMilestone:   false,
      weeklyReport:    true,
    },
    appearance: {
      accentColor: '#5b8af0',
      compactMode: false,
      showCents:   true,
      currency:    'USD',
    },
  },
  updateSettings: (path, value) => set((s) => {
    const parts  = path.split('.')
    const newSettings = JSON.parse(JSON.stringify(s.settings))
    let   obj    = newSettings
    for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
    obj[parts[parts.length - 1]] = value
    return { settings: newSettings }
  }),

  // ── Computed helpers ──────────────────────────────────────
  getSummary: () => {
    const trades  = get().trades.filter((t) => t.exit && t.pnl !== null)
    const wins    = trades.filter((t) => t.pnl > 0)
    const losses  = trades.filter((t) => t.pnl <= 0)
    const netPnl  = trades.reduce((s, t) => s + t.pnl, 0)
    const avgWin  = wins.length   ? wins.reduce((s, t)   => s + t.pnl, 0) / wins.length   : 0
    const avgLoss = losses.length ? losses.reduce((s, t) => s + t.pnl, 0) / losses.length : 0
    return {
      total:        trades.length,
      wins:         wins.length,
      losses:       losses.length,
      winRate:      trades.length ? (wins.length / trades.length * 100).toFixed(1) : '0',
      netPnl:       netPnl.toFixed(2),
      avgWin:       avgWin.toFixed(2),
      avgLoss:      avgLoss.toFixed(2),
      profitFactor: avgLoss ? Math.abs(avgWin / avgLoss).toFixed(2) : 'N/A',
    }
  },
}))
