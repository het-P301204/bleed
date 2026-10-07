import { randomUUID } from 'node:crypto'
import type { Chain, ChainNode, ChainEdge, ChainStatus, ControlledImpact } from '@bleed/shared'
import { getGadgetById } from '@bleed/gadget-engine'
import { SCENARIOS } from './scenarios.js'
import { analyzeReachability } from './analyzer.js'
import { confidenceFromReachability } from './confidence.js'

export function buildChain(sourceId: string, gadgetId: string, scenarioId: string): Chain {
  const reachability = analyzeReachability(sourceId, gadgetId)
  const gadget = getGadgetById(gadgetId)
  const scenario = SCENARIOS.find(s => s.id === scenarioId)

  const property = scenario?.property ?? gadget?.property ?? 'unknown'
  const impact: ControlledImpact = gadget?.impactClass ?? 'NONE'
  const status: ChainStatus = reachability.reachable ? 'REACHABLE' : 'POTENTIAL'
  const confidence = confidenceFromReachability(reachability.reachable, reachability.gadgetTriggers)

  const nodes: ChainNode[] = [
    { id: 'n-input', type: 'INPUT', label: 'Untrusted JSON Input' },
    { id: 'n-merge', type: 'MERGE', label: `Source: ${sourceId}`, property },
    { id: 'n-proto', type: 'PROTOTYPE', label: 'Object.prototype', property },
    {
      id: 'n-gadget',
      type: 'GADGET',
      label: gadget ? `${gadget.library}: ${gadget.property}` : gadgetId,
      property,
    },
    { id: 'n-impact', type: 'IMPACT', label: impact.replace(/_/g, ' ') },
  ]

  const edges: ChainEdge[] = [
    { from: 'n-input', to: 'n-merge', type: 'WRITES' },
    { from: 'n-merge', to: 'n-proto', type: 'WRITES', property },
    { from: 'n-proto', to: 'n-gadget', type: 'INHERITS', property },
    { from: 'n-gadget', to: 'n-impact', type: 'INVOKES' },
  ]

  return {
    id: randomUUID(),
    name: scenario?.name ?? `${sourceId} → ${gadgetId}`,
    sourceId,
    property,
    gadgetIds: [gadgetId],
    impact,
    status,
    confidence,
    evidence: [],
    nodes,
    edges,
    scenarioId,
    createdAt: Date.now(),
  }
}
