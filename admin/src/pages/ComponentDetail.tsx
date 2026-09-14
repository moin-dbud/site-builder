import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    Check,
    Code2,
    Layers3,
    Save,
    Settings2,
    Plus,
    X,
    ToggleLeft,
    ToggleRight,
    Box,
} from 'lucide-react'
import { toast } from 'sonner'
import api from '@/configs/axios'

interface ComponentVariant {
    id: string
    name: string
    slug: string
    description?: string | null
    isEnabled: boolean
    propsSchema?: unknown
    layoutRules?: unknown
    responsiveRules?: unknown
}

interface ComponentVersion {
    id: string
    version: number
    implementationType: string
    status: string
    changelog?: string | null
    createdAt: string
}

interface VariantForm {
    name: string
    slug: string
    description: string
    propsSchema: string
    layoutRules: string
    responsiveRules: string
}

interface Component {
    id: string
    name: string
    slug: string
    category: string
    description?: string | null
    status: string
    isEnabled: boolean

    tags?: unknown
    compatibleStyles?: unknown
    compatibleSkills?: unknown

    propsSchema?: unknown
    slotsSchema?: unknown
    responsiveRules?: unknown
    accessibilityRules?: unknown
    mediaRequirements?: unknown

    variants: ComponentVariant[]
    versions: ComponentVersion[]

    createdAt: string
    updatedAt: string
}

export default function ComponentDetail() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [showVariantModal, setShowVariantModal] = useState(false)

    const [variantForm, setVariantForm] = useState<VariantForm>({
        name: '',
        slug: '',
        description: '',
        propsSchema: '{}',
        layoutRules: '{}',
        responsiveRules: '{}',
    })

    const [creatingVariant, setCreatingVariant] = useState(false)

    const [component, setComponent] = useState<Component | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [name, setName] = useState('')
    const [slug, setSlug] = useState('')
    const [category, setCategory] = useState('')
    const [description, setDescription] = useState('')

    useEffect(() => {
        if (!id) return

        const loadComponent = async () => {
            try {
                setLoading(true)

                const response = await api.get(`/api/admin/components/${id}`)

                const data = response.data?.component ?? response.data

                setComponent(data)

                setName(data.name ?? '')
                setSlug(data.slug ?? '')
                setCategory(data.category ?? '')
                setDescription(data.description ?? '')
            } catch (error) {
                console.error(error)
                toast.error('Failed to load component')
                navigate('/components')
            } finally {
                setLoading(false)
            }
        }

        loadComponent()
    }, [id, navigate])

    const handleSave = async () => {
        if (!id) return

        try {
            setSaving(true)

            const response = await api.patch(`/api/admin/components/${id}`, {
                name,
                slug,
                category,
                description,
            })

            const updated = response.data?.component ?? response.data

            setComponent(prev =>
                prev
                    ? {
                        ...prev,
                        ...updated,
                    }
                    : prev
            )

            toast.success('Component updated')
        } catch (error) {
            console.error(error)
            toast.error('Failed to update component')
        } finally {
            setSaving(false)
        }
    }

    const toggleEnabled = async () => {
        if (!component) return

        try {
            const response = await api.patch(
                `/api/admin/components/${component.id}/toggle`
            )

            const updated = response.data?.component ?? response.data

            setComponent(prev =>
                prev
                    ? {
                        ...prev,
                        ...updated,
                    }
                    : prev
            )

            toast.success(
                updated.isEnabled ? 'Component enabled' : 'Component disabled'
            )
        } catch (error) {
            console.error(error)
            toast.error('Failed to update component status')
        }
    }

    const handleCreateVariant = async () => {
        if (!id) return

        if (!variantForm.name.trim() || !variantForm.slug.trim()) {
            toast.error('Variant name and slug are required')
            return
        }

        try {
            setCreatingVariant(true)

            const payload = {
                name: variantForm.name.trim(),
                slug: variantForm.slug.trim(),
                description: variantForm.description.trim() || null,
                propsSchema: JSON.parse(variantForm.propsSchema || '{}'),
                layoutRules: JSON.parse(variantForm.layoutRules || '{}'),
                responsiveRules: JSON.parse(
                    variantForm.responsiveRules || '{}'
                ),
            }

            const response = await api.post(
                `/api/admin/components/${id}/variants`,
                payload
            )

            const createdVariant =
                response.data?.variant ?? response.data

            setComponent(prev =>
                prev
                    ? {
                        ...prev,
                        variants: [
                            ...prev.variants,
                            createdVariant,
                        ],
                    }
                    : prev
            )

            setVariantForm({
                name: '',
                slug: '',
                description: '',
                propsSchema: '{}',
                layoutRules: '{}',
                responsiveRules: '{}',
            })

            setShowVariantModal(false)

            toast.success('Variant created')
        } catch (error: any) {
            console.error(error)

            if (error instanceof SyntaxError) {
                toast.error('Invalid JSON in one of the JSON fields')
            } else {
                toast.error(
                    error.response?.data?.message ||
                    'Failed to create variant'
                )
            }
        } finally {
            setCreatingVariant(false)
        }
    }

    if (loading) {
        return (
            <div className="page">
                <div className="skeleton" style={{ width: 180, height: 20 }} />
                <div
                    className="skeleton"
                    style={{ width: 320, height: 32, marginTop: 20 }}
                />
                <div
                    className="skeleton"
                    style={{ width: '100%', height: 240, marginTop: 24 }}
                />
            </div>
        )
    }

    if (!component) {
        return (
            <div className="page">
                <div className="empty-state">
                    <Box size={32} />
                    <h3>Component not found</h3>
                    <p>The requested component could not be loaded.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <button
                        className="btn btn-ghost"
                        onClick={() => navigate('/components')}
                        style={{ marginBottom: 14 }}
                    >
                        <ArrowLeft size={15} />
                        Component Library
                    </button>

                    <div className="eyebrow">Component</div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        <h1 className="page-title">{component.name}</h1>

                        <span
                            className={`status-badge status-${component.status.toLowerCase()}`}
                        >
                            {component.status}
                        </span>
                    </div>

                    <p className="page-subtitle">
                        Manage component configuration, variants and versions.
                    </p>
                </div>

                <div className="page-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={toggleEnabled}
                    >
                        {component.isEnabled ? (
                            <ToggleRight size={16} />
                        ) : (
                            <ToggleLeft size={16} />
                        )}

                        {component.isEnabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        <Save size={15} />

                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Overview */}
            <div className="component-detail-grid">
                <section className="card">
                    <div className="detail-section-header">
                        <div>
                            <div className="detail-section-title">
                                <Settings2 size={15} />
                                Component Configuration
                            </div>

                            <div className="detail-section-subtitle">
                                Basic information used by Buildo's component resolver.
                            </div>
                        </div>
                    </div>

                    <div className="form-grid">
                        <div>
                            <label className="label">Name</label>

                            <input
                                className="input"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">Slug</label>

                            <input
                                className="input"
                                value={slug}
                                onChange={e => setSlug(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">Category</label>

                            <input
                                className="input"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="label">Status</label>

                            <div className="detail-value">
                                <span
                                    className={`status-badge status-${component.status.toLowerCase()}`}
                                >
                                    {component.status}
                                </span>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className="label">Description</label>

                            <textarea
                                className="input"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={4}
                                style={{ resize: 'vertical' }}
                            />
                        </div>
                    </div>
                </section>

                {/* Registry summary */}
                <section className="card">
                    <div className="detail-section-header">
                        <div>
                            <div className="detail-section-title">
                                <Box size={15} />
                                Registry
                            </div>

                            <div className="detail-section-subtitle">
                                Current component registry information.
                            </div>
                        </div>
                    </div>

                    <div className="registry-list">
                        <div className="registry-row">
                            <span>Variants</span>
                            <strong>{component.variants.length}</strong>
                        </div>

                        <div className="registry-row">
                            <span>Versions</span>
                            <strong>{component.versions.length}</strong>
                        </div>

                        <div className="registry-row">
                            <span>Enabled</span>
                            <strong
                                className={
                                    component.isEnabled ? 'enabled' : 'disabled'
                                }
                            >
                                {component.isEnabled ? 'Yes' : 'No'}
                            </strong>
                        </div>

                        <div className="registry-row">
                            <span>Created</span>
                            <strong>
                                {new Date(component.createdAt).toLocaleDateString()}
                            </strong>
                        </div>

                        <div className="registry-row">
                            <span>Updated</span>
                            <strong>
                                {new Date(component.updatedAt).toLocaleDateString()}
                            </strong>
                        </div>
                    </div>
                </section>
            </div>

            {/* Variants */}
            <section className="card detail-card">
                <div className="detail-section-header">
                    <div>
                        <div className="detail-section-title">
                            <Layers3 size={15} />
                            Variants
                        </div>

                        <div className="detail-section-subtitle">
                            Layout variants available to the component resolver.
                        </div>
                    </div>

                    <button className="btn btn-secondary">
                        Add Variant
                    </button>
                </div>

                {component.variants.length === 0 ? (
                    <div className="empty-state">
                        <Layers3 size={28} />
                        <h3>No variants</h3>
                        <p>This component does not have any variants yet.</p>
                    </div>
                ) : (
                    <div className="variant-list">
                        {component.variants.map(variant => (
                            <div className="variant-row" key={variant.id}>
                                <div className="variant-main">
                                    <div className="component-icon">
                                        <Layers3 size={16} />
                                    </div>

                                    <div>
                                        <div className="variant-name">
                                            {variant.name}
                                        </div>

                                        <div className="variant-slug">
                                            {variant.slug}
                                        </div>

                                        {variant.description && (
                                            <div className="variant-description">
                                                {variant.description}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="variant-actions">
                                    <span
                                        className={
                                            variant.isEnabled
                                                ? 'enabled'
                                                : 'disabled'
                                        }
                                    >
                                        {variant.isEnabled ? (
                                            <>
                                                <Check size={13} />
                                                Enabled
                                            </>
                                        ) : (
                                            'Disabled'
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Versions */}
            <section className="card detail-card">
                <div className="detail-section-header">
                    <div>
                        <div className="detail-section-title">
                            <Code2 size={15} />
                            Versions
                        </div>

                        <div className="detail-section-subtitle">
                            Implementation versions for this component.
                        </div>
                    </div>

                    <button className="btn btn-secondary">
                        New Version
                    </button>
                </div>

                {component.versions.length === 0 ? (
                    <div className="empty-state">
                        <Code2 size={28} />
                        <h3>No versions</h3>
                        <p>This component does not have any implementation versions.</p>
                    </div>
                ) : (
                    <div className="version-list">
                        {component.versions.map(version => (
                            <div className="version-row" key={version.id}>
                                <div>
                                    <div className="version-title">
                                        v{version.version}
                                    </div>

                                    <div className="version-meta">
                                        {version.implementationType} ·{' '}
                                        {new Date(
                                            version.createdAt
                                        ).toLocaleDateString()}
                                    </div>
                                </div>

                                <span
                                    className={`status-badge status-${version.status.toLowerCase()}`}
                                >
                                    {version.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}