// ── CalendarPage ──────────────────────────────────────────────
import React, { useMemo, useState } from 'react'
import { useStore } from '../store/useStore'
import { Panel } from '../components/ui'
import { fmtPnl, groupByDate } from '../utils/helpers'
import clsx from 'clsx'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'

export function CalendarPage() {
  const { trades } = useStore()
  const [month, setMonth] = useState(new Date(2025, 4, 1)) // May 2025
  const byDate = useMemo(() => groupByDate(trades), [trades])

  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const firstDow = (getDay(days[0]) + 6) % 7 // Monday = 0

  const monthPnl = days.reduce((s, d) => {
    const key   = format(d, 'yyyy-MM-dd')
    const dayPnl = (byDate[key] || []).reduce((a, t) => a + (t.pnl || 0), 0)
    return s + dayPnl
  }, 0)

  return (
    <Panel title={`${format(month, 'MMMM yyyy')}`}
      action={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono" style={{ color: monthPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtPnl(monthPnl)} net</span>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1))} className="btn-ghost px-2 py-1 rounded-lg border border-[var(--border-2)] text-[var(--txt-1)] text-[12px]">‹</button>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1))} className="btn-ghost px-2 py-1 rounded-lg border border-[var(--border-2)] text-[var(--txt-1)] text-[12px]">›</button>
        </div>
      }>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
            <div key={d} className="text-center text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day) => {
            const key    = format(day, 'yyyy-MM-dd')
            const dayTrades = byDate[key] || []
            const dayPnl = dayTrades.reduce((s, t) => s + (t.pnl || 0), 0)
            const hasData = dayTrades.length > 0
            return (
              <div key={key}
                className={clsx(
                  'rounded-lg p-1.5 min-h-[52px] flex flex-col items-center border transition-all cursor-pointer',
                  hasData && dayPnl > 0 ? 'bg-[var(--green-dim)] border-[var(--green-border)] hover:bg-[rgba(34,216,122,0.15)]' :
                  hasData && dayPnl < 0 ? 'bg-[var(--red-dim)]   border-[var(--red-border)]   hover:bg-[rgba(240,91,107,0.15)]' :
                  'border-transparent hover:border-[var(--border)]'
                )}>
                <div className="text-[11px]" style={{ color: hasData ? (dayPnl > 0 ? 'var(--green)' : 'var(--red)') : 'var(--txt-2)' }}>
                  {format(day, 'd')}
                </div>
                {hasData && (
                  <>
                    <div className="text-[10px] font-mono mt-0.5" style={{ color: dayPnl >= 0 ? 'var(--green)' : 'var(--red)' }}>
                      {dayPnl >= 0 ? '+' : ''}${Math.abs(dayPnl)}
                    </div>
                    <div className="text-[9px] text-[var(--txt-2)]">{dayTrades.length}t</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Panel>
  )
}

// ── AnalyticsPage ─────────────────────────────────────────────
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export function AnalyticsPage() {
  const { trades } = useStore()

  const setups = useMemo(() => {
    const map = {}
    trades.forEach((t) => {
      if (!t.setup) return
      if (!map[t.setup]) map[t.setup] = { wins:0, total:0, pnl:0 }
      map[t.setup].total++
      map[t.setup].pnl += t.pnl || 0
      if (t.pnl > 0) map[t.setup].wins++
    })
    return Object.entries(map).map(([name, d]) => ({ name, winRate: Math.round(d.wins/d.total*100), pnl: Math.round(d.pnl), trades: d.total }))
  }, [trades])

  const hourly = useMemo(() => {
    const map = {}
    trades.forEach((t) => { const h = 9+Math.floor(Math.random()*7); map[h] = (map[h]||0)+(t.pnl||0) })
    return Object.entries(map).sort(([a],[b])=>+a-+b).map(([h,v]) => ({ hour: `${h}am`, value: Math.round(v) }))
  }, [trades])

  const instruments = [
    { name:'Stocks', value:55, pnl:3120, fill:'#5b8af0' },
    { name:'ETFs',   value:25, pnl:1210, fill:'#22d87a' },
    { name:'Futures',value:20, pnl:500,  fill:'#a78bfa' },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Panel title="P&L by hour of day">
          <div className="p-4 pt-3">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={hourly} barSize={18}>
                <XAxis dataKey="hour" tick={{ fontSize:10, fill:'#5c6285' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v) => [`${v>=0?'+':''}$${Math.abs(v)}`, 'P&L']} contentStyle={{ background:'var(--bg-3)', border:'1px solid var(--border-2)', borderRadius:8, fontFamily:'DM Mono', fontSize:11 }} />
                <Bar dataKey="value" radius={[4,4,0,0]}
                  shape={(props) => { const {x,y,width,height,value}=props; const h=Math.abs(height); const yy=value>=0?y:y+height; return <rect x={x} y={yy} width={width} height={h} rx={4} fill={value>=0?'#22d87a':'#f05b6b'} fillOpacity={0.8} /> }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="By instrument">
          <div className="p-4 pt-3 flex items-center gap-6">
            <PieChart width={100} height={100}>
              <Pie data={instruments} cx={50} cy={50} innerRadius={30} outerRadius={48} dataKey="value" paddingAngle={2}>
                {instruments.map((e) => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
            </PieChart>
            <div className="flex flex-col gap-2 flex-1">
              {instruments.map((inst) => (
                <div key={inst.name} className="flex items-center gap-2 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: inst.fill }} />
                  <span className="text-[var(--txt-1)] flex-1">{inst.name}</span>
                  <span className="font-mono text-[var(--green)]">+${inst.pnl.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Performance by setup">
        <div className="p-4 space-y-3">
          {setups.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="text-[12.5px] text-[var(--txt-1)] min-w-[120px]">{s.name}</span>
              <div className="flex-1 h-1.5 bg-[var(--bg-4)] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width:`${s.winRate}%`, background: s.winRate>=60?'var(--green)':'var(--amber)' }} />
              </div>
              <span className="text-[11.5px] font-mono text-[var(--txt-2)] min-w-[30px]">{s.winRate}%</span>
              <span className="text-[11.5px] font-mono min-w-[60px] text-right" style={{ color:'var(--green)' }}>+${s.pnl}</span>
              <span className="text-[11px] text-[var(--txt-2)]">{s.trades}t</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

// ── RiskPage ──────────────────────────────────────────────────
export function RiskPage() {
  const { settings, updateSettings } = useStore()
  const [ps, setPs] = useState({ entry: '', stop: '' })
  const riskAmt  = settings.accountBalance * (settings.riskPerTrade / 100)
  const stopDist = ps.stop && ps.entry ? Math.abs(+ps.entry - +ps.stop) : 0
  const shares   = stopDist > 0 ? Math.floor(riskAmt / stopDist) : null
  const posSize  = shares ? (shares * +ps.entry).toFixed(2) : null

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <Panel title="Daily loss limit">
          <div className="p-4">
            <div className="text-[11px] text-[var(--txt-2)] mb-1">Today's P&L</div>
            <div className="text-[22px] font-medium font-mono text-[var(--green)] mb-3">+$740</div>
            <div className="h-1.5 bg-[var(--bg-4)] rounded-full overflow-hidden mb-1.5">
              <div className="h-full rounded-full bg-[var(--green)]" style={{ width:'15%' }} />
            </div>
            <div className="flex justify-between text-[10.5px] text-[var(--txt-2)]">
              <span>$0</span><span>Limit: -${settings.dailyLossLimit}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Position sizer">
          <div className="p-4 space-y-2.5">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Entry price</label>
              <input type="number" step="0.01" placeholder="185.00" value={ps.entry} onChange={(e) => setPs((p) => ({...p, entry: e.target.value}))} />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Stop loss</label>
              <input type="number" step="0.01" placeholder="182.50" value={ps.stop} onChange={(e) => setPs((p) => ({...p, stop: e.target.value}))} />
            </div>
            {shares && (
              <div className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-3 text-[11.5px] space-y-1.5">
                <div className="flex justify-between"><span className="text-[var(--txt-2)]">Max risk</span><span className="font-mono text-[var(--red)]">${riskAmt.toFixed(0)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--txt-2)]">Shares</span><span className="font-mono text-[var(--txt-0)]">{shares}</span></div>
                <div className="flex justify-between"><span className="text-[var(--txt-2)]">Position size</span><span className="font-mono text-[var(--accent)]">${posSize}</span></div>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Risk parameters">
          <div className="p-4 space-y-3 text-[12.5px]">
            {[
              ['Account balance','$'+settings.accountBalance.toLocaleString()],
              ['Risk per trade', settings.riskPerTrade+'%'],
              ['Daily loss limit','$'+settings.dailyLossLimit],
              ['Weekly drawdown','$'+settings.weeklyDrawdown],
              ['Max trades/day', settings.maxTradesPerDay],
            ].map(([l,v]) => (
              <div key={l} className="flex justify-between border-b border-[var(--border)] pb-2 last:border-0 last:pb-0">
                <span className="text-[var(--txt-2)]">{l}</span>
                <span className="font-mono text-[var(--txt-0)]">{v}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}

// ── InsightsPage ──────────────────────────────────────────────
const INSIGHTS = [
  { type:'pos',  icon:'trending-up',    title:'Breakout trades are your edge', body:'71% win rate, 2.3R average. Increase size on these when P&L is positive and you are feeling focused.' },
  { type:'neg',  icon:'clock',          title:'Avoid trading between 12–1pm',  body:'Consistent losses during the lunch hour. You have lost $340 net in this window over the last 30 days. Step away.' },
  { type:'warn', icon:'mood-nervous',   title:'FOMO trades cost $1,200/month', body:'Trades tagged "FOMO" have a 31% win rate — 2.3× worse than your average. A 5-minute entry rule could save $1,200/mo.' },
  { type:'info', icon:'bulb',           title:'Oversizing on losing days',      body:'After a loss, your average position size increases 34%. Cap to 0.5% risk after any losing trade.' },
]
const COLORS = { pos:'var(--green)', neg:'var(--red)', warn:'var(--amber)', info:'var(--accent)' }
const BG     = { pos:'var(--green-dim)', neg:'var(--red-dim)', warn:'var(--amber-dim)', info:'var(--accent-dim)' }

export function InsightsPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-xl bg-[var(--accent-dim)] border border-[var(--accent-border)] flex items-center justify-center">
          <i className="ti ti-brain text-[16px] text-[var(--accent)]" />
        </div>
        <div>
          <div className="text-[13.5px] font-medium text-[var(--txt-0)]">AI trade analysis</div>
          <div className="text-[11.5px] text-[var(--txt-2)]">Powered by Claude · Updated May 19</div>
        </div>
        <button onClick={() => {}} className="ml-auto text-[12px] px-3 py-1.5 rounded-lg border border-[var(--border-2)] text-[var(--txt-1)] hover:bg-[var(--bg-3)] transition-all">
          Re-analyze
        </button>
      </div>

      <div className="space-y-3">
        {INSIGHTS.map((ins) => (
          <div key={ins.title} className="flex gap-3 p-4 bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: BG[ins.type] }}>
              <i className={`ti ti-${ins.icon} text-[15px]`} style={{ color: COLORS[ins.type] }} />
            </div>
            <div>
              <div className="text-[13px] font-medium text-[var(--txt-0)] mb-1">{ins.title}</div>
              <div className="text-[12px] text-[var(--txt-1)] leading-relaxed">{ins.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── PlaybooksPage ─────────────────────────────────────────────
const PB_DATA = [
  { name:'Breakout',       desc:'Trade momentum breakouts above key resistance with volume confirmation.',     wr:71, trades:24, rr:'2.3R', color:'#22d87a' },
  { name:'VWAP bounce',    desc:'Fade intraday moves when price reverts to VWAP in the first 90 minutes.',   wr:60, trades:18, rr:'1.8R', color:'#5b8af0' },
  { name:'Trend follow',   desc:'Enter pullbacks in the direction of the dominant intraday trend.',           wr:75, trades:12, rr:'2.7R', color:'#a78bfa' },
  { name:'Mean reversion', desc:'Short extended moves when RSI > 80 or price is > 2 ATR from VWAP.',         wr:55, trades:9,  rr:'1.5R', color:'#f0b45b' },
]

export function PlaybooksPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-[12.5px] text-[var(--txt-2)]">Define your setups. Track each strategy independently.</div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-[12.5px] font-medium hover:bg-[var(--accent-hover)] transition-all">
          <i className="ti ti-plus text-[13px]" /> New playbook
        </button>
      </div>
      <div className="space-y-3">
        {PB_DATA.map((pb) => (
          <div key={pb.name} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-4 cursor-pointer hover:border-[var(--border-2)] transition-all">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pb.color }} />
              <div className="text-[13.5px] font-medium text-[var(--txt-0)]">{pb.name}</div>
            </div>
            <div className="text-[12px] text-[var(--txt-2)] mb-3 leading-relaxed">{pb.desc}</div>
            <div className="flex gap-5 text-[11.5px]">
              <span className="text-[var(--txt-2)]">Win rate <span className="font-mono" style={{ color: pb.wr>=60?'var(--green)':'var(--amber)' }}>{pb.wr}%</span></span>
              <span className="text-[var(--txt-2)]">Trades <span className="font-mono text-[var(--txt-0)]">{pb.trades}</span></span>
              <span className="text-[var(--txt-2)]">Avg R <span className="font-mono text-[var(--txt-0)]">{pb.rr}</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── BrokersPage ───────────────────────────────────────────────
export function BrokersPage() {
  const { brokers, updateBroker } = useStore()
  const [syncing, setSyncing] = useState({})

  async function sync(name) {
    setSyncing((p) => ({...p, [name]: true}))
    await new Promise((r) => setTimeout(r, 1500))
    updateBroker(name, { lastSync: new Date().toISOString() })
    setSyncing((p) => ({...p, [name]: false}))
  }

  const BROKER_META = {
    thinkorswim: { label:'thinkorswim', short:'ToS', color:'#7b6eff', bg:'#4e2eff22', method:'OAuth · Schwab API' },
    webull:      { label:'Webull',      short:'WB',  color:'#00b4d8', bg:'#00b4d822', method:'OAuth · Webull OpenAPI' },
    robinhood:   { label:'Robinhood',   short:'RH',  color:'#00c805', bg:'#00c80522', method:'CSV import' },
    sofi:        { label:'SoFi Invest', short:'SF',  color:'#ff7f50', bg:'#ff572222', method:'CSV import' },
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(brokers).map(([name, b]) => {
          const meta = BROKER_META[name]
          return (
            <div key={name} className="bg-[var(--bg-2)] border rounded-2xl overflow-hidden transition-all"
              style={{ borderColor: b.connected ? 'var(--green-border)' : 'var(--border)' }}>
              <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-bold font-mono flex-shrink-0"
                  style={{ background: meta.bg, color: meta.color }}>{meta.short}</div>
                <div className="flex-1">
                  <div className="text-[13.5px] font-semibold text-[var(--txt-0)]">{meta.label}</div>
                  <div className="text-[11px] text-[var(--txt-2)]">{meta.method}</div>
                </div>
                <span className="text-[10.5px] font-medium px-2.5 py-1 rounded-full border"
                  style={b.connected
                    ? { background:'var(--green-dim)', color:'var(--green)', borderColor:'var(--green-border)' }
                    : { background:'var(--bg-3)', color:'var(--txt-2)', borderColor:'var(--border)' }}>
                  {b.connected ? '● Live' : 'CSV only'}
                </span>
              </div>
              <div className="p-4">
                {b.connected ? (
                  <>
                    <div className="text-[11px] text-[var(--txt-2)] mb-0.5">Account {b.accountMask}</div>
                    <div className="text-[10.5px] font-mono text-[var(--txt-2)] mb-3">
                      Last sync: {b.lastSync ? new Date(b.lastSync).toLocaleString() : 'Never'}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => sync(name)} disabled={syncing[name]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] border transition-all"
                        style={{ background:'var(--green-dim)', color:'var(--green)', borderColor:'var(--green-border)' }}>
                        {syncing[name] ? <span className="spinner" /> : <i className="ti ti-refresh text-[12px]" />}
                        {syncing[name] ? 'Syncing…' : 'Sync now'}
                      </button>
                      <button onClick={() => updateBroker(name, { connected: false })}
                        className="px-3 py-1.5 rounded-lg text-[11.5px] border border-[var(--red-border)] text-[var(--red)] bg-[var(--red-dim)]">
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-[12px] text-[var(--txt-2)] mb-3">
                      {name === 'robinhood' || name === 'sofi' ? 'No public API — upload a CSV to import trades.' : 'Connect your account to auto-sync trades.'}
                    </div>
                    <div className="flex gap-2">
                      {name === 'thinkorswim' || name === 'webull' ? (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all">
                          <i className="ti ti-bolt text-[12px]" /> Connect
                        </button>
                      ) : (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all">
                          <i className="ti ti-upload text-[12px]" /> Import CSV
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── SettingsPage ──────────────────────────────────────────────
import { Toggle, Divider } from '../components/ui'

const SETTING_SECTIONS = ['Profile','Notifications','Sync','Appearance','Trading rules','Danger zone']

export function SettingsPage() {
  const { settings, updateSettings, user } = useStore()
  const [section, setSection] = useState('Profile')
  const [saved,   setSaved]   = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="grid grid-cols-[180px_1fr] gap-4">
      {/* Sidebar nav */}
      <div className="flex flex-col gap-0.5">
        {SETTING_SECTIONS.map((s) => (
          <button key={s} onClick={() => setSection(s)}
            className={clsx('text-left px-3 py-2 rounded-lg text-[13px] transition-all',
              section === s
                ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
                : s === 'Danger zone' ? 'text-[var(--red)] hover:bg-[var(--bg-3)]' : 'text-[var(--txt-2)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-1)]'
            )}>
            {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl p-5">

        {section === 'Profile' && (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-3">Account info</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div><label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">First name</label><input defaultValue="Jordan" /></div>
              <div><label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Last name</label><input defaultValue="Davis" /></div>
              <div className="col-span-2"><label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Email</label><input defaultValue={user?.email || 'jordan@example.com'} /></div>
              <div className="col-span-2"><label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">Timezone</label>
                <select><option>America/New_York (ET)</option><option>America/Chicago (CT)</option><option>America/Los_Angeles (PT)</option></select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all">
                {saved ? 'Saved ✓' : 'Save changes'}
              </button>
              <button className="px-3 py-1.5 rounded-lg text-[12.5px] border border-[var(--border-2)] text-[var(--txt-1)] hover:bg-[var(--bg-3)] transition-all">
                Change password
              </button>
            </div>
          </div>
        )}

        {section === 'Notifications' && (
          <div className="space-y-0">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-2">Push notifications</div>
            {[
              { key:'syncComplete',   label:'Broker sync complete',    sub:'When new trades are imported'       },
              { key:'dailyLossAlert', label:'Daily loss limit warning', sub:'Alert at 60% and 80% of daily limit'},
              { key:'aiInsight',      label:'New AI insight',           sub:'When a new pattern is detected'    },
              { key:'goalMilestone',  label:'Goal milestones',          sub:'At 50%, 75%, and 100% of goal'     },
              { key:'weeklyReport',   label:'Weekly report',            sub:'Summary every Sunday evening'      },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div><div className="text-[13px] text-[var(--txt-0)]">{n.label}</div><div className="text-[11.5px] text-[var(--txt-2)]">{n.sub}</div></div>
                <Toggle checked={settings.notifications[n.key]} onChange={(v) => updateSettings(`notifications.${n.key}`, v)} />
              </div>
            ))}
          </div>
        )}

        {section === 'Sync' && (
          <div className="space-y-0">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-2">Auto-sync schedule</div>
            {[
              { label:'Sync frequency', sub:'How often to pull new trades', control:<select className="w-auto"><option>Every 15 minutes</option><option>Every 30 minutes</option><option>Hourly</option><option>Manual only</option></select> },
            ].map((r) => (
              <div key={r.label} className="flex items-center justify-between py-3 border-b border-[var(--border)]">
                <div><div className="text-[13px] text-[var(--txt-0)]">{r.label}</div><div className="text-[11.5px] text-[var(--txt-2)]">{r.sub}</div></div>
                {r.control}
              </div>
            ))}
            {[
              { key:'syncMarketHours', label:'Sync during market hours only', sub:'9:30am – 4:00pm ET weekdays' },
              { key:'dedupe',          label:'Deduplicate trades',             sub:'Skip trades already in journal' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div><div className="text-[13px] text-[var(--txt-0)]">{n.label}</div><div className="text-[11.5px] text-[var(--txt-2)]">{n.sub}</div></div>
                <Toggle checked={true} onChange={() => {}} />
              </div>
            ))}
          </div>
        )}

        {section === 'Appearance' && (
          <div className="space-y-0">
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-2">Theme & display</div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div><div className="text-[13px] text-[var(--txt-0)]">Accent color</div></div>
              <div className="flex gap-2">
                {['#5b8af0','#22d87a','#a78bfa','#f0b45b','#f05b6b'].map((c) => (
                  <button key={c} onClick={() => updateSettings('appearance.accentColor', c)}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: settings.appearance.accentColor === c ? '#fff' : 'transparent' }} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div><div className="text-[13px] text-[var(--txt-0)]">Compact mode</div><div className="text-[11.5px] text-[var(--txt-2)]">Tighter row spacing in tables</div></div>
              <Toggle checked={settings.appearance.compactMode} onChange={(v) => updateSettings('appearance.compactMode', v)} />
            </div>
            <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
              <div><div className="text-[13px] text-[var(--txt-0)]">Show cents in P&L</div></div>
              <Toggle checked={settings.appearance.showCents} onChange={(v) => updateSettings('appearance.showCents', v)} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div><div className="text-[13px] text-[var(--txt-0)]">Default currency</div></div>
              <select className="w-auto"><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option></select>
            </div>
          </div>
        )}

        {section === 'Trading rules' && (
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-3">Risk parameters</div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label:'Account balance ($)',      key:'accountBalance' },
                { label:'Risk per trade (%)',        key:'riskPerTrade'  },
                { label:'Daily loss limit ($)',      key:'dailyLossLimit' },
                { label:'Weekly drawdown limit ($)', key:'weeklyDrawdown' },
                { label:'Max trades per day',        key:'maxTradesPerDay' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[10px] font-medium uppercase tracking-[0.07em] text-[var(--txt-2)] mb-1.5">{f.label}</label>
                  <input type="number" value={settings[f.key]} onChange={(e) => updateSettings(f.key, +e.target.value)} />
                </div>
              ))}
            </div>
            <button onClick={save} className="px-3 py-1.5 rounded-lg text-[12.5px] font-medium bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-all">
              {saved ? 'Saved ✓' : 'Save rules'}
            </button>
          </div>
        )}

        {section === 'Danger zone' && (
          <div className="space-y-3">
            {[
              { title:'Export all data',   sub:'Download a full CSV of all your trades and journal entries.',                              btn:'Export CSV',        cls:'ghost' },
              { title:'Clear all trades',  sub:'Permanently delete all trade data. This cannot be undone.',                               btn:'Clear all trades',  cls:'danger' },
              { title:'Delete account',    sub:'Permanently delete your account and all associated data.',                                 btn:'Delete my account', cls:'danger' },
            ].map((d) => (
              <div key={d.title} className="p-4 rounded-xl border border-[var(--red-border)] bg-[var(--red-dim)]">
                <div className="text-[13px] font-medium mb-1" style={{ color: d.cls==='danger'?'var(--red)':'var(--txt-0)' }}>{d.title}</div>
                <div className="text-[12px] text-[var(--txt-2)] mb-3">{d.sub}</div>
                <button className="px-3 py-1.5 rounded-lg text-[12px] border transition-all"
                  style={ d.cls==='danger'
                    ? { background:'var(--red-dim)', color:'var(--red)', borderColor:'var(--red-border)' }
                    : { background:'transparent', color:'var(--txt-1)', borderColor:'var(--border-2)' }}>
                  {d.btn}
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Default exports ───────────────────────────────────────────
export default TradesPage

import { useMemo } from 'react'

// Re-export named pages as defaults for the router
export { CalendarPage   as default } from './CalendarPage'
