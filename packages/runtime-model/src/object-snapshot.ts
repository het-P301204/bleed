import { randomUUID } from 'node:crypto'
import type { ObjectState, ObjectProperty } from '@bleed/shared'

const BASELINE_PROTO_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype))

export function snapshotObject(obj: object, label: string): ObjectState {
  const ownProperties: ObjectProperty[] = []
  const inheritedProperties: ObjectProperty[] = []
  const prototypeChain: string[] = []

  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = (obj as Record<string, unknown>)[key]
    ownProperties.push({ key, value, type: typeof value, own: true })
  }

  let proto = Object.getPrototypeOf(obj) as object | null
  while (proto !== null) {
    const anyProto = proto as Record<string, unknown>
    const ctorName =
      typeof anyProto['constructor'] === 'function'
        ? (anyProto['constructor'] as { name: string }).name
        : 'Object'
    prototypeChain.push(ctorName)

    for (const key of Object.getOwnPropertyNames(proto)) {
      if (!BASELINE_PROTO_KEYS.has(key)) {
        const value = (proto as Record<string, unknown>)[key]
        inheritedProperties.push({
          key,
          value,
          type: typeof value,
          own: false,
          origin: 'Object.prototype',
        })
      }
    }

    proto = Object.getPrototypeOf(proto)
  }

  return {
    id: randomUUID(),
    timestamp: Date.now(),
    label,
    ownProperties,
    inheritedProperties,
    prototypeChain,
    polluted: inheritedProperties.length > 0,
  }
}
