import { randomUUID } from 'node:crypto'
import type { PropertyPropagation, ObjectReference } from '@bleed/shared'

export function tracePropertyPropagation(
  property: string,
  objects: object[],
  introducedBy = 'unknown-source',
): PropertyPropagation {
  const affectedObjects: ObjectReference[] = []

  for (const obj of objects) {
    const has = property in obj
    const hasOwn = Object.prototype.hasOwnProperty.call(obj, property)
    if (has && !hasOwn) {
      const anyObj = obj as Record<string, unknown>
      const label =
        typeof anyObj['constructor'] === 'function'
          ? (anyObj['constructor'] as { name: string }).name
          : 'Object'
      affectedObjects.push({ id: randomUUID(), label, type: typeof obj })
    }
  }

  return {
    property,
    origin: 'Object.prototype',
    introducedBy,
    affectedObjects,
    evidence: [],
    timestamp: Date.now(),
  }
}
