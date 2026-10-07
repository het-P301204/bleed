import { useNavigate } from 'react-router-dom'
import { mockSources, mockChains, mockGadgets } from '../../api/mockData'
import type { GadgetCategory } from '@bleed/shared'

// ─── Constants ────────────────────────────────────────────────────────────────

const COLUMNS: GadgetCategory[] = ['ROUTING', 'AUTH', 'HTTP', 'EXECUTION_SIM', 'FILE', 'CALLBACK']

const COL_LABELS: Record<GadgetCategory, string> = {
  ROUTING: 'ROUTING',
  AUTH: 'AUTH',
  HTTP: 'HTTP',
  EXECUTION_SIM: 'EXEC',
  FILE: 'FILE',
  CALLBACK: 'CBCK',
}

// ─── Cell color ───────────────────────────────────────────────────────────────

function cellBg(count: number): string {
  if (count === 0) return 'bg-border'
  if (count === 1) return 'bg-coral/20'
  if (count === 2) return 'bg-coral/40'
  return 'bg-coral/70'
}

function cellText(count: number): string {
  if (count === 0) return 'text-ivory/20'
  if (count === 1) return 'text-coral/50'
  return 'text-coral/90'
}

// ─── Build matrix ─────────────────────────────────────────────────────────────

function buildMatrix() {
  // source → gadget category → chain count
  const matrix: Record<string, Record<GadgetCategory, { count: number; statuses: string[] }>> = {}

  const gadgetById = Object.fromEntries(mockGadgets.map(g => [g.id, g]))

  for (const chain of mockChains) {
    const srcId = chain.sourceId
    if (!matrix[srcId]) {
      matrix[srcId] = Object.fromEntries(
        COLUMNS.map(c => [c, { count: 0, statuses: [] }])
      ) as unknown as Record<GadgetCategory, { count: number; statuses: string[] }>
    }

    for (const gid of chain.gadgetIds) {
      const gadget = gadgetById[gid]
      if (!gadget) continue
      const cat = gadget.category as GadgetCategory
      if (COLUMNS.includes(cat)) {
        matrix[srcId]![cat]!.count++
        matrix[srcId]![cat]!.statuses.push(chain.status)
      }
    }
  }

  return matrix
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResearchHeatmap() {
  const nav = useNavigate()
  const topSources = mockSources.slice(0, 8)
  const matrix = buildMatrix()

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* Column headers */}
          <thead>
            <tr>
              <th className="w-36 text-left pb-2" />
              {COLUMNS.map(col => (
                <th key={col} className="pb-2 text-center">
                  <span
                    className="text-xs font-mono text-ivory/35 block"
                    style={{ writingMode: 'initial' }}
                  >
                    {COL_LABELS[col]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {topSources.map(src => {
              const row = matrix[src.id] ?? Object.fromEntries(
                COLUMNS.map(c => [c, { count: 0, statuses: [] }])
              ) as unknown as Record<GadgetCategory, { count: number; statuses: string[] }>

              return (
                <tr key={src.id}>
                  {/* Row label */}
                  <td className="pr-3 py-1">
                    <span
                      className="text-xs font-mono text-ivory/50 block truncate max-w-[136px]"
                      title={src.name}
                    >
                      {src.name.slice(0, 16)}
                    </span>
                  </td>

                  {/* Cells */}
                  {COLUMNS.map(col => {
                    const cell = row[col]!
                    const status = cell.statuses[0] ?? 'NONE'
                    return (
                      <td key={col} className="py-1 px-0.5 text-center">
                        <button
                          title={`${cell.count} chain${cell.count !== 1 ? 's' : ''}, status: ${status}`}
                          onClick={() => nav('/chains')}
                          className={`
                            w-9 h-9 rounded-sm font-mono text-xs transition-all
                            hover:opacity-80 hover:scale-105
                            ${cellBg(cell.count)} ${cellText(cell.count)}
                          `}
                        >
                          {cell.count > 0 ? cell.count : ''}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <span className="text-xs font-mono text-ivory/30">chains:</span>
        {[
          { label: '0', bg: 'bg-border' },
          { label: '1', bg: 'bg-coral/20' },
          { label: '2', bg: 'bg-coral/40' },
          { label: '3+', bg: 'bg-coral/70' },
        ].map(({ label, bg }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs font-mono text-ivory/40">
            <span className={`w-3 h-3 rounded-sm ${bg}`} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-xs text-ivory/20 font-mono">deeper = more chains</span>
      </div>
    </div>
  )
}
