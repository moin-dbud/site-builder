import { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'

const pageTitles: Record<string, string> = {
  '/':              'Dashboard',
  '/users':         'Users',
  '/community':     'Community',
  '/transactions':  'Transactions',
  '/design-systems':'Design Systems',
  '/settings':      'System Settings',
  '/danger-zone':   'Danger Zone',
}

interface AppShellProps { children: ReactNode }

export default function AppShell({ children }: AppShellProps) {
  const { pathname } = useLocation()

  const title = Object.entries(pageTitles)
    .find(([path]) => pathname === path || pathname.startsWith(path + '/'))
    ?.[1] ?? 'Admin'

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <h1 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
            {title}
          </h1>
          <div style={{
            fontSize: 11, fontWeight: 600, color: 'var(--text-disabled)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 4,
            border: '1px solid var(--border)',
          }}>
            Internal Only
          </div>
        </header>

        {/* Page content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  )
}
