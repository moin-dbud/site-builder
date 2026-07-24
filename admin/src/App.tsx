import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import api from '@/configs/axios'
import AppShell from '@/components/Layout/AppShell'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Users from '@/pages/Users'
import UserDetail from '@/pages/UserDetail'
import Community from '@/pages/Community'
import Transactions from '@/pages/Transactions'
import DesignSystems from '@/pages/DesignSystems'
import Settings from '@/pages/Settings'
import DangerZone from '@/pages/DangerZone'

type AdminStatus = 'loading' | 'admin' | 'not-admin' | 'no-session'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = useSession()
  const [adminStatus, setAdminStatus] = useState<AdminStatus>('loading')

  useEffect(() => {
    if (isPending) return

    if (!session?.user) {
      setAdminStatus('no-session')
      return
    }

    api.get('/api/admin/me')
      .then(() => setAdminStatus('admin'))
      .catch(err => {
        if (err.response?.status === 403) setAdminStatus('not-admin')
        else setAdminStatus('no-session')
      })
  }, [session?.user?.id, isPending])

  if (adminStatus === 'loading') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, margin: '0 auto 16px' }} />
          <div className="skeleton" style={{ width: 120, height: 12, margin: '0 auto 8px' }} />
          <div className="skeleton" style={{ width: 80, height: 10, margin: '0 auto' }} />
        </div>
      </div>
    )
  }

  if (adminStatus === 'no-session') {
    return <Navigate to="/login" replace />
  }

  if (adminStatus === 'not-admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center', maxWidth: 360, padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Access Denied</h2>
          <p style={{ fontSize: 13, marginBottom: 24 }}>
            Your account does not have admin privileges. Contact a system administrator.
          </p>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/login'}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function LoginRoute() {
  const { data: session, isPending } = useSession()

  if (!isPending && session?.user) {
    return <Navigate to="/" replace />
  }
  return <Login />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/users"          element={<Users />} />
                <Route path="/users/:id"      element={<UserDetail />} />
                <Route path="/community"      element={<Community />} />
                <Route path="/transactions"   element={<Transactions />} />
                <Route path="/design-systems" element={<DesignSystems />} />
                <Route path="/settings"       element={<Settings />} />
                <Route path="/danger-zone"    element={<DangerZone />} />
                <Route path="*"              element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
