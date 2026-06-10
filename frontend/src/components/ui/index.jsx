import React from 'react'
import clsx from 'clsx'

// ── Button ────────────────────────────────────────────────────
export function Button({ children, variant = 'ghost', size = 'md', className, ...props }) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-[9px] transition-all duration-150 cursor-pointer border'
  const variants = {
    accent: 'bg-[var(--accent)] text-white border-[var(--accent)] hover:bg-[var(--accent-hover)]',
    ghost:  'bg-transparent text-[var(--txt-1)] border-[var(--border-2)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-0)]',
    danger: 'bg-[var(--red-dim)] text-[var(--red)] border-[var(--red-border)] hover:bg-[rgba(240,91,107,0.18)]',
    green:  'bg-[var(--green-dim)] text-[var(--green)] border-[var(--green-border)] hover:bg-[rgba(34,216,122,0.18)]',
  }
  const sizes = {
    sm: 'text-[11.5px] px-2.5 py-1',
    md: 'text-[13px] px-3.5 py-[7px]',
    lg: 'text-[14px] px-4 py-2.5',
  }
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}

// ── Badge / Pill ──────────────────────────────────────────────
export function Badge({ children, variant = 'neutral', className }) {
  const variants = {
    long:    'bg-[var(--green-dim)] text-[var(--green)] border border-[var(--green-border)]',
    short:   'bg-[var(--red-dim)] text-[var(--red)] border border-[var(--red-border)]',
    setup:   'bg-[var(--purple-dim)] text-[var(--purple)] border border-[var(--purple-border,rgba(167,139,250,0.25))]',
    accent:  'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-border)]',
    neutral: 'bg-[var(--bg-3)] text-[var(--txt-1)] border border-[var(--border)]',
    amber:   'bg-[var(--amber-dim)] text-[var(--amber)] border border-[var(--amber-border,rgba(240,180,91,0.22))]',
  }
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

// ── KPI Card ──────────────────────────────────────────────────
export function KPICard({ label, value, sub, subVariant = 'neutral', icon }) {
  const subColors = {
    pos:     'text-[var(--green-text,#1aad60)]',
    neg:     'text-[var(--red-text,#c23d4a)]',
    neutral: 'text-[var(--txt-2)]',
  }
  return (
    <div className="bg-[var(--bg-2)] border border-[var(--border)] rounded-xl p-3.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.06em] text-[var(--txt-2)] mb-1.5">
        {icon && <i className={`ti ti-${icon} text-[11px]`} />}
        {label}
      </div>
      <div className="text-[19px] font-medium font-mono leading-none mb-1">{value}</div>
      {sub && <div className={clsx('text-[10px]', subColors[subVariant])}>{sub}</div>}
    </div>
  )
}

// ── Panel ─────────────────────────────────────────────────────
export function Panel({ title, action, children, className }) {
  return (
    <div className={clsx('bg-[var(--bg-2)] border border-[var(--border)] rounded-2xl overflow-hidden', className)}>
      {title && (
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
          <span className="text-[13px] font-medium text-[var(--txt-0)]">{title}</span>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

// ── Toggle ────────────────────────────────────────────────────
export function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-9 h-5 rounded-full border transition-colors duration-200 flex-shrink-0',
        checked
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-[var(--bg-4)] border-[var(--border-2)]'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-all duration-200',
        checked ? 'left-[18px]' : 'left-0.5'
      )} />
    </button>
  )
}

// ── Section label ─────────────────────────────────────────────
export function SectionLabel({ children, className }) {
  return (
    <div className={clsx('text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)] mb-2', className)}>
      {children}
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────
export function Divider({ className }) {
  return <div className={clsx('h-px bg-[var(--border)] my-3.5', className)} />
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyState({ icon = 'inbox', title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <i className={`ti ti-${icon} text-4xl text-[var(--txt-2)] mb-3`} />
      <div className="text-[14px] font-medium text-[var(--txt-1)] mb-1">{title}</div>
      {body && <div className="text-[12.5px] text-[var(--txt-2)] max-w-xs">{body}</div>}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ className }) {
  return <div className={clsx('spinner', className)} />
}
