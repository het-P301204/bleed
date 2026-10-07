import type { GadgetCategory } from '@bleed/shared'

export const CATEGORY_LABELS: Record<GadgetCategory, string> = {
  ROUTING: 'Network Routing',
  AUTH: 'Authentication / Authorization',
  HTTP: 'HTTP Manipulation',
  EXECUTION_SIM: 'Execution Simulation',
  FILE: 'File System',
  CALLBACK: 'Callback Injection',
}

export function getCategoryLabel(category: GadgetCategory): string {
  return CATEGORY_LABELS[category]
}

export function isValidCategory(value: string): value is GadgetCategory {
  return value in CATEGORY_LABELS
}
