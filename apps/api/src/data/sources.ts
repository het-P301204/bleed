import type { PollutionSource } from '@bleed/shared'

export const SOURCES: PollutionSource[] = [
  {
    id: 'src-unsafe-merge',
    name: 'Unsafe Merge',
    description:
      'A for...in merge without own-property check allows __proto__ keys to pollute Object.prototype when processing untrusted input.',
    file: 'utils/merge.js',
    functionName: 'mergeConfig',
    property: '__proto__',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'UNSAFE_MERGE',
    vulnerableCode: `function mergeConfig(target, source) {
  for (const key in source) {
    target[key] = source[key]  // no own-property check
  }
  return target
}
// Usage: mergeConfig({}, JSON.parse(untrustedInput))`,
    hardenedCode: `function mergeConfig(target, source) {
  for (const key of Object.keys(source)) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      target[key] = source[key]
    }
  }
  return target
}`,
  },
  {
    id: 'src-recursive-merge',
    name: 'Unsafe Recursive Merge',
    description:
      'Recursive deep merge without own-property check allows {"__proto__": {"key": "val"}} payloads to pollute Object.prototype transitively.',
    file: 'utils/deepMerge.js',
    functionName: 'deepMerge',
    property: '__proto__',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'RECURSIVE_MERGE',
    vulnerableCode: `function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}
// Payload: {"__proto__": {"baseURL": "http://http-sim"}}`,
    hardenedCode: `function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {}
      deepMerge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
  return target
}`,
  },
  {
    id: 'src-deep-parser',
    name: 'Deep Object Parser',
    description:
      'Path-based property assignment (dot notation) allows "__proto__.role" paths to traverse the prototype chain and set properties on Object.prototype.',
    file: 'utils/setByPath.js',
    functionName: 'setByPath',
    property: 'role',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'DEEP_PARSER',
    vulnerableCode: `function setByPath(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}
// Path: "__proto__.role", value: "admin"`,
    hardenedCode: `function setByPath(obj, path, value) {
  const keys = path.split('.')
  const DENIED = new Set(['__proto__', 'constructor', 'prototype'])
  if (keys.some(k => DENIED.has(k))) throw new Error('Forbidden path segment')
  let current = obj
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {}
    current = current[keys[i]]
  }
  current[keys[keys.length - 1]] = value
}`,
  },
  {
    id: 'src-config-merge',
    name: 'Configuration Merge',
    description:
      'Object.assign-based config merging where userOptions with a __proto__ property spreads it onto the target via assignment.',
    file: 'utils/buildConfig.js',
    functionName: 'buildConfig',
    property: 'headers',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'CONFIG_MERGE',
    vulnerableCode: `function buildConfig(defaults, userOptions) {
  const config = {}
  Object.assign(config, defaults)
  Object.assign(config, userOptions)  // userOptions can contain __proto__
  return config
}`,
    hardenedCode: `function buildConfig(defaults, userOptions) {
  const sanitized = JSON.parse(JSON.stringify(userOptions))
  return Object.assign(Object.create(null), defaults, sanitized)
}`,
  },
  {
    id: 'src-property-assign',
    name: 'Unsafe Property Assignment',
    description:
      'Direct property assignment without key validation. Object.keys skips __proto__ but allows constructor.prototype paths when used carelessly.',
    file: 'utils/applyOptions.js',
    functionName: 'applyOptions',
    property: 'constructor',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'PROPERTY_ASSIGN',
    vulnerableCode: `function applyOptions(target, options) {
  for (const key of Object.keys(options)) {
    target[key] = options[key]
  }
}
// Object.keys won't include __proto__ as enumerable but constructor.prototype can be set`,
    hardenedCode: `function applyOptions(target, options) {
  const DENY = new Set(['__proto__', 'constructor', 'prototype'])
  for (const key of Object.keys(options)) {
    if (!DENY.has(key)) target[key] = options[key]
  }
}`,
  },
  {
    id: 'src-query-normalize',
    name: 'Query Object Normalization',
    description:
      'for...in iteration over a raw query object copies all enumerable properties, including inherited ones from Object.prototype, into the result.',
    file: 'utils/normalizeQuery.js',
    functionName: 'normalizeQuery',
    property: '__proto__',
    fixtureId: 'vulnerable-app',
    evidence: [],
    status: 'CONFIRMED',
    category: 'QUERY_NORMALIZE',
    vulnerableCode: `function normalizeQuery(rawQuery) {
  const result = {}
  for (const key in rawQuery) {  // for...in iterates inherited too
    result[key] = rawQuery[key]
  }
  return result
}`,
    hardenedCode: `function normalizeQuery(rawQuery) {
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(rawQuery)) {
    result[key] = (rawQuery as Record<string, unknown>)[key]
  }
  return result
}`,
  },
]

export function getSourceById(id: string): PollutionSource | undefined {
  return SOURCES.find(s => s.id === id)
}
