import { useEffect, useState, useCallback } from 'react'
import api from '@/configs/axios'
import DataTable from '@/components/ui/DataTable'
import StatCard from '@/components/ui/StatCard'

interface Transaction {
  id: string; gatewayOrderId: string; status: string; amount: number; credits: number
  planId: string; createdAt: string
  user: { id: string; email: string; name: string; username: string }
}

export default function Transactions() {
  const [txns, setTxns] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ total: 0, pages: 1, limit: 20, totalRevenue: 0 })

  const fetchTxns = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (status) params.set('status', status)
      const { data } = await api.get(`/api/admin/transactions?${params}`)
      setTxns(data.transactions)
      setMeta({ total: data.total, pages: data.pages, limit: data.limit, totalRevenue: data.totalRevenue })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [page, status])

  useEffect(() => { fetchTxns() }, [fetchTxns])

  const statusBadge = (s: string) => {
    if (s === 'completed') return <span className="badge badge-success">Completed</span>
    if (s === 'failed')    return <span className="badge badge-danger">Failed</span>
    return <span className="badge badge-warning">Pending</span>
  }

  const columns = [
    {
      key: 'gatewayOrderId', label: 'Order ID',
      render: (t: Transaction) => <span className="font-mono" style={{ fontSize: 11 }}>{t.gatewayOrderId}</span>
    },
    {
      key: 'user', label: 'User',
      render: (t: Transaction) => (
        <div>
          <div style={{ fontSize: 13 }}>{t.user.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.user.email}</div>
        </div>
      )
    },
    {
      key: 'planId', label: 'Plan',
      render: (t: Transaction) => <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{t.planId}</span>
    },
    {
      key: 'amount', label: 'Amount',
      render: (t: Transaction) => <span style={{ fontWeight: 600 }}>₹{t.amount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'credits', label: 'Credits',
      render: (t: Transaction) => <span>+{t.credits}</span>
    },
    { key: 'status', label: 'Status', render: (t: Transaction) => statusBadge(t.status) },
    {
      key: 'createdAt', label: 'Date',
      render: (t: Transaction) => <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
        {new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </span>
    },
  ]

  return (
    <div>
      {/* Revenue stats */}
      <div className="grid-cols-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={meta.totalRevenue} format="currency" loading={loading} accent />
        <StatCard label="Total Orders"  value={meta.total} loading={loading} />
        <StatCard label="Completed"     value={loading ? 0 : txns.filter(t => t.status === 'completed').length} loading={loading} />
        <StatCard label="Failed"        value={loading ? 0 : txns.filter(t => t.status === 'failed').length} loading={loading} />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        <label className="label" style={{ margin: 0 }}>Filter by status:</label>
        {['', 'completed', 'pending', 'failed'].map(s => (
          <button
            key={s}
            id={`txn-filter-${s || 'all'}`}
            className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setStatus(s); setPage(1) }}
          >
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns} data={txns} loading={loading}
        page={page} pages={meta.pages} total={meta.total} limit={meta.limit}
        onPageChange={setPage} emptyMessage="No transactions found"
      />
    </div>
  )
}
