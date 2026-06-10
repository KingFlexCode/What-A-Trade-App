import React from 'react'
import clsx from 'clsx'
import { useStore } from '../../store/useStore'
import { Button } from '../ui'

const ICON_MAP = {
  sync:    { icon: 'bolt',           color: 'var(--green)',  bg: 'var(--green-dim)'  },
  risk:    { icon: 'alert-triangle', color: 'var(--amber)',  bg: 'var(--amber-dim)'  },
  insight: { icon: 'brain',          color: 'var(--purple)', bg: 'var(--purple-dim)' },
  goal:    { icon: 'trophy',         color: 'var(--red)',    bg: 'var(--red-dim)'    },
}

export default function NotificationPanel({ onClose }) {
  const { notifications, markAllRead } = useStore()

  return (
    <div className="absolute top-full right-0 mt-1 w-80 bg-[var(--bg-2)] border border-[var(--border-2)] rounded-2xl z-50 overflow-hidden shadow-xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <span className="text-[13px] font-medium text-[var(--txt-0)]">Notifications</span>
        <button onClick={markAllRead}
          className="text-[11.5px] text-[var(--accent)] hover:underline cursor-pointer">
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-[12.5px] text-[var(--txt-2)]">
            No notifications
          </div>
        ) : (
          notifications.map((n) => {
            const cfg = ICON_MAP[n.type] || ICON_MAP.insight
            return (
              <div key={n.id} onClick={onClose}
                className={clsx(
                  'flex gap-3 items-start px-4 py-3 border-b border-[var(--border)] cursor-pointer transition-colors hover:bg-[var(--bg-3)]',
                  !n.read && 'bg-[var(--accent-dim)]'
                )}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: cfg.bg }}>
                  <i className={`ti ti-${cfg.icon} text-[13px]`} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12.5px] text-[var(--txt-0)] leading-snug mb-0.5">{n.title}</div>
                  <div className="text-[11.5px] text-[var(--txt-2)] leading-snug">{n.body}</div>
                  <div className="text-[10.5px] text-[var(--txt-2)] mt-1">{n.time}</div>
                </div>
                {!n.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0 mt-1.5" />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
