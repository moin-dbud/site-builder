import { useCallback, useEffect, useState } from 'react'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { DangerConfirm } from '@/components/ui/ConfirmDialog'
import { ShieldAlert, Power, CreditCard, Trash2, Users, Clock, RefreshCw, Mail } from 'lucide-react'

interface AuditLog {
  id: string; action: string; targetType: string; targetId: string
  details: any; timestamp: string
  adminUser: { id: string; email: string; name: string }
}

interface SystemStatus {
  maintenanceMode: boolean
  cashfreeFrozen: boolean
  emailVerificationRequired: boolean
}

// Danger zone action card component
function DangerCard({
  icon, title, description, action, actionLabel, actionId, loading, disabled = false
}: {
  icon: React.ReactNode; title: string; description: string
  action: () => void; actionLabel: string; actionId: string
  loading?: boolean; disabled?: boolean
}) {
  return (
    <div className="danger-section">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36, background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{description}</div>
        </div>
        <button
          id={actionId}
          className="btn btn-danger btn-sm"
          onClick={action}
          disabled={loading || disabled}
          style={{ flexShrink: 0 }}
        >
          {loading ? 'Processing…' : actionLabel}
        </button>
      </div>
    </div>
  )
}

// Toggle card for maintenance/freeze state
function ToggleCard({
  icon, title, description, enabled, onToggle, toggleId, dangerLabel, safeLabel, loading
}: {
  icon: React.ReactNode; title: string; description: string
  enabled: boolean; onToggle: () => void; toggleId: string
  dangerLabel: string; safeLabel: string; loading?: boolean
}) {
  return (
    <div style={{
      border: `1px solid ${enabled ? 'rgba(239,68,68,0.35)' : 'var(--border)'}`,
      borderRadius: 8, padding: 20,
      background: enabled ? 'rgba(239,68,68,0.05)' : 'var(--bg-surface)',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 36, height: 36,
          background: enabled ? 'var(--danger-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${enabled ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
          borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{description}</div>
          {enabled && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700,
              color: 'var(--danger)', background: 'var(--danger-dim)', padding: '3px 10px', borderRadius: 4,
              textTransform: 'uppercase', letterSpacing: '0.06em'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1s ease infinite' }} />
              {dangerLabel}
            </div>
          )}
        </div>
        <div>
          <button
            id={toggleId}
            className={`btn ${enabled ? 'btn-secondary' : 'btn-danger'} btn-sm`}
            onClick={onToggle}
            disabled={loading}
          >
            {loading ? 'Updating…' : enabled ? safeLabel : dangerLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DangerZone() {
  const [status, setStatus] = useState<SystemStatus>({ maintenanceMode: false, cashfreeFrozen: false, emailVerificationRequired: true })
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [auditLoading, setAuditLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(true)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState('')
  const [acting, setActing] = useState(false)

  const fetchStatus = async () => {
    setStatusLoading(true)
    try {
      const { data } = await api.get('/api/admin/settings')
      setStatus({
        maintenanceMode: data.settings.maintenanceMode === 'true',
        cashfreeFrozen: data.settings.cashfreeFrozen === 'true',
        emailVerificationRequired: data.settings.emailVerificationRequired !== 'false',
      })
    } catch (e) { console.error(e) }
    finally { setStatusLoading(false) }
  }

  const fetchAuditLog = useCallback(async () => {
    setAuditLoading(true)
    try {
      const { data } = await api.get('/api/admin/audit-log?limit=50')
      setAuditLogs(data.logs)
    } catch (e) { console.error(e) }
    finally { setAuditLoading(false) }
  }, [])

  useEffect(() => { fetchStatus(); fetchAuditLog() }, [fetchAuditLog])

  const toggleMaintenance = async () => {
    const newVal = !status.maintenanceMode
    setActing(true)
    try {
      await api.patch('/api/admin/danger/maintenance', { enabled: newVal })
      setStatus(s => ({ ...s, maintenanceMode: newVal }))
      toast.success(`Maintenance mode ${newVal ? 'ENABLED' : 'disabled'}`)
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const toggleFreeze = async () => {
    const newVal = !status.cashfreeFrozen
    setActing(true)
    try {
      await api.patch('/api/admin/danger/freeze-cashfree', { frozen: newVal })
      setStatus(s => ({ ...s, cashfreeFrozen: newVal }))
      toast.success(`Cashfree transactions ${newVal ? 'FROZEN' : 'unfrozen'}`)
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const toggleEmailVerification = async () => {
    const newVal = !status.emailVerificationRequired
    setActing(true)
    try {
      await api.patch('/api/admin/danger/email-verification', { required: newVal })
      setStatus(s => ({ ...s, emailVerificationRequired: newVal }))
      toast.success(`Email verification ${newVal ? 'ENABLED' : 'disabled — new accounts skip OTP'}`)
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const handleDeleteProject = async () => {
    if (!deleteTarget) return
    setActing(true)
    try {
      await api.delete(`/api/admin/projects/${deleteTarget}`, { data: { reason: 'Admin forced deletion' } })
      toast.success('Project deleted')
      setConfirmAction(null)
      setDeleteTarget('')
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const handleDeleteUser = async () => {
    if (!deleteTarget) return
    setActing(true)
    try {
      await api.delete(`/api/admin/users/${deleteTarget}`, { data: { reason: 'Admin forced deletion from Danger Zone' } })
      toast.success('User deleted')
      setConfirmAction(null)
      setDeleteTarget('')
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const handleBulkCleanup = async () => {
    setActing(true)
    try {
      const { data } = await api.post('/api/admin/danger/bulk-cleanup')
      toast.success(data.message)
      setConfirmAction(null)
      fetchAuditLog()
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const actionBadgeColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('BULK')) return 'badge-danger'
    if (action.includes('MAINTENANCE') || action.includes('FREEZE')) return 'badge-warning'
    if (action.includes('ENABLE') || action.includes('FEATURE')) return 'badge-success'
    return 'badge-muted'
  }

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
        padding: '14px 18px', borderRadius: 8,
        background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.25)'
      }}>
        <ShieldAlert size={16} color="var(--danger)" />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 13 }}>Danger Zone</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
            All actions below are irreversible or have significant system-wide impact. Every action is logged to the audit trail.
          </div>
        </div>
      </div>

      {/* ── Toggles ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <ToggleCard
          icon={<Power size={16} color={status.maintenanceMode ? 'var(--danger)' : 'var(--text-muted)'} />}
          title="Site-Wide Maintenance Mode"
          description="When enabled, ALL non-admin API routes return 503. The main site will be inaccessible to users. Admin panel remains fully functional. Use with extreme caution."
          enabled={status.maintenanceMode}
          onToggle={toggleMaintenance}
          toggleId="toggle-maintenance-btn"
          dangerLabel="Enable Maintenance"
          safeLabel="Disable Maintenance"
          loading={statusLoading || acting}
        />
        <ToggleCard
          icon={<CreditCard size={16} color={status.cashfreeFrozen ? 'var(--danger)' : 'var(--text-muted)'} />}
          title="Freeze Cashfree Transactions"
          description="Blocks all new payment order creation. Existing in-flight orders and webhooks continue to process normally. Use when investigating payment anomalies."
          enabled={status.cashfreeFrozen}
          onToggle={toggleFreeze}
          toggleId="toggle-freeze-btn"
          dangerLabel="Freeze Payments"
          safeLabel="Unfreeze Payments"
          loading={statusLoading || acting}
        />
        <ToggleCard
          icon={<Mail size={16} color={!status.emailVerificationRequired ? 'var(--danger)' : 'var(--text-muted)'} />}
          title="Email OTP Verification Required"
          description="When ON (default), new users must verify their email with a 6-digit OTP before they can use the platform. Turn OFF to skip OTP entirely — accounts are created and immediately active. Use when SMTP is unreliable or during testing."
          enabled={status.emailVerificationRequired}
          onToggle={toggleEmailVerification}
          toggleId="toggle-email-verification-btn"
          dangerLabel="Disable Verification"
          safeLabel="Enable Verification"
          loading={statusLoading || acting}
        />
      </div>

      {/* ── Targeted Actions ──────────────────────────────────────────────── */}
      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Targeted Deletion
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        <DangerCard
          icon={<Trash2 size={15} color="var(--danger)" />}
          title="Delete Specific Project"
          description="Permanently delete any project by ID. All associated conversations and versions are also removed."
          action={() => setConfirmAction('deleteProject')}
          actionLabel="Delete Project"
          actionId="delete-project-btn"
        />
        <DangerCard
          icon={<Trash2 size={15} color="var(--danger)" />}
          title="Delete Specific User"
          description="Permanently delete any user account and all associated data by user ID."
          action={() => setConfirmAction('deleteUser')}
          actionLabel="Delete User"
          actionId="delete-user-btn"
        />
      </div>

      {/* ── Bulk Cleanup ──────────────────────────────────────────────────── */}
      <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Bulk Operations
      </div>
      <div style={{ marginBottom: 32 }}>
        <DangerCard
          icon={<Users size={15} color="var(--danger)" />}
          title="Bulk Cleanup — Unverified Accounts"
          description="Delete all unverified user accounts older than 30 days. This is the highest-blast-radius action available. Requires an explicit confirmation phrase."
          action={() => setConfirmAction('bulkCleanup')}
          actionLabel="Run Cleanup"
          actionId="bulk-cleanup-btn"
        />
      </div>

      {/* ── Audit Log ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Audit Log (last 50 actions)
        </div>
        <button className="btn btn-ghost btn-sm" onClick={fetchAuditLog} disabled={auditLoading}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Admin</th><th>Action</th><th>Target</th><th>Details</th><th>Time</th></tr>
          </thead>
          <tbody>
            {auditLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 13, width: j === 3 ? 160 : 80, borderRadius: 3 }} /></td>
                  ))}
                </tr>
              ))
            ) : auditLogs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-disabled)' }}>No audit events yet</td></tr>
            ) : (
              auditLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div style={{ fontSize: 12, fontWeight: 500 }}>{log.adminUser.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.adminUser.email}</div>
                  </td>
                  <td><span className={`badge ${actionBadgeColor(log.action)}`}>{log.action}</span></td>
                  <td>
                    {log.targetType && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.targetType}</div>}
                    {log.targetId && <div className="font-mono" style={{ fontSize: 10 }}>{log.targetId.slice(0, 16)}…</div>}
                  </td>
                  <td style={{ maxWidth: 200 }}>
                    <div className="truncate" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {log.details ? JSON.stringify(log.details).slice(0, 60) : '—'}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 11, whiteSpace: 'nowrap' }}>
                    <Clock size={10} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    {new Date(log.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm modals */}
      {confirmAction === 'deleteProject' && (
        <div className="modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>Delete Project by ID</div>
            <label className="label" htmlFor="delete-project-id-input">Project ID</label>
            <input id="delete-project-id-input" className="input" placeholder="Paste project UUID here" value={deleteTarget} onChange={e => setDeleteTarget(e.target.value)} style={{ fontFamily: 'monospace', marginBottom: 16 }} />
            <DangerConfirm
              title="Confirm Project Deletion"
              description="This permanently deletes the project and all versions/conversations. This cannot be undone."
              confirmPhrase="delete project"
              onConfirm={handleDeleteProject}
              onCancel={() => { setConfirmAction(null); setDeleteTarget('') }}
              loading={acting}
            />
          </div>
        </div>
      )}

      {confirmAction === 'deleteUser' && (
        <div className="modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 700, color: 'var(--danger)', marginBottom: 12 }}>Delete User by ID</div>
            <label className="label" htmlFor="delete-user-id-input">User ID</label>
            <input id="delete-user-id-input" className="input" placeholder="Paste user ID here" value={deleteTarget} onChange={e => setDeleteTarget(e.target.value)} style={{ fontFamily: 'monospace', marginBottom: 16 }} />
            <DangerConfirm
              title="Confirm User Deletion"
              description="Permanently deletes this user account and ALL associated projects, transactions, and sessions."
              confirmPhrase="delete user"
              onConfirm={handleDeleteUser}
              onCancel={() => { setConfirmAction(null); setDeleteTarget('') }}
              loading={acting}
            />
          </div>
        </div>
      )}

      {confirmAction === 'bulkCleanup' && (
        <DangerConfirm
          title="Bulk Cleanup — Unverified Accounts"
          description={<>This will permanently delete <strong>all unverified accounts older than 30 days</strong>. This affects potentially many users and cannot be undone. Are you absolutely certain?</>}
          confirmPhrase="delete unverified users"
          onConfirm={handleBulkCleanup}
          onCancel={() => setConfirmAction(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
