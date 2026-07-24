import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, FolderOpen, CreditCard,
  Palette, Settings, ShieldAlert, LogOut, Zap
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { toast } from 'sonner'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ]
  },
  {
    label: 'Management',
    items: [
      { to: '/users',       icon: Users,       label: 'Users' },
      { to: '/community',   icon: FolderOpen,  label: 'Community' },
      { to: '/transactions',icon: CreditCard,  label: 'Transactions' },
    ]
  },
  {
    label: 'Configuration',
    items: [
      { to: '/design-systems', icon: Palette,   label: 'Design Systems' },
      { to: '/settings',       icon: Settings,  label: 'System Settings' },
    ]
  },
  {
    label: 'Control',
    items: [
      { to: '/danger-zone', icon: ShieldAlert, label: 'Danger Zone' },
    ]
  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{
        padding: '18px 22px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'var(--accent-dim)',
          border: '1px solid var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={14} color="var(--accent)" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Buildo Admin</div>
          <div style={{ fontSize: 10, color: 'var(--text-disabled)', letterSpacing: '0.05em' }}>CONTROL PANEL</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {navGroups.map(group => (
          <div key={group.label}>
            <div className="section-label">{group.label}</div>
            {group.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={('end' in item && item.end) ? true : undefined}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <item.icon size={15} />
                {item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleSignOut}
          className="nav-item btn-ghost"
          style={{ width: '100%', border: 'none', cursor: 'pointer', background: 'none', justifyContent: 'flex-start' }}
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
