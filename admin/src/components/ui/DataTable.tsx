import { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Column<T> {
  key: string
  label: string
  render?: (row: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  page?: number
  pages?: number
  onPageChange?: (page: number) => void
  total?: number
  limit?: number
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j}>
              <div className="skeleton" style={{ height: 14, width: j === 0 ? 140 : 80, borderRadius: 3 }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, loading, page = 1, pages = 1, onPageChange, total, limit, emptyMessage = 'No data found', onRowClick
}: DataTableProps<T>) {
  return (
    <div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={col.width ? { width: col.width } : {}}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={columns.length} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-disabled)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={onRowClick ? { cursor: 'pointer' } : {}}
                >
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && onPageChange && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {total != null && limit != null
              ? `${((page - 1) * limit) + 1}–${Math.min(page * limit, total)} of ${total.toLocaleString()}`
              : `Page ${page} of ${pages}`
            }
          </div>
          <div className="pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: Math.min(pages, 7) }).map((_, i) => {
              let p = i + 1
              if (pages > 7) {
                if (page <= 4) p = i + 1
                else if (page >= pages - 3) p = pages - 6 + i
                else p = page - 3 + i
              }
              return (
                <button
                  key={p}
                  className={`page-btn${p === page ? ' active' : ''}`}
                  onClick={() => onPageChange(p)}
                >
                  {p}
                </button>
              )
            })}
            <button className="page-btn" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
