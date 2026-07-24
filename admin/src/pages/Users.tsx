import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '@/configs/axios'
import DataTable from '@/components/ui/DataTable'
import { Search, UserCheck, UserX, ShieldCheck } from 'lucide-react'

interface User {
  id: string; email: string; username: string; name: string
  credits: number; emailVerified: boolean; isAdmin: boolean
  createdAt: string; totalCreation: number
  _count: { projects: number; transactions: number }
}

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, pages: 1, limit: 20 })

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      const { data } = await api.get(`/api/admin/users?${params}`)
      setUsers(data.users)
      setMeta({ total: data.total, pages: data.pages, limit: data.limit })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearch(searchInput)
  }

  const columns = [
    {
      key: 'email', label: 'User',
      render: (u: User) => (
        <div>
          <div style={{ fontWeight: 500 }}>{u.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
        </div>
      )
    },
    {
      key: 'username', label: 'Username',
      render: (u: User) => u.username
        ? <span style={{ fontFamily: 'monospace', fontSize: 12 }}>@{u.username}</span>
        : <span style={{ color: 'var(--text-disabled)' }}>—</span>
    },
    {
      key: 'credits', label: 'Credits',
      render: (u: User) => <span style={{ fontWeight: 600 }}>{u.credits.toLocaleString()}</span>
    },
    {
      key: 'emailVerified', label: 'Status',
      render: (u: User) => u.emailVerified
        ? <span className="badge badge-success"><UserCheck size={10} /> Verified</span>
        : <span className="badge badge-warning"><UserX size={10} /> Unverified</span>
    },
    {
      key: 'isAdmin', label: 'Role',
      render: (u: User) => u.isAdmin
        ? <span className="badge badge-accent"><ShieldCheck size={10} /> Admin</span>
        : <span className="badge badge-muted">User</span>
    },
    {
      key: 'totalCreation', label: 'Projects',
      render: (u: User) => <span>{u._count.projects}</span>
    },
    {
      key: 'createdAt', label: 'Joined',
      render: (u: User) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <form id="user-search-form" onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, maxWidth: 400 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-disabled)' }} />
            <input
              id="user-search-input"
              className="input"
              placeholder="Search by email or username…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>
          <button id="user-search-btn" type="submit" className="btn btn-secondary">Search</button>
        </form>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
          {meta.total.toLocaleString()} users total
        </div>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        pages={meta.pages}
        total={meta.total}
        limit={meta.limit}
        onPageChange={setPage}
        onRowClick={u => navigate(`/users/${u.id}`)}
        emptyMessage="No users found"
      />
    </div>
  )
}
