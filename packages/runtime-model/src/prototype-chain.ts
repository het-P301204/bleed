export function capturePrototypeBaseline(): Set<string> {
  return new Set(Object.getOwnPropertyNames(Object.prototype))
}

export function detectPrototypePollution(baseline: Set<string>): string[] {
  return Object.getOwnPropertyNames(Object.prototype).filter(k => !baseline.has(k))
}

export function restorePrototype(baseline: Set<string>): void {
  for (const key of Object.getOwnPropertyNames(Object.prototype)) {
    if (!baseline.has(key)) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete (Object.prototype as Record<string, unknown>)[key]
    }
  }
}
