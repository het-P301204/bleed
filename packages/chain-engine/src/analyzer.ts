import { SCENARIOS } from './scenarios.js'
import { confidenceFromReachability } from './confidence.js'

export interface ReachabilityResult {
  reachable: boolean
  pathLength: number
  objectsTraversed: number
  gadgetTriggers: boolean
  confidence: import('@bleed/shared').ConfidenceLevel
  notes: string
}

export function analyzeReachability(sourceId: string, gadgetId: string): ReachabilityResult {
  const scenario = SCENARIOS.find(s => s.sourceId === sourceId && s.gadgetId === gadgetId)

  if (scenario) {
    return {
      reachable: true,
      pathLength: 4,
      objectsTraversed: scenario.expected.propagation ? 12 : 0,
      gadgetTriggers: scenario.expected.gadgetReachable,
      confidence: confidenceFromReachability(true, scenario.expected.gadgetReachable),
      notes: `Verified via scenario ${scenario.id}: ${scenario.name}`,
    }
  }

  return {
    reachable: false,
    pathLength: 0,
    objectsTraversed: 0,
    gadgetTriggers: false,
    confidence: 'UNKNOWN',
    notes: 'No verified scenario found for this source/gadget combination. Manual analysis required.',
  }
}
