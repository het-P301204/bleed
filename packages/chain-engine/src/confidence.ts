import type { Chain, ConfidenceLevel } from '@bleed/shared'

export function getChainConfidence(chain: Chain): ConfidenceLevel {
  if (chain.status === 'REPRODUCED') return 'CONFIRMED'
  if (chain.status === 'REACHABLE') return 'HIGH'
  if (chain.status === 'POTENTIAL') return 'MEDIUM'
  return 'UNKNOWN'
}

export function confidenceFromReachability(reachable: boolean, gadgetTriggers: boolean): ConfidenceLevel {
  if (reachable && gadgetTriggers) return 'HIGH'
  if (reachable) return 'MEDIUM'
  return 'UNKNOWN'
}
