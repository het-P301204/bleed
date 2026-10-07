import type { LabState, LabService } from '@bleed/shared'

interface LabTopologyProps {
  lab: LabState
}

const positions: Record<string, { x: number; y: number }> = {
  'svc-api': { x: 200, y: 40 },
  'svc-http-sim': { x: 60, y: 160 },
  'svc-exec-sim': { x: 200, y: 160 },
  'svc-auth-sim': { x: 340, y: 160 },
}

const connections = [
  ['svc-api', 'svc-http-sim'],
  ['svc-api', 'svc-exec-sim'],
  ['svc-api', 'svc-auth-sim'],
]

const statusColor: Record<string, string> = {
  READY: '#7F9B80',
  STARTING: '#D6A944',
  STOPPED: '#444',
  ERROR: '#E45D4B',
  UNKNOWN: '#444',
}

export default function LabTopology({ lab }: LabTopologyProps) {
  const serviceMap = Object.fromEntries(lab.services.map((s: LabService) => [s.id, s]))

  return (
    <div className="rounded-lg border border-border bg-surface/50 p-4">
      <h3 className="text-xs font-mono text-ivory/40 uppercase tracking-wider mb-4">Docker Network Topology</h3>
      <svg viewBox="0 0 400 230" className="w-full" style={{ maxHeight: 220 }}>
        {/* Network background */}
        <rect x="20" y="20" width="360" height="190" rx="12" fill="#171717" stroke="#2A2A2A" strokeWidth="1" />
        <text x="30" y="15" style={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#4a4a4a' }}>bleed_network</text>

        {/* Connections */}
        {connections.map(([from, to], i) => {
          const a = positions[from!]
          const b = positions[to!]
          if (!a || !b) return null
          return (
            <line
              key={i}
              x1={a.x + 50}
              y1={a.y + 24}
              x2={b.x + 50}
              y2={b.y}
              stroke="#2A2A2A"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          )
        })}

        {/* Nodes */}
        {lab.services.map((svc: LabService) => {
          const pos = positions[svc.id]
          if (!pos) return null
          const color = statusColor[svc.status] ?? '#444'
          return (
            <g key={svc.id}>
              <rect
                x={pos.x}
                y={pos.y}
                width={100}
                height={44}
                rx={6}
                fill="#1E1E1E"
                stroke={color}
                strokeWidth="1.5"
              />
              <circle cx={pos.x + 90} cy={pos.y + 10} r={4} fill={color} />
              <text x={pos.x + 10} y={pos.y + 16} style={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#F5F0E7', fontWeight: 600 }}>
                {svc.name}
              </text>
              <text x={pos.x + 10} y={pos.y + 30} style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#666' }}>
                :{svc.port}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
