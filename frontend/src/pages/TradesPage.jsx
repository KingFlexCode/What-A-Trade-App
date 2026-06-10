// ── TradesPage ────────────────────────────────────────────────
import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { Panel, Badge, Button, EmptyState } from '../components/ui'
import { fmtPnl, fmtPrice, fmtDateShort } from '../utils/helpers'

export function TradesPage() {
  const { trades } = useStore()
  const navigate   = useNavigate()
  const [filters, setFilters] = useState({ setup: '', direction: '', result: '', from: '', to: '' })

  const filtered = useMemo(() => {
    return trades.filter((t) => {
      if (filters.setup     && t.setup     !== filters.setup)     return false
      if (filters.direction && t.direction !== filters.direction) return false
      if (filters.result === 'winners' && t.pnl <= 0)            return false
      if (filters.result === 'losers'  && t.pnl > 0)             return false
      if (filters.from && t.date < filters.from)                  return false
      if (filters.to   && t.date > filters.to)                    return false
      return true
    })
  }, [trades, filters])

  function setF(k) { return (e) => setFilters((p) => ({ ...p, [k]: e.target.value })) }

  const setups = [...new Set(trades.map((t) => t.setup))].filter(Boolean)

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <select value={filters.setup}     onChange={setF('setup')}     className="w-auto text-[12px] px-3 py-1.5">
          <option value="">All setups</option>
          {setups.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={filters.direction} onChange={setF('direction')} className="w-auto text-[12px] px-3 py-1.5">
          <option value="">All directions</option>
          <option>Long</option><option>Short</option>
        </select>
        <select value={filters.result}    onChange={setF('result')}    className="w-auto text-[12px] px-3 py-1.5">
          <option value="">All results</option>
          <option value="winners">Winners</option>
          <option value="losers">Losers</option>
        </select>
        <input type="date" value={filters.from} onChange={setF('from')} className="w-auto text-[12px] px-3 py-1.5" />
        <input type="date" value={filters.to}   onChange={setF('to')}   className="w-auto text-[12px] px-3 py-1.5" />
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[var(--txt-2)]">{filtered.length} trades</span>
          <Button variant="ghost" size="sm"><i className="ti ti-download text-[12px]" /> Export CSV</Button>
        </div>
      </div>

      <Panel>
        {filtered.length === 0 ? (
          <EmptyState icon="search" title="No trades match your filters" body="Try adjusting the filters above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[12px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Date','Symbol','Side','Setup','Qty','Entry','Exit','P&L','R:R','Emotion','Broker'].map((h) => (
                    <th key={h} className="px-3 py-2 text-left text-[10px] font-medium text-[var(--txt-2)] uppercase tracking-[0.07em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/trades/${t.id}`)}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-3)] cursor-pointer transition-colors">
                    <td className="px-3 py-2.5 text-[var(--txt-2)] text-[11.5px] whitespace-nowrap">{fmtDateShort(t.date)}</td>
                    <td className="px-3 py-2.5 font-medium">{t.symbol}</td>
                    <td className="px-3 py-2.5"><Badge variant={t.direction === 'Long' ? 'long' : 'short'}>{t.direction}</Badge></td>
                    <td className="px-3 py-2.5"><Badge variant="setup">{t.setup}</Badge></td>
                    <td className="px-3 py-2.5 font-mono text-[11.5px]">{t.qty}</td>
                    <td className="px-3 py-2.5 font-mono text-[11.5px]">{fmtPrice(t.entry)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11.5px]">{fmtPrice(t.exit)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11.5px]" style={{ color: t.pnl >= 0 ? 'var(--green)' : 'var(--red)' }}>{fmtPnl(t.pnl)}</td>
                    <td className="px-3 py-2.5 font-mono text-[11.5px]" style={{ color: t.rr >= 0 ? 'var(--green)' : 'var(--red)' }}>{t.rr > 0 ? '+' : ''}{t.rr?.toFixed(1)}R</td>
                    <td className="px-3 py-2.5 text-[11.5px]">{t.emotion}</td>
                    <td className="px-3 py-2.5"><Badge variant="neutral" className="text-[10px] capitalize">{t.broker}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}

export default TradesPage
