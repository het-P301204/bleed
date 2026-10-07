import { TrendingUp, Shield, Database, FileSearch, BarChart2 } from 'lucide-react'
import { mockChains, mockSources, mockEvidence, mockGadgets } from '../../api/mockData'

// ─── Compute insights from mock data ─────────────────────────────────────────

interface Insight {
  id: string
  icon: React.ElementType
  iconColor: string
  text: string
}

function computeInsights(): Insight[] {
  // Build gadget lookup by id
  const gadgetById = Object.fromEntries(mockGadgets.map(g => [g.id, g]))

  // 1. Sources with ROUTING gadgets via chains
  const routingSources = new Set<string>()
  for (const chain of mockChains) {
    for (const gid of chain.gadgetIds) {
      const g = gadgetById[gid]
      if (g?.category === 'ROUTING') routingSources.add(chain.sourceId)
    }
  }
  // If none (no ROUTING gadgets in demo dataset), count HTTP sources
  const httpSources = new Set<string>()
  for (const chain of mockChains) {
    for (const gid of chain.gadgetIds) {
      const g = gadgetById[gid]
      if (g?.category === 'HTTP') httpSources.add(chain.sourceId)
    }
  }

  // 2. Blocked chains
  const blockedChains = mockChains.filter(c => c.status === 'BLOCKED').length

  // 3. Most common property in REPRODUCED chains
  const reproduced = mockChains.filter(c => c.status === 'REPRODUCED')
  const propCounts: Record<string, number> = {}
  for (const chain of reproduced) {
    propCounts[chain.property] = (propCounts[chain.property] ?? 0) + 1
  }
  const topProp = Object.entries(propCounts).sort(([, a], [, b]) => b - a)[0]

  // 4. Evidence records
  const evidenceCount = mockEvidence.length

  // 5. Research coverage
  const reproducedCount = reproduced.length
  const sourceCount = mockSources.length
  const coveragePct = sourceCount > 0 ? Math.round((reproducedCount / sourceCount) * 100) : 0

  return [
    {
      id: 'ins-1',
      icon: TrendingUp,
      iconColor: 'text-coral',
      text:
        httpSources.size > 0
          ? `${httpSources.size} source${httpSources.size !== 1 ? 's' : ''} currently reach the HTTP routing gadget family`
          : `${routingSources.size} sources currently reach the ROUTING gadget family`,
    },
    {
      id: 'ins-2',
      icon: Shield,
      iconColor: 'text-sage',
      text:
        blockedChains > 0
          ? `${blockedChains} chain${blockedChains !== 1 ? 's' : ''} became blocked after hardening`
          : 'No chains have been hardened-blocked yet in this dataset',
    },
    {
      id: 'ins-3',
      icon: Database,
      iconColor: 'text-marigold',
      text: topProp
        ? `Property .${topProp[0]} appears in ${reproduced.length} reproduced chain${reproduced.length !== 1 ? 's' : ''}`
        : 'No reproduced chains in dataset yet',
    },
    {
      id: 'ins-4',
      icon: FileSearch,
      iconColor: 'text-iris',
      text: `${evidenceCount} evidence record${evidenceCount !== 1 ? 's' : ''} captured this session`,
    },
    {
      id: 'ins-5',
      icon: BarChart2,
      iconColor: 'text-ivory/50',
      text: `Research coverage: ${coveragePct}% of sources have confirmed chains`,
    },
  ]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResearchInsights() {
  const insights = computeInsights()

  return (
    <div className="space-y-2">
      {insights.map(insight => {
        const Icon = insight.icon
        return (
          <div
            key={insight.id}
            className="flex items-start gap-3 bg-surface border border-border rounded-md px-3 py-2.5"
          >
            <Icon size={14} className={`mt-0.5 flex-shrink-0 ${insight.iconColor}`} />
            <p className="text-xs text-ivory/65 leading-snug">{insight.text}</p>
          </div>
        )
      })}
    </div>
  )
}
