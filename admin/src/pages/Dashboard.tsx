import { useEffect, useState } from 'react'
import api from '@/configs/axios'
import StatCard from '@/components/ui/StatCard'
import { LineChart, BarChart } from '@/components/charts/Charts'
import { Users, FolderOpen, CreditCard, Zap, Activity } from 'lucide-react'

interface Stats {
  users: { total: number; verified: number; unverified: number; recentSignups: { date: string; count: number }[] }
  projects: { total: number; published: number; draft: number }
  transactions: { total: number; completed: number; failed: number; totalRevenue: number; revenueOverTime: { date: string; revenue: number }[] }
  designSystems: { id: string; name: string; count: number }[]
  openrouter: { requestsToday: number; dailyCap: number }
  generation: { versionsCreated30d: number }
}

function ProgressBar({ value, max, color = 'var(--accent)' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const isHigh = pct > 80
  const barColor = isHigh ? 'var(--danger)' : pct > 60 ? 'var(--warning)' : color
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>Today's usage</span>
        <span style={{ color: isHigh ? 'var(--danger)' : 'var(--text-primary)', fontWeight: 600 }}>
          {value.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-disabled)' }}>
        {pct.toFixed(1)}% of daily cap used
        {isHigh && ' ⚠ Approaching limit'}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const signupData = stats?.users.recentSignups.map(d => ({ date: d.date.slice(5), value: d.count })) ?? []
  const revenueData = stats?.transactions.revenueOverTime.map(d => ({ date: d.date.slice(5), value: d.revenue })) ?? []
  const dsData = stats?.designSystems.map(d => ({ name: d.name.replace(' / SaaS', ''), value: d.count })) ?? []

  return (
    <div>
      {/* OpenRouter Usage — prominent */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'var(--border-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={16} color="var(--accent)" />
          <span style={{ fontWeight: 600, fontSize: 13 }}>OpenRouter API Usage</span>
          <span className="badge badge-muted" style={{ marginLeft: 'auto' }}>Daily Cap Monitor</span>
        </div>
        {loading ? (
          <div>
            <div className="skeleton" style={{ height: 12, width: 200, marginBottom: 10 }} />
            <div className="skeleton" style={{ height: 8, borderRadius: 4 }} />
          </div>
        ) : (
          <ProgressBar
            value={stats?.openrouter.requestsToday ?? 0}
            max={stats?.openrouter.dailyCap ?? 200}
          />
        )}
      </div>

      {/* Stat grid */}
      <div className="grid-cols-4" style={{ marginBottom: 24 }}>
        <StatCard label="Total Users"      value={stats?.users.total ?? 0}            sub="all time"  loading={loading} />
        <StatCard label="Verified Users"   value={stats?.users.verified ?? 0}         sub={`${stats?.users.unverified ?? 0} unverified`} loading={loading} />
        <StatCard label="Total Projects"   value={stats?.projects.total ?? 0}         sub={`${stats?.projects.published ?? 0} published`} loading={loading} />
        <StatCard label="Total Revenue"    value={stats?.transactions.totalRevenue ?? 0} format="currency" loading={loading} accent />
      </div>

      <div className="grid-cols-4" style={{ marginBottom: 28 }}>
        <StatCard label="Published Sites"  value={stats?.projects.published ?? 0}     sub={`${stats?.projects.draft ?? 0} drafts`} loading={loading} />
        <StatCard label="Completed Orders" value={stats?.transactions.completed ?? 0} sub={`${stats?.transactions.failed ?? 0} failed`} loading={loading} />
        <StatCard label="Generations (30d)"value={stats?.generation.versionsCreated30d ?? 0} sub="versions created" loading={loading} />
        <StatCard label="Total Transactions" value={stats?.transactions.total ?? 0}   loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid-cols-2" style={{ marginBottom: 24 }}>
        <div className="chart-container">
          <div className="chart-title">New Signups (last 30 days)</div>
          {loading ? <div className="skeleton" style={{ height: 160 }} /> : <LineChart data={signupData} label="Signups" />}
        </div>
        <div className="chart-container">
          <div className="chart-title">Revenue (last 30 days)</div>
          {loading ? <div className="skeleton" style={{ height: 160 }} /> : <LineChart data={revenueData} label="Revenue (₹)" color="#22c55e" />}
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title">Design System Usage</div>
        {loading ? <div className="skeleton" style={{ height: 180 }} /> : <BarChart data={dsData} label="Projects using" />}
      </div>
    </div>
  )
}
