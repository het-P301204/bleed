import { mockLabState } from '../../api/mockData'
import type { LabServiceStatus } from '@bleed/shared'

// ─── Extra synthetic services not in mockLabState.services ───────────────────

interface StatusRow {
  id: string
  name: string
  status: LabServiceStatus
  statusText: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dotColor(status: LabServiceStatus): string {
  switch (status) {
    case 'READY': return 'bg-sage'
    case 'STARTING': return 'bg-marigold animate-pulse'
    case 'ERROR': return 'bg-coral'
    case 'STOPPED': return 'bg-border'
    default: return 'bg-ivory/20'
  }
}

function statusLabel(status: LabServiceStatus): string {
  switch (status) {
    case 'READY': return 'ready'
    case 'STARTING': return 'starting…'
    case 'ERROR': return 'error'
    case 'STOPPED': return 'stopped'
    default: return 'unknown'
  }
}

function statusTextColor(status: LabServiceStatus): string {
  switch (status) {
    case 'READY': return 'text-sage'
    case 'STARTING': return 'text-marigold'
    case 'ERROR': return 'text-coral'
    default: return 'text-ivory/30'
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SystemStatus() {
  const lab = mockLabState

  // Build rows: 4 from services + 2 synthetic
  const serviceRows: StatusRow[] = lab.services.map(svc => ({
    id: svc.id,
    name: svc.name,
    status: svc.status,
    statusText: statusLabel(svc.status),
  }))

  const syntheticRows: StatusRow[] = [
    {
      id: 'svc-analysis',
      name: 'Analysis Engine',
      status: 'READY',
      statusText: 'ready',
    },
    {
      id: 'svc-dataset',
      name: 'Demo Dataset',
      status: 'READY',
      statusText: `${lab.services.length > 0 ? 'loaded' : 'ready'}`,
    },
  ]

  // Final ordered list matching spec: BLEED API, Analysis Engine, Demo Dataset, Lab, HTTP Sim, Auth Sim
  const allRows: StatusRow[] = [
    serviceRows[0]!, // BLEED API
    syntheticRows[0]!, // Analysis Engine
    syntheticRows[1]!, // Demo Dataset
    {
      id: 'svc-lab-overall',
      name: 'Lab (overall)',
      status: (lab.status === 'READY' ? 'READY' : lab.status === 'STARTING' ? 'STARTING' : 'ERROR') as LabServiceStatus,
      statusText: lab.status.toLowerCase(),
    },
    serviceRows[1]!, // http-sim
    serviceRows[3]!, // auth-sim
  ].filter(Boolean)

  return (
    <div className="space-y-1.5">
      {allRows.map(row => (
        <div key={row.id} className="flex items-center gap-3 py-1.5 px-1">
          {/* Status dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(row.status)}`} />

          {/* Service name */}
          <span className="flex-1 text-xs text-ivory/70 font-medium truncate">
            {row.name}
          </span>

          {/* Status text */}
          <span className={`text-xs font-mono ${statusTextColor(row.status)}`}>
            {row.statusText}
          </span>
        </div>
      ))}

      {lab.startedAt && (
        <div className="pt-2 mt-1 border-t border-border">
          <span className="text-xs font-mono text-ivory/20">
            up {Math.floor((Date.now() - lab.startedAt) / 60000)}m
          </span>
        </div>
      )}
    </div>
  )
}
