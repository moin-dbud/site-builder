import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as ReBarChart, Bar } from 'recharts'

const tooltipStyle = {
  backgroundColor: 'var(--bg-elevated)',
  border: '1px solid var(--border-muted)',
  borderRadius: 6,
  fontSize: 12,
  color: 'var(--text-primary)',
}

interface LineChartProps {
  data: { date: string; value: number }[]
  label?: string
  color?: string
}

export function LineChart({ data, label = 'Value', color = 'var(--accent)' }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <ReLineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: 'var(--text-disabled)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--text-disabled)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--text-muted)' }} cursor={{ stroke: 'var(--border-muted)' }} />
        <Line type="monotone" dataKey="value" name={label} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color }} />
      </ReLineChart>
    </ResponsiveContainer>
  )
}

interface BarChartProps {
  data: { name: string; value: number }[]
  label?: string
  color?: string
}

export function BarChart({ data, label = 'Count', color = 'var(--accent)' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <ReBarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill: 'var(--text-disabled)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: 'var(--text-disabled)', fontSize: 10 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-elevated)' }} />
        <Bar dataKey="value" name={label} fill={color} radius={[3, 3, 0, 0]} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}
