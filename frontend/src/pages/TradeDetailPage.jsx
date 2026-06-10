import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts'
import { useStore } from '../store/useStore'
import { Panel, Badge, Button, SectionLabel } from '../components/ui'
import { fmtPnl, fmtPrice, fmtDate } from '../utils/helpers'
import clsx from 'clsx'

const EMOTIONS = ['Confident','Focused','FOMO','Fearful','Greedy','Disciplined','Fatigued']
const ALL_TAGS  = ['followed plan','early exit','oversize','revenge trade','news catalyst','gap play','VWAP level','earnings play']

export default function TradeDetailPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { trades, updateTrade, deleteTrade } = useStore()
  const trade = trades.find((t) => t.id === id)

  const [notes,   setNotes]   = useState(trade?.notes   || '')
  const [emotion, setEmotion] = useState(trade?.emotion || '')
  const [tags,    setTags]    = useState(trade?.tags     || [])
  const [saved,   setSaved]   = useState(false)

  if (!trade) {
    return (
      <div className="text-center py-20 text-[var(--txt-2)]">
        Trade not found.
        <button onClick={() => navigate('/trades')} className="ml-2 text-[var(--accent)]">Go back</button>
      </div>
    )
  }

  // Fake mini price chart around entry/exit
  const priceData = Array.from({ length: 10 }, (_, i) => ({
    i,
    value: +(trade.entry + (trade.exit - trade.entry) * (i / 9) + (Math.random() - 0.5) * 0.5).toFixed(2),
  }))

  function toggleTag(tag) {
    setTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag])
  }

  function save() {
    updateTrade(id, { notes, emotion, tags })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleDelete() {
    if (window.confirm('Delete this trade?')) {
      deleteTrade(id)
      navigate('/trades')
    }
  }

  const isWin = trade.pnl > 0

  return (
    <div>
      {/* Back */}
      <button onClick={() => navigate('/trades')}
        className="flex items-center gap-1.5 text-[12.5px] text-[var(--txt-2)] hover:text-[var(--txt-0)] mb-4 transition-colors">
        <i className="ti ti-arrow-left text-[14px]" /> Back to trade log
      </button>

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div>
          <div className="text-[22px] font-semibold text-[var(--txt-0)]">{trade.symbol}</div>
          <div className="text-[12px] text-[var(--txt-2)]">
            {trade.direction} · {trade.setup} · {fmtDate(trade.date)} · via {trade.broker}
          </div>
        </div>
        <Badge variant={trade.direction === 'Long' ? 'long' : 'short'} className="mt-1">{trade.direction}</Badge>
        <div className="ml-auto text-right">
          <div className="text-[22px] font-medium font-mono" style={{ color: isWin ? 'var(--green)' : 'var(--red)' }}>
            {fmtPnl(trade.pnl)}
          </div>
          <div className="text-[11.5px] text-[var(--txt-2)]">{trade.rr > 0 ? '+' : ''}{trade.rr?.toFixed(1)}R</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-6 gap-2.5 mb-3">
        {[
          { label: 'Entry',    value: fmtPrice(trade.entry)  },
          { label: 'Exit',     value: fmtPrice(trade.exit)   },
          { label: 'Quantity', value: trade.qty               },
          { label: 'Stop loss',value: fmtPrice(trade.stopLoss), neg: true },
          { label: 'R:R',      value: `${trade.rr > 0 ? '+' : ''}${trade.rr?.toFixed(1)}R`, pos: isWin },
          { label: 'Commission',value: trade.commission ? `$${trade.commission}` : '$0.00' },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-[0.06em] text-[var(--txt-2)] mb-1.5">{s.label}</div>
            <div className="text-[17px] font-medium font-mono"
              style={{ color: s.pos ? 'var(--green)' : s.neg ? 'var(--red)' : 'var(--txt-0)' }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Executions */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Panel title="Price chart">
          <div className="p-4 pt-3">
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={priceData}>
                <defs>
                  <linearGradient id="tcGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={isWin ? '#22d87a' : '#f05b6b'} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={isWin ? '#22d87a' : '#f05b6b'} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis hide /><YAxis hide />
                <Tooltip formatter={(v) => [`$${v}`, 'Price']} contentStyle={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke={isWin ? '#22d87a' : '#f05b6b'} strokeWidth={2} fill="url(#tcGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex justify-between text-[10.5px] font-mono mt-1">
              <span className="text-[var(--txt-2)]">Entry {fmtPrice(trade.entry)}</span>
              <span style={{ color: isWin ? 'var(--green)' : 'var(--red)' }}>Exit {fmtPrice(trade.exit)}</span>
            </div>
          </div>
        </Panel>

        <Panel title="Executions">
          <div className="p-4 py-3 space-y-0">
            {[
              { time:'9:42am', action:'BUY',  qty: Math.round(trade.qty/2), price: trade.entry - 0.02 },
              { time:'9:43am', action:'BUY',  qty: Math.round(trade.qty/2), price: trade.entry + 0.02 },
              { time:'10:12am',action:'SELL', qty: trade.qty,               price: trade.exit          },
            ].map((ex, i) => (
              <div key={i} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0 text-[12px]">
                <span className="text-[var(--txt-2)] font-mono min-w-[52px]">{ex.time}</span>
                <span className="font-medium" style={{ color: ex.action === 'BUY' ? 'var(--green)' : 'var(--red)' }}>{ex.action}</span>
                <span className="text-[var(--txt-1)]">{ex.qty} @ {fmtPrice(ex.price)}</span>
                <span className="ml-auto font-mono text-[var(--txt-0)]">{fmtPrice(ex.qty * ex.price)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Journal */}
      <Panel title="Journal & tags">
        <div className="p-4 space-y-4">
          <div>
            <SectionLabel>Emotion</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((e) => (
                <button key={e} onClick={() => setEmotion(e === emotion ? '' : e)}
                  className={clsx('px-3 py-1 rounded-full text-[11px] border transition-all',
                    emotion === e
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-[var(--bg-3)] text-[var(--txt-2)] border-[var(--border)] hover:text-[var(--txt-1)]'
                  )}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Tags</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={clsx('px-3 py-1 rounded-full text-[11px] border transition-all',
                    tags.includes(tag)
                      ? 'bg-[var(--accent-dim)] text-[var(--accent)] border-[var(--accent-border)]'
                      : 'bg-[var(--bg-3)] text-[var(--txt-2)] border-[var(--border)] hover:text-[var(--txt-1)]'
                  )}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <SectionLabel>Notes</SectionLabel>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
              className="resize-none"
              placeholder="What did you see? What happened? What will you do differently?" />
          </div>
          <div className="flex justify-between items-center pt-1">
            <Button variant="danger" size="sm" onClick={handleDelete}>
              <i className="ti ti-trash text-[12px]" /> Delete trade
            </Button>
            <div className="flex items-center gap-2">
              {saved && <span className="text-[11.5px] text-[var(--green)]">Saved ✓</span>}
              <Button variant="accent" size="sm" onClick={save}>
                <i className="ti ti-check text-[12px]" /> Save journal
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}
