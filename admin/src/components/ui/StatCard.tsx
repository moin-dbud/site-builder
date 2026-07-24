import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  format?: 'number' | 'currency' | 'percent'
  sub?: string
  trend?: number // positive = up, negative = down
  loading?: boolean
  accent?: boolean
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.floor(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  return count
}

function formatValue(val: number, format: string) {
  if (format === 'currency') return `₹${val.toLocaleString('en-IN')}`
  if (format === 'percent') return `${val}%`
  return val.toLocaleString()
}

export default function StatCard({ label, value, format = 'number', sub, trend, loading, accent }: StatCardProps) {
  const count = useCountUp(value)

  if (loading) {
    return (
      <div className="stat-card">
        <div className="skeleton" style={{ height: 12, width: 80, marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 32, width: 120 }} />
        <div className="skeleton" style={{ height: 11, width: 100, marginTop: 8 }} />
      </div>
    )
  }

  return (
    <div className="stat-card" style={accent ? { borderColor: 'var(--accent)', background: 'var(--accent-dim)' } : {}}>
      <div className="stat-label">{label}</div>
      <div className="stat-value animate-count" style={accent ? { color: 'var(--accent)' } : {}}>
        {formatValue(count, format)}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {sub && <div className="stat-sub">{sub}</div>}
        {trend !== undefined && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
            color: trend > 0 ? 'var(--success)' : trend < 0 ? 'var(--danger)' : 'var(--text-disabled)'
          }}>
            {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  )
}
