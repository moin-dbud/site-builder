import { useEffect, useState, useCallback } from 'react'
import api from '@/configs/axios'
import DataTable from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { toast } from 'sonner'
import { Search, Star, StarOff, EyeOff } from 'lucide-react'

interface Project {
  id: string; name: string; slug: string; isPublished: boolean; featured: boolean
  createdAt: string; updatedAt: string
  user: { id: string; email: string; username: string; name: string }
}

export default function Community() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, pages: 1, limit: 20 })
  const [confirmAction, setConfirmAction] = useState<{ type: 'unpublish', project: Project } | null>(null)
  const [acting, setActing] = useState(false)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20', filter })
      if (search) params.set('search', search)
      const { data } = await api.get(`/api/admin/projects?${params}`)
      setProjects(data.projects)
      setMeta({ total: data.total, pages: data.pages, limit: data.limit })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search, filter])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleFeature = async (project: Project) => {
    try {
      const { data } = await api.patch(`/api/admin/projects/${project.id}/feature`)
      toast.success(data.message)
      setProjects(ps => ps.map(p => p.id === project.id ? { ...p, featured: data.featured } : p))
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
  }

  const handleUnpublish = async () => {
    if (!confirmAction) return
    setActing(true)
    try {
      await api.patch(`/api/admin/projects/${confirmAction.project.id}/unpublish`, { reason: 'Admin moderation' })
      toast.success('Project unpublished')
      setProjects(ps => ps.map(p => p.id === confirmAction.project.id ? { ...p, isPublished: false } : p))
      setConfirmAction(null)
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setActing(false) }
  }

  const columns = [
    {
      key: 'name', label: 'Project',
      render: (p: Project) => (
        <div>
          <div style={{ fontWeight: 500 }}>{p.name}</div>
          {p.slug && <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>/{p.slug}</div>}
        </div>
      )
    },
    {
      key: 'user', label: 'Author',
      render: (p: Project) => (
        <div>
          <div style={{ fontSize: 13 }}>{p.user.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.user.email}</div>
        </div>
      )
    },
    {
      key: 'isPublished', label: 'Status',
      render: (p: Project) => p.isPublished
        ? <span className="badge badge-success">Published</span>
        : <span className="badge badge-muted">Unpublished</span>
    },
    {
      key: 'featured', label: 'Featured',
      render: (p: Project) => p.featured
        ? <span className="badge badge-accent">⭐ Featured</span>
        : <span style={{ color: 'var(--text-disabled)', fontSize: 12 }}>—</span>
    },
    {
      key: 'createdAt', label: 'Published',
      render: (p: Project) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {new Date(p.updatedAt).toLocaleDateString()}
      </span>
    },
    {
      key: 'actions', label: 'Actions',
      render: (p: Project) => (
        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
          <button
            id={`feature-btn-${p.id}`}
            className="btn btn-ghost btn-sm"
            title={p.featured ? 'Unfeature' : 'Feature'}
            onClick={() => handleFeature(p)}
          >
            {p.featured ? <StarOff size={13} /> : <Star size={13} />}
          </button>
          {p.isPublished && (
            <button
              id={`unpublish-btn-${p.id}`}
              className="btn btn-ghost btn-sm"
              title="Unpublish"
              onClick={() => setConfirmAction({ type: 'unpublish', project: p })}
            >
              <EyeOff size={13} />
            </button>
          )}
        </div>
      )
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <form id="community-search-form" onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput) }}
          style={{ display: 'flex', gap: 8, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
            <input id="community-search-input" className="input" placeholder="Search projects or author…" value={searchInput}
              onChange={e => setSearchInput(e.target.value)} style={{ paddingLeft: 32 }} />
          </div>
          <button id="community-search-btn" type="submit" className="btn btn-secondary">Search</button>
        </form>
        <select id="community-filter-select" className="select" value={filter}
          onChange={e => { setFilter(e.target.value); setPage(1) }}>
          <option value="all">All Projects</option>
          <option value="published">Published only</option>
          <option value="featured">Featured only</option>
        </select>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
          {meta.total.toLocaleString()} projects
        </div>
      </div>

      <DataTable
        columns={columns} data={projects} loading={loading}
        page={page} pages={meta.pages} total={meta.total} limit={meta.limit}
        onPageChange={setPage} emptyMessage="No projects found"
      />

      {confirmAction?.type === 'unpublish' && (
        <ConfirmDialog
          title="Unpublish project"
          description={<>Unpublish <strong>"{confirmAction.project.name}"</strong>? The project and its code are preserved — only removed from the public community view.</>}
          confirmLabel="Unpublish"
          danger
          onConfirm={handleUnpublish}
          onCancel={() => setConfirmAction(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
