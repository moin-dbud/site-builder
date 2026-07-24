import { ReactNode, useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  title: string
  description: ReactNode
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ConfirmDialog({ title, description, confirmLabel = 'Confirm', danger, onConfirm, onCancel, loading }: ConfirmDialogProps) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: danger ? 'var(--danger-dim)' : 'var(--accent-dim)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={16} color={danger ? 'var(--danger)' : 'var(--accent)'} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{description}</div>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading ? 'Processing…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

interface DangerConfirmProps {
  title: string
  description: ReactNode
  confirmPhrase: string
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function DangerConfirm({ title, description, confirmPhrase, onConfirm, onCancel, loading }: DangerConfirmProps) {
  const [typed, setTyped] = useState('')
  const matches = typed.trim() === confirmPhrase

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <span style={{ fontWeight: 700, color: 'var(--danger)', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {title}
            </span>
          </div>
          <button onClick={onCancel} className="btn btn-ghost btn-sm"><X size={14} /></button>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          {description}
        </div>

        <div style={{ background: 'var(--danger-dim)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Type <code style={{ background: 'var(--bg-base)', padding: '1px 6px', borderRadius: 4, color: 'var(--danger)', fontFamily: 'monospace' }}>{confirmPhrase}</code> to confirm:
          </div>
          <input
            id="danger-confirm-input"
            className="input"
            placeholder={confirmPhrase}
            value={typed}
            onChange={e => setTyped(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: 13 }}
            autoFocus
          />
        </div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary" disabled={loading}>Cancel</button>
          <button
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={!matches || loading}
          >
            {loading ? 'Processing…' : 'Confirm Action'}
          </button>
        </div>
      </div>
    </div>
  )
}
