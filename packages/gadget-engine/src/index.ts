import { GADGETS } from './gadgets.js'
import { matchGadgetsToPackages } from './matcher.js'

export type { GadgetCategory } from '@bleed/shared'
export { getCategoryLabel, isValidCategory } from './categories.js'
export { matchGadgetsToPackages }

export function getAllGadgets() {
  return GADGETS
}

export function getGadgetById(id: string) {
  return GADGETS.find(g => g.id === id)
}

export function findGadgetsForProperty(property: string) {
  return GADGETS.filter(g => g.property === property)
}

export function findGadgetsForLibrary(library: string) {
  return GADGETS.filter(g => g.library === library)
}
