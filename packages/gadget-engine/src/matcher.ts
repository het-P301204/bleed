import type { DependencyRecord } from '@bleed/shared'
import { GADGETS } from './gadgets.js'

export function matchGadgetsToPackages(packages: Record<string, string>): DependencyRecord[] {
  return Object.entries(packages).map(([name, version]) => {
    const matchingGadgets = GADGETS.filter(g => g.library === name)
    return {
      name,
      version,
      potentialGadgets: matchingGadgets.map(g => g.id),
      potentialSources: [],
      confirmedInFixture: matchingGadgets.some(g => g.status === 'REPRODUCED'),
    }
  })
}
