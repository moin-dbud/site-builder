import { useEffect, useState } from 'react'
import api from '@/configs/axios'
import { toast } from 'sonner'
import { Save, RefreshCw } from 'lucide-react'

interface Settings {
  creditsPerGeneration: string
  creditsPerRevision: string
  freeSignupCredits: string
  activeModel: string
  openrouterDailyCap: string
  [key: string]: string
}

const FIELDS: { key: keyof Settings; label: string; type: 'number' | 'text'; description: string }[] = [
  { key: 'creditsPerGeneration', label: 'Credits per Generation', type: 'number', description: 'Credits deducted from a user each time they create a new project.' },
  { key: 'creditsPerRevision',   label: 'Credits per Revision',   type: 'number', description: 'Credits deducted from a user each time they request a site revision.' },
  { key: 'freeSignupCredits',    label: 'Free Credits on Signup', type: 'number', description: 'Credits granted to new users when they register. Applied at account creation (schema default).' },
  { key: 'activeModel',          label: 'Active AI Model',         type: 'text',   description: 'OpenRouter model ID used for prompt enhancement and code generation (e.g. cohere/north-mini-code:free).' },
  { key: 'openrouterDailyCap',   label: 'OpenRouter Daily Cap',    type: 'number', description: 'Expected daily request limit — used for the dashboard usage bar.' },
]

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    creditsPerGeneration: '',
    creditsPerRevision: '',
    freeSignupCredits: '',
    activeModel: '',
    openrouterDailyCap: '',
  })
  const [original, setOriginal] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/admin/settings')
      const s = data.settings as Settings
      setSettings(s)
      setOriginal(s)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchSettings() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/api/admin/settings', { settings })
      setOriginal(settings)
      toast.success('Settings saved successfully')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  const hasChanges = original && JSON.stringify(settings) !== JSON.stringify(original)

  return (
    <div style={{ maxWidth: 640 }}>
      <p style={{ fontSize: 13, marginBottom: 24 }}>
        These values are stored in the database and read by the generation pipeline at runtime.
        Changes take effect immediately on the next user action.
      </p>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {FIELDS.map(f => (
            <div key={f.key}>
              <div className="skeleton" style={{ height: 12, width: 140, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 38 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FIELDS.map((f, i) => (
            <div key={f.key} style={{
              padding: '18px 0',
              borderBottom: i < FIELDS.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: 20
            }}>
              <div style={{ flex: 1 }}>
                <label className="label" htmlFor={`setting-${f.key}`} style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {f.label}
                </label>
                <div style={{ fontSize: 12, color: 'var(--text-disabled)', marginTop: 2, lineHeight: 1.5 }}>{f.description}</div>
              </div>
              <div style={{ width: 200, flexShrink: 0 }}>
                <input
                  id={`setting-${f.key}`}
                  className="input"
                  type={f.type}
                  value={settings[f.key] ?? ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  style={settings[f.key] !== original?.[f.key] ? { borderColor: 'var(--warning)' } : {}}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
        <button
          id="save-settings-btn"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving || loading || !hasChanges}
        >
          <Save size={13} /> {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button
          id="reset-settings-btn"
          className="btn btn-secondary"
          onClick={fetchSettings}
          disabled={loading}
        >
          <RefreshCw size={13} /> Reset
        </button>
        {hasChanges && (
          <span style={{ fontSize: 12, color: 'var(--warning)', display: 'flex', alignItems: 'center' }}>
            Unsaved changes
          </span>
        )}
      </div>
    </div>
  )
}
