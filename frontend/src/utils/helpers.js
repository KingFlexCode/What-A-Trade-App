import { format, parseISO } from 'date-fns'

// Format a dollar amount
export function fmtPnl(value, showCents = true) {
  if (value === null || value === undefined) return '—'
  const abs  = Math.abs(value)
  const sign = value >= 0 ? '+' : '-'
  const str  = showCents
    ? abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : abs.toLocaleString('en-US', { maximumFractionDigits: 0 })
  return `${sign}$${str}`
}

// Format a price
export function fmtPrice(value) {
  if (!value && value !== 0) return '—'
  return '$' + Number(value).toFixed(2)
}

// Format a date string
export function fmtDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' && dateStr.length === 10
      ? parseISO(dateStr)
      : new Date(dateStr)
    return format(d, 'MMM d, yyyy')
  } catch { return dateStr }
}

// Format a short date
export function fmtDateShort(dateStr) {
  if (!dateStr) return '—'
  try {
    const d = typeof dateStr === 'string' && dateStr.length === 10
      ? parseISO(dateStr)
      : new Date(dateStr)
    return format(d, 'MMM d')
  } catch { return dateStr }
}

// Compute P&L from trade fields
export function computePnl({ direction, quantity, entry, exit, commission = 0 }) {
  if (!exit || !entry || !quantity) return null
  const gross = direction === 'Long'
    ? (exit - entry) * quantity
    : (entry - exit) * quantity
  return parseFloat((gross - commission).toFixed(2))
}

// Compute R:R
export function computeRR({ direction, entry, exit, stopLoss }) {
  if (!exit || !entry || !stopLoss) return null
  const risk   = Math.abs(entry - stopLoss)
  const reward = Math.abs(exit - entry)
  if (risk === 0) return null
  return parseFloat((reward / risk).toFixed(2))
}

// Color class by P&L sign
export function pnlColor(value) {
  if (value === null || value === undefined) return 'text-[var(--txt-1)]'
  return value >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'
}

// Group trades by date for calendar
export function groupByDate(trades) {
  return trades.reduce((acc, t) => {
    const key = t.date?.slice(0, 10) || ''
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {})
}

// Clamp a number between min and max
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}
