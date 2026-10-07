import { useNavigate } from 'react-router-dom'
import { ArrowRight, AlertTriangle, AlertCircle, Info } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AttentionItem {
  id: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  entityId: string
  entityType: 'source' | 'chain' | 'gadget' | 'run'
  action: string
  route: string
}

// ─── Inline fallback data ─────────────────────────────────────────────────────

const fallbackItems: AttentionItem[] = [
  {
    id: 'ATT-001',
    severity: 'HIGH',
    title: 'Unmitigated SSRF chain active',
    description: 'CHN-001 remains REPRODUCED with no verified mitigation deployed to this fixture.',
    entityId: 'CHN-001',
    entityType: 'chain',
    action: 'View chain',
    route: '/chains/CHN-001',
  },
  {
    id: 'ATT-002',
    severity: 'HIGH',
    title: 'Auth bypass reproduced',
    description: 'CHN-003 demonstrates privilege escalation via session admin flag pollution.',
    entityId: 'CHN-003',
    entityType: 'chain',
    action: 'Inspect chain',
    route: '/chains/CHN-003',
  },
  {
    id: 'ATT-003',
    severity: 'MEDIUM',
    title: 'GAD-004 mitigation unverified',
    description: 'node-fetch agent gadget mitigation strategy is not yet confirmed by a lab run.',
    entityId: 'GAD-004',
    entityType: 'gadget',
    action: 'View gadget',
    route: '/gadgets',
  },
  {
    id: 'ATT-004',
    severity: 'LOW',
    title: 'SRC-006 inconclusive status',
    description: 'GraphQL Variable Flatten source remains INCONCLUSIVE — needs further reproduction.',
    entityId: 'SRC-006',
    entityType: 'source',
    action: 'View source',
    route: '/sources',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const severityBorderMap: Record<AttentionItem['severity'], string> = {
  HIGH: 'border-l-coral',
  MEDIUM: 'border-l-marigold',
  LOW: 'border-l-sage',
}

const severityTextMap: Record<AttentionItem['severity'], string> = {
  HIGH: 'text-coral',
  MEDIUM: 'text-marigold',
  LOW: 'text-sage',
}

const severityIconMap: Record<AttentionItem['severity'], React.ElementType> = {
  HIGH: AlertTriangle,
  MEDIUM: AlertCircle,
  LOW: Info,
}

const MAX_SHOWN = 4

// ─── Component ────────────────────────────────────────────────────────────────

export default function AttentionCenter() {
  const nav = useNavigate()

  // Use inline fallback data (mockAttentionItems not yet in mockData.ts — added by a separate agent)
  const items: AttentionItem[] = fallbackItems

  const shown = items.slice(0, MAX_SHOWN)
  const hasMore = items.length > MAX_SHOWN

  return (
    <div>
      <div className="space-y-2">
        {shown.map(item => {
          const Icon = severityIconMap[item.severity]
          return (
            <div
              key={item.id}
              className={`
                bg-surface border border-border border-l-2 ${severityBorderMap[item.severity]}
                rounded-md pl-3 pr-4 py-3 flex items-start gap-3
              `}
            >
              <Icon size={14} className={`mt-0.5 flex-shrink-0 ${severityTextMap[item.severity]}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-mono font-semibold ${severityTextMap[item.severity]}`}>
                        {item.severity}
                      </span>
                      <span className="text-xs font-medium text-ivory/80 truncate">{item.title}</span>
                    </div>
                    <p className="text-xs text-ivory/40 leading-snug">{item.description}</p>
                  </div>
                  <button
                    onClick={() => nav(item.route)}
                    className="flex-shrink-0 text-xs text-ivory/35 hover:text-ivory transition-colors font-mono flex items-center gap-0.5 mt-0.5"
                  >
                    {item.action} <ArrowRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {hasMore && (
        <button
          onClick={() => nav('/sources')}
          className="mt-2 flex items-center gap-1 text-xs text-ivory/35 hover:text-ivory transition-colors font-mono"
        >
          See all {items.length} items <ArrowRight size={11} />
        </button>
      )}
    </div>
  )
}
