import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useStore } from '../../store/useStore'
import { Button } from '../ui'
import { LogoFull } from '../ui/Logo'
import NotificationPanel from './NotificationPanel'

const NAV = [
  { section: 'Overview' },
  { to: 'dashboard',  icon: 'layout-dashboard', label: 'Dashboard'   },
  { to: '/trades',    icon: 'list-details',     label: 'Trade log'   },
  { to: '/calendar',  icon: 'calendar-stats',   label: 'Calendar'    },
  { section: 'Analyse' },
  { to: '/analytics', icon: 'chart-bar',        label: 'Analytics'   },
  { to: '/risk',      icon: 'shield-check',     label: 'Risk mgmt'   },
  { to: '/insights',  icon: 'brain',            label: 'AI insights' },
  { section: 'Strategy' },
  { to: '/playbooks', icon: 'book-2',           label: 'Playbooks'   },
  { to: '/brokers',   icon: 'plug-connected',   label: 'Brokers', dot: true },
  { section: 'Account' },
  { to: '/settings',  icon: 'settings',         label: 'Settings'    },
]

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const navigate  = useNavigate()
  const { user, logout, notifications, settings } = useStore()
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-0)]">

      {/* ── Sidebar ── */}
      <aside className={clsx(
        'flex flex-col flex-shrink-0 bg-[var(--bg-1)] border-r border-[var(--border)] transition-all duration-200',
        collapsed ? 'w-14' : 'w-[220px]'
      )}>
        {/* Logo */}
        <div className={clsx(
          'flex items-center border-b border-[var(--border)]',
          collapsed ? 'px-3 py-4 justify-center' : 'px-4 py-4'
        )}>
          <LogoFull collapsed={collapsed} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
          {NAV.map((item, i) => {
            if (item.section) {
              return !collapsed ? (
                <div key={i} className="px-3 pt-3 pb-1 text-[9.5px] font-medium uppercase tracking-[0.1em] text-[var(--txt-2)]">
                  {item.section}
                </div>
              ) : <div key={i} className="my-1 mx-2 h-px bg-[var(--border)]" />
            }
            return (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                className={({ isActive }) => clsx(
                  'flex items-center gap-2.5 mx-1.5 my-0.5 px-3 py-2 rounded-[9px] text-[13px] transition-all duration-150 relative',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-border)]'
                    : 'text-[var(--txt-1)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-0)]'
                )}>
                {({ isActive }) => (
                  <>
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-[20%] bottom-[20%] w-0.5 bg-[var(--accent)] rounded-r" />
                    )}
                    <i className={`ti ti-${item.icon} text-[17px] flex-shrink-0`} />
                    {!collapsed && <span>{item.label}</span>}
                    {item.dot && !collapsed && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--red)]" />}
                    {item.dot && collapsed && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--red)]" />}
                  </>
                )}
              </NavLink>
            )
          })}

          <button onClick={() => { logout(); navigate('/login') }}
            className="flex items-center gap-2.5 mx-1.5 my-0.5 px-3 py-2 rounded-[9px] text-[13px] text-[var(--txt-2)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-1)] w-[calc(100%-12px)] transition-all">
            <i className="ti ti-logout text-[17px] flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </nav>

        {/* Account footer */}
        <div className="p-2.5 border-t border-[var(--border)]">
          <div onClick={() => navigate('/settings')}
            className="bg-[var(--bg-3)] border border-[var(--border)] rounded-xl p-2.5 cursor-pointer flex items-center gap-2 overflow-hidden">
            <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#378ADD,#a78bfa)' }}>
              {user?.initials || 'JD'}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-medium text-[var(--txt-0)] truncate">{user?.name || 'Main Account'}</div>
                  <div className="text-[10.5px] font-mono text-[var(--green)]">${settings.accountBalance.toLocaleString()}</div>
                </div>
                <i className="ti ti-chevron-right text-[13px] text-[var(--txt-2)] flex-shrink-0" />
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="h-[52px] flex-shrink-0 flex items-center gap-2.5 px-4 bg-[var(--bg-1)] border-b border-[var(--border)]">
          <button onClick={() => setCollapsed(!collapsed)}
            className="w-7 h-7 rounded-lg border border-[var(--border-2)] flex items-center justify-center text-[var(--txt-2)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-0)] transition-all">
            <i className="ti ti-menu-2 text-[15px]" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-8 h-8 rounded-lg border border-[var(--border-2)] flex items-center justify-center text-[var(--txt-1)] hover:bg-[var(--bg-3)] hover:text-[var(--txt-0)] transition-all">
              <i className="ti ti-bell text-[16px]" />
              {unread > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--red)] border-2 border-[var(--bg-1)]" />}
            </button>
            {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
            <Button variant="accent" size="sm" onClick={() => navigate('/log')}>
              <i className="ti ti-plus text-[13px]" /> Log trade
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  )
}
