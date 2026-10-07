import { analyzeReachability, buildChain, getScenarios, getScenarioById } from '@bleed/chain-engine'
import type { Chain } from '@bleed/shared'

export { analyzeReachability, getScenarios, getScenarioById }

export function buildAndReturnChain(sourceId: string, gadgetId: string, scenarioId = ''): Chain {
  return buildChain(sourceId, gadgetId, scenarioId)
}
