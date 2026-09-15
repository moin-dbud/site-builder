import { useEffect, useMemo, useState } from 'react'
import {
    Search,
    Plus,
    Box,
    Layers,
    GitBranch,
    ToggleLeft,
    ToggleRight,
    ChevronRight,
    RefreshCw,
    ArrowRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/configs/axios'

type ComponentStatus = 'DRAFT' | 'TESTING' | 'PUBLISHED' | 'ARCHIVED'

interface ComponentVariant {
    id: string
    name: string
    slug: string
    description?: string | null
    isEnabled: boolean
}

interface ComponentVersion {
    id: string
    version: number
    implementationType: string
    status: string
    changelog?: string | null
    createdAt: string
}

interface Component {
    id: string
    name: string
    slug: string
    category: string
    description?: string | null
    status: ComponentStatus
    isEnabled: boolean
    tags?: unknown
    variants: ComponentVariant[]
    versions: ComponentVersion[]
    createdAt: string
    updatedAt: string
}

const statusLabels: Record<ComponentStatus, string> = {
    DRAFT: 'Draft',
    TESTING: 'Testing',
    PUBLISHED: 'Published',
    ARCHIVED: 'Archived',
}


function StatusBadge({ status }: { status: ComponentStatus }) {
    return (
        <span className={`status-badge status-${status.toLowerCase()}`}>
            {statusLabels[status]}
        </span>
    )
}

export default function Components() {
    const navigate = useNavigate()
    const [components, setComponents] = useState<Component[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('ALL')
    const [status, setStatus] = useState('ALL')
    const [refreshing, setRefreshing] = useState(false)

    const fetchComponents = async (showRefresh = false) => {
        try {
            if (showRefresh) setRefreshing(true)
            else setLoading(true)

            const { data } = await api.get('/api/admin/components')

            setComponents(data.components || [])
        } catch (error) {
            console.error(error)
            toast.error('Failed to load components')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchComponents()
    }, [])

    const categories = useMemo(() => {
        return [
            'ALL',
            ...Array.from(
                new Set(components.map(component => component.category))
            ).sort(),
        ]
    }, [components])

    const filteredComponents = useMemo(() => {
        const query = search.trim().toLowerCase()

        return components.filter(component => {
            const matchesSearch =
                !query ||
                component.name.toLowerCase().includes(query) ||
                component.slug.toLowerCase().includes(query) ||
                component.category.toLowerCase().includes(query) ||
                component.description?.toLowerCase().includes(query)

            const matchesCategory =
                category === 'ALL' || component.category === category

            const matchesStatus =
                status === 'ALL' || component.status === status

            return matchesSearch && matchesCategory && matchesStatus
        })
    }, [components, search, category, status])

    const toggleComponent = async (component: Component) => {
        try {
            await api.patch(
                `/api/admin/components/${component.id}/toggle`
            )

            setComponents(current =>
                current.map(item =>
                    item.id === component.id
                        ? { ...item, isEnabled: !item.isEnabled }
                        : item
                )
            )

            toast.success(
                component.isEnabled
                    ? `${component.name} disabled`
                    : `${component.name} enabled`
            )
        } catch (error) {
            console.error(error)
            toast.error('Failed to update component')
        }
    }

    return (
        <div className="page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <div className="eyebrow">
                        COMPONENT REGISTRY
                    </div>

                    <h1>Component Library</h1>

                    <p>
                        Manage the reusable building blocks available to
                        Buildo's generation engine.
                    </p>
                </div>

                <div className="page-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={() => fetchComponents(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            size={14}
                            className={refreshing ? 'spin' : ''}
                        />
                        Refresh
                    </button>

                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowVariantModal(true)}
                    >
                        <Plus size={14} />
                        Add Variant
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon">
                        <Box size={17} />
                    </div>

                    <div>
                        <div className="stat-card-value">
                            {components.length}
                        </div>

                        <div className="stat-card-label">
                            Components
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">
                        <Layers size={17} />
                    </div>

                    <div>
                        <div className="stat-card-value">
                            {components.reduce(
                                (total, component) =>
                                    total + component.variants.length,
                                0
                            )}
                        </div>

                        <div className="stat-card-label">
                            Variants
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">
                        <GitBranch size={17} />
                    </div>

                    <div>
                        <div className="stat-card-value">
                            {components.reduce(
                                (total, component) =>
                                    total + component.versions.length,
                                0
                            )}
                        </div>

                        <div className="stat-card-label">
                            Versions
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon">
                        <ToggleRight size={17} />
                    </div>

                    <div>
                        <div className="stat-card-value">
                            {components.filter(
                                component => component.isEnabled
                            ).length}
                        </div>

                        <div className="stat-card-label">
                            Enabled
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="toolbar">
                <div className="search-box">
                    <Search size={15} />

                    <input
                        value={search}
                        onChange={event =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search components..."
                    />
                </div>

                <select
                    value={category}
                    onChange={event =>
                        setCategory(event.target.value)
                    }
                    className="filter-select"
                >
                    {categories.map(item => (
                        <option key={item} value={item}>
                            {item === 'ALL' ? 'All Categories' : item}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={event =>
                        setStatus(event.target.value)
                    }
                    className="filter-select"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Draft</option>
                    <option value="TESTING">Testing</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            {/* Loading */}
            {loading && (
                <div className="empty-state">
                    <div className="skeleton" />
                    <p>Loading component registry...</p>
                </div>
            )}

            {/* Empty */}
            {!loading && filteredComponents.length === 0 && (
                <div className="empty-state">
                    <Box size={28} />
                    <h3>No components found</h3>
                    <p>
                        Try changing your search or filter settings.
                    </p>
                </div>
            )}

            {/* Component list */}
            {!loading && filteredComponents.length > 0 && (
                <div className="component-grid">
                    {filteredComponents.map(component => (
                        <article
                            key={component.id}
                            className="component-card"
                        >
                            <div className="component-card-top">
                                <div className="component-icon">
                                    <Box size={17} />
                                </div>

                                <StatusBadge status={component.status} />

                                <button
                                    className="icon-button"
                                    title={
                                        component.isEnabled
                                            ? 'Disable component'
                                            : 'Enable component'
                                    }
                                    onClick={() =>
                                        toggleComponent(component)
                                    }
                                >
                                    {component.isEnabled ? (
                                        <ToggleRight size={18} />
                                    ) : (
                                        <ToggleLeft size={18} />
                                    )}
                                </button>
                            </div>

                            <div className="component-card-body">
                                <div className="component-category">
                                    {component.category}
                                </div>

                                <h3>{component.name}</h3>

                                <div className="component-slug">
                                    {component.slug}
                                </div>

                                <p>
                                    {component.description ||
                                        'No description provided.'}
                                </p>
                            </div>

                            <div className="component-card-meta">
                                <span>
                                    <Layers size={13} />
                                    {component.variants.length} variants
                                </span>

                                <span>
                                    <GitBranch size={13} />
                                    {component.versions.length} versions
                                </span>

                                <span
                                    className={
                                        component.isEnabled
                                            ? 'enabled'
                                            : 'disabled'
                                    }
                                >
                                    {component.isEnabled
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </span>
                            </div>

                            <div className="component-card-footer">
                                <button
                                    className="manage-button"
                                    onClick={() => navigate(`/components/${component.id}`)}
                                >
                                    Manage
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </article>
                    ))}

                </div>
            )}
            {showVariantModal && (
                <div
                    className="modal-backdrop"
                    onMouseDown={e => {
                        if (e.target === e.currentTarget) {
                            setShowVariantModal(false)
                        }
                    }}
                >
                    <div
                        className="modal variant-modal"
                        onMouseDown={e => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <div>
                                <h2 className="modal-title">
                                    Add Component Variant
                                </h2>

                                <p className="modal-subtitle">
                                    Create a new layout variant for {component.name}.
                                </p>
                            </div>

                            <button
                                className="icon-button"
                                onClick={() => setShowVariantModal(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="modal-form">
                            <div>
                                <label className="label">
                                    Name
                                </label>

                                <input
                                    className="input"
                                    placeholder="Editorial Hero"
                                    value={variantForm.name}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            name: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Slug
                                </label>

                                <input
                                    className="input"
                                    placeholder="editorial-hero"
                                    value={variantForm.slug}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            slug: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Description
                                </label>

                                <textarea
                                    className="input"
                                    rows={3}
                                    placeholder="Large editorial-style hero..."
                                    value={variantForm.description}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            description: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Props Schema
                                </label>

                                <textarea
                                    className="input json-input"
                                    rows={5}
                                    value={variantForm.propsSchema}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            propsSchema: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Layout Rules
                                </label>

                                <textarea
                                    className="input json-input"
                                    rows={5}
                                    value={variantForm.layoutRules}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            layoutRules: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div>
                                <label className="label">
                                    Responsive Rules
                                </label>

                                <textarea
                                    className="input json-input"
                                    rows={5}
                                    value={variantForm.responsiveRules}
                                    onChange={e =>
                                        setVariantForm(prev => ({
                                            ...prev,
                                            responsiveRules: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowVariantModal(false)}
                                disabled={creatingVariant}
                            >
                                Cancel
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={handleCreateVariant}
                                disabled={creatingVariant}
                            >
                                {creatingVariant ? (
                                    'Creating...'
                                ) : (
                                    <>
                                        <Plus size={14} />
                                        Create Variant
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

}