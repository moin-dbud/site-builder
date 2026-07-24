import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ArrowLeft, UserCheck, UserX, ShieldCheck, Trash2, Ban, CreditCard } from 'lucide-react'

interface UserDetail {
  id: string; email: string; username: string; name: string
  credits: number; emailVerified: boolean; isAdmin: boolean
  createdAt: string; updatedAt: string; totalCreation: number
  projects: { id: string; name: string; slug: string; isPublished: boolean; featured: boolean; createdAt: string }[]
  transactions: { id: string; gatewayOrderId: string; status: string; amount: number; credits: number; planId: string; createdAt: string }[]
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [creditDelta, setCreditDelta] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [confirm, setConfirm] = useState<null | 'suspend' | 'delete'>(null)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    api.get(`/api/admin/users/${id}`)
      .then(r => setUser(r.data.user))
      .catch(() => toast.error('User not found'))
      .finally(() => setLoading(false))
  }, [id])

  const adjustCredits = async () => {
    const delta = parseInt(creditDelta)
    if (isNaN(delta)) return toast.error('Invalid delta value')
    setAdjusting(true)
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/credits`, { delta, reason: creditReason })
      toast.success(data.message)
      setUser(u => u ? { ...u, credits: data.credits } : u)
      setCreditDelta('')
      setCreditReason('')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to adjust credits')
    } finally { setAdjusting(false) }
  }

  const handleSuspend = async () => {
    setActing(true)
    try {
      await api.patch(`/api/admin/users/${id}/suspend`, { reason: 'Admin action' })
      toast.success('User suspended and sessions revoked')
      setConfirm(null)
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to suspend user')
    } finally { setActing(false) }
  }

  const handleDelete = async () => {
    setActing(true)
    try {
      await api.delete(`/api/admin/users/${id}`, { data: { reason: 'Admin deletion' } })
      toast.success('User deleted')
      navigate('/users')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete user')
    } finally { setActing(false) }
  }

  if (loading) return (
    <div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="skeleton" style={{ height: i === 0 ? 80 : 120, marginBottom: 16, borderRadius: 8 }} />
      ))}
    </div>
  )
  if (!user) return <div style={{ color: 'var(--text-muted)', padding: 32 }}>User not found</div>

  return (
    <div>
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/users')} className="btn btn-ghost btn-sm">
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user.name}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user.email}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
          {user.emailVerified
            ? <span className="badge badge-success"><UserCheck size={10} /> Verified</span>
            : <span className="badge badge-warning"><UserX size={10} /> Unverified</span>
          }
          {user.isAdmin && <span className="badge badge-accent"><ShieldCheck size={10} /> Admin</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        {/* User info */}
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>Account Info</div>
          {[
            ['ID', <span className="font-mono">{user.id}</span>],
            ['Username', user.username ? `@${user.username}` : '—'],
            ['Credits', <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{user.credits.toLocaleString()}</span>],
            ['Projects', user.projects.length],
            ['Transactions', user.transactions.length],
            ['Joined', new Date(user.createdAt).toLocaleString()],
          ].map(([k, v]) => (
            <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text-muted)' }}>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </div>

        {/* Credit adjustment */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 14, fontSize: 13 }}>
            <CreditCard size={14} color="var(--accent)" /> Adjust Credits
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label className="label" htmlFor="credit-delta">Delta (positive to add, negative to subtract)</label>
              <input id="credit-delta" className="input" type="number" value={creditDelta} onChange={e => setCreditDelta(e.target.value)} placeholder="+50 or -10" />
            </div>
            <div>
              <label className="label" htmlFor="credit-reason">Reason</label>
              <input id="credit-reason" className="input" value={creditReason} onChange={e => setCreditReason(e.target.value)} placeholder="e.g. compensation, error correction" />
            </div>
            <button id="adjust-credits-btn" className="btn btn-primary" onClick={adjustCredits} disabled={adjusting || !creditDelta}>
              {adjusting ? 'Adjusting…' : 'Apply Adjustment'}
            </button>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Projects ({user.projects.length})</div>
        {user.projects.length === 0
          ? <div style={{ color: 'var(--text-disabled)', fontSize: 13 }}>No projects yet</div>
          : (
            <div className="table-container">
              <table>
                <thead><tr><th>Name</th><th>Status</th><th>Featured</th><th>Created</th></tr></thead>
                <tbody>
                  {user.projects.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500 }}>{p.name}</td>
                      <td>{p.isPublished ? <span className="badge badge-success">Published</span> : <span className="badge badge-muted">Draft</span>}</td>
                      <td>{p.featured ? <span className="badge badge-accent">Featured</span> : <span style={{ color: 'var(--text-disabled)' }}>—</span>}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </div>

      {/* Danger actions */}
      <div style={{ display: 'flex', gap: 10, padding: 16, background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
        <div style={{ flex: 1, fontSize: 13, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--danger)' }}>Destructive actions</strong> — these are logged and cannot be undone.
        </div>
        <button id="suspend-user-btn" className="btn btn-secondary btn-sm" onClick={() => setConfirm('suspend')}>
          <Ban size={13} /> Suspend
        </button>
        <button id="delete-user-btn" className="btn btn-danger btn-sm" onClick={() => setConfirm('delete')}>
          <Trash2 size={13} /> Delete
        </button>
      </div>

      {confirm === 'suspend' && (
        <ConfirmDialog
          title="Suspend user account"
          description={`This will revoke all active sessions for ${user.email}. They will be unable to log in.`}
          confirmLabel="Suspend User"
          danger
          onConfirm={handleSuspend}
          onCancel={() => setConfirm(null)}
          loading={acting}
        />
      )}
      {confirm === 'delete' && (
        <ConfirmDialog
          title="Delete user account"
          description={`Permanently delete ${user.email} and all their data. This cannot be undone.`}
          confirmLabel="Delete User"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirm(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
