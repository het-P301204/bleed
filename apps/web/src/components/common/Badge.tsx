import type { ChainStatus, GadgetStatus, SourceStatus, ConfidenceLevel } from '@bleed/shared'

type StatusType = ChainStatus | GadgetStatus | SourceStatus | ConfidenceLevel | string

const statusColors: Record<string, string> = {
  REPRODUCED: 'bg-coral/15 text-coral border-coral/30',
  BLOCKED: 'bg-sage/15 text-sage border-sage/30',
  HARDENED_BLOCKED: 'bg-sage/15 text-sage border-sage/30',
  REACHABLE: 'bg-marigold/15 text-marigold border-marigold/30',
  POTENTIAL: 'bg-iris/15 text-iris border-iris/30',
  INCONCLUSIVE: 'bg-ivory/10 text-ivory/50 border-ivory/20',
  ERROR: 'bg-coral/20 text-coral border-coral/40',
  CONFIRMED: 'bg-sage/15 text-sage border-sage/30',
  HIGH: 'bg-marigold/15 text-marigold border-marigold/30',
  MEDIUM: 'bg-iris/15 text-iris border-iris/30',
  UNKNOWN: 'bg-ivory/10 text-ivory/40 border-ivory/20',
  THEORETICAL: 'bg-iris/15 text-iris border-iris/30',
  VULNERABLE: 'bg-coral/15 text-coral border-coral/30',
  HARDENED: 'bg-sage/15 text-sage border-sage/30',
  BEGINNER: 'bg-sage/15 text-sage border-sage/30',
  INTERMEDIATE: 'bg-marigold/15 text-marigold border-marigold/30',
  ADVANCED: 'bg-coral/15 text-coral border-coral/30',
  READY: 'bg-sage/15 text-sage border-sage/30',
  STARTING: 'bg-marigold/15 text-marigold border-marigold/30',
  STOPPED: 'bg-ivory/10 text-ivory/40 border-ivory/20',
}

interface BadgeProps {
  status: StatusType
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: BadgeProps) {
  const color = statusColors[status] ?? 'bg-ivory/10 text-ivory/50 border-ivory/20'
  const cls = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
  return (
    <span className={`inline-flex items-center font-mono font-medium rounded border ${color} ${cls}`}>
      {status}
    </span>
  )
}

interface CategoryBadgeProps {
  label: string
  variant?: 'default' | 'iris' | 'plum'
}

export function Badge({ label, variant = 'default' }: CategoryBadgeProps) {
  const colors = {
    default: 'bg-ivory/10 text-ivory/70 border-ivory/20',
    iris: 'bg-iris/15 text-iris border-iris/30',
    plum: 'bg-plum/30 text-ivory/70 border-plum/40',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono rounded border ${colors[variant]}`}>
      {label}
    </span>
  )
}
