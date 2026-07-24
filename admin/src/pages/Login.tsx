import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn } from '@/lib/auth-client'
import { toast } from 'sonner'
import { Zap, Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn.email({ email, password })
      if (result.error) {
        setError(result.error.message || 'Invalid credentials')
        return
      }
      // Verify admin access after sign-in
      const res = await fetch(`${import.meta.env.VITE_BASEURL || 'http://localhost:3000'}/api/admin/me`, {
        credentials: 'include'
      })
      if (res.status === 403) {
        setError('Access denied — this account does not have admin privileges.')
        await import('@/lib/auth-client').then(m => m.signOut())
        return
      }
      if (!res.ok) {
        setError('Unable to verify admin status. Please try again.')
        return
      }
      toast.success('Signed in successfully')
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--accent-dim)', border: '1px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={18} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Buildo Admin</div>
            <div style={{ fontSize: 11, color: 'var(--text-disabled)', letterSpacing: '0.06em' }}>INTERNAL CONTROL PANEL</div>
          </div>
        </div>

        {/* Form card */}
        <div className="card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 18, marginBottom: 4 }}>Sign in</h2>
          <p style={{ fontSize: 13, marginBottom: 24 }}>Admin accounts only</p>

          <form id="admin-login-form" onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-disabled)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 6, padding: '10px 14px', fontSize: 13, color: 'var(--danger)'
              }}>
                {error}
              </div>
            )}

            <button id="login-submit-btn" type="submit" className="btn btn-primary" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-disabled)', lineHeight: 1.6 }}>
          No self-serve access. Admin accounts are set manually.<br />
          See <code style={{ fontFamily: 'monospace' }}>admin/README.md</code> for setup instructions.
        </div>
      </div>
    </div>
  )
}
