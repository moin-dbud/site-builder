import { useEffect, useState } from 'react'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { Plus, Edit3, ToggleLeft, ToggleRight, X, Check } from 'lucide-react'

interface DS {
  id: string; name: string; isEnabled: boolean
  keywords: string[]; spacing: string; radius: string; layoutGuidance: string
  palette: { primary: string; secondary: string; background: string; surface: string; text: string; muted: string }
  typography: { headingFont: string; bodyFont: string; googleFontsImport: string; headingWeight: string }
  componentPatterns: { navbar: string; hero: string; card: string }
}

const EMPTY_DS: Partial<DS> = {
  id: '', name: '', isEnabled: true,
  keywords: [],
  palette: { primary: '#000', secondary: '#666', background: '#fff', surface: '#f5f5f5', text: '#111', muted: '#888' },
  typography: { headingFont: "'Inter', sans-serif", bodyFont: "'Inter', sans-serif", googleFontsImport: '', headingWeight: '600' },
  spacing: '', radius: '', layoutGuidance: '',
  componentPatterns: { navbar: '', hero: '', card: '' },
}

function ColorSwatch({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: color, border: '1px solid var(--border)', verticalAlign: 'middle', marginRight: 6 }} />
}

export default function DesignSystems() {
  const [systems, setSystems] = useState<DS[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<DS> | null>(null)
  const [saving, setSaving] = useState(false)
  const [isNew, setIsNew] = useState(false)

  const fetch = async () => {
    setLoading(true)
    try { const { data } = await api.get('/api/admin/design-systems'); setSystems(data.systems) }
    catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const handleToggle = async (ds: DS) => {
    try {
      const { data } = await api.patch(`/api/admin/design-systems/${ds.id}/toggle`)
      toast.success(data.isEnabled ? 'Design system enabled' : 'Design system disabled')
      setSystems(s => s.map(x => x.id === ds.id ? { ...x, isEnabled: data.isEnabled } : x))
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const handleSave = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (isNew) {
        const { data } = await api.post('/api/admin/design-systems', editing)
        setSystems(s => [...s, data.system])
        toast.success('Design system created')
      } else {
        const { data } = await api.patch(`/api/admin/design-systems/${editing.id}`, editing)
        setSystems(s => s.map(x => x.id === editing.id ? data.system : x))
        toast.success('Design system updated')
      }
      setEditing(null)
    } catch (e: any) { toast.error(e.response?.data?.message || 'Save failed') }
    finally { setSaving(false) }
  }

  const setField = (path: string, value: string) => {
    setEditing(e => {
      if (!e) return e
      const parts = path.split('.')
      if (parts.length === 1) return { ...e, [parts[0]]: value }
      const nested = { ...(e as any)[parts[0]], [parts[1]]: value }
      return { ...e, [parts[0]]: nested }
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ fontSize: 13 }}>Edit design system presets used during website generation. Changes take effect on next generation.</p>
        <button id="new-ds-btn" className="btn btn-primary" onClick={() => { setEditing({ ...EMPTY_DS }); setIsNew(true) }}>
          <Plus size={14} /> New Preset
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 8 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {systems.map(ds => (
            <div key={ds.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: ds.isEnabled ? 1 : 0.5 }}>
              {/* Color swatches */}
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {Object.values(ds.palette).map((c, i) => <ColorSwatch key={i} color={c} />)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{ds.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {ds.keywords?.slice(0, 4).join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${ds.isEnabled ? 'badge-success' : 'badge-muted'}`}>
                  {ds.isEnabled ? 'Active' : 'Disabled'}
                </span>
                <button id={`edit-ds-${ds.id}`} className="btn btn-ghost btn-sm" onClick={() => { setEditing({ ...ds }); setIsNew(false) }}>
                  <Edit3 size={13} />
                </button>
                <button id={`toggle-ds-${ds.id}`} className="btn btn-ghost btn-sm" title={ds.isEnabled ? 'Disable' : 'Enable'} onClick={() => handleToggle(ds)}>
                  {ds.isEnabled ? <ToggleRight size={16} color="var(--success)" /> : <ToggleLeft size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="modal-backdrop" onClick={() => setEditing(null)}>
          <div className="modal" style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 15 }}>{isNew ? 'New Design System' : `Edit: ${editing.name}`}</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(null)}><X size={14} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {isNew && (
                <div>
                  <label className="label">ID (slug, e.g. "my-preset")</label>
                  <input className="input input-sm" value={editing.id || ''} onChange={e => setField('id', e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">Name</label>
                <input className="input input-sm" value={editing.name || ''} onChange={e => setField('name', e.target.value)} />
              </div>
              <div>
                <label className="label">Keywords (comma-separated)</label>
                <input className="input input-sm" value={(editing.keywords as string[] || []).join(', ')} onChange={e => setEditing(d => d ? { ...d, keywords: e.target.value.split(',').map(s => s.trim()) } : d)} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Palette</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  {Object.keys(editing.palette || {}).map(k => (
                    <div key={k}>
                      <label className="label">{k}</label>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="color" value={(editing.palette as any)?.[k] || '#000'} onChange={e => setField(`palette.${k}`, e.target.value)} style={{ width: 28, height: 28, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                        <input className="input input-sm" value={(editing.palette as any)?.[k] || ''} onChange={e => setField(`palette.${k}`, e.target.value)} style={{ fontFamily: 'monospace' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Typography</div>
                {Object.keys(editing.typography || {}).map(k => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <label className="label">{k}</label>
                    <input className="input input-sm" value={(editing.typography as any)?.[k] || ''} onChange={e => setField(`typography.${k}`, e.target.value)} />
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Layout & Components</div>
                <div style={{ marginBottom: 8 }}>
                  <label className="label">Spacing guidance</label>
                  <input className="input input-sm" value={editing.spacing || ''} onChange={e => setField('spacing', e.target.value)} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="label">Radius</label>
                  <input className="input input-sm" value={editing.radius || ''} onChange={e => setField('radius', e.target.value)} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="label">Layout guidance</label>
                  <textarea className="input" rows={3} value={editing.layoutGuidance || ''} onChange={e => setField('layoutGuidance', e.target.value)} style={{ resize: 'vertical', minHeight: 64 }} />
                </div>
                {['navbar', 'hero', 'card'].map(k => (
                  <div key={k} style={{ marginBottom: 8 }}>
                    <label className="label">{k} pattern</label>
                    <input className="input input-sm" value={(editing.componentPatterns as any)?.[k] || ''} onChange={e => setField(`componentPatterns.${k}`, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button id="save-ds-btn" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                <Check size={13} /> {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
