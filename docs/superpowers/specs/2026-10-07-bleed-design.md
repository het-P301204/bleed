# BLEED — Design Spec
**Date:** 2026-10-07  
**Status:** Approved  
**Version:** 1.0

---

## 1. Product Definition

**BLEED** is a JavaScript object-graph research laboratory that makes server-side prototype pollution chains physically observable. It is NOT a scanner — it is a research workstation that traces:

```
UNTRUSTED INPUT → POLLUTION SOURCE → OBJECT.PROTOTYPE → INHERITED PROPERTY → GADGET → CONTROLLED IMPACT
```

Primary tagline: **One property. Every object.**  
Secondary: **Trace the bleed from source to impact.**

---

## 2. Architecture

### Monorepo Layout

```
bleed/
├── apps/
│   ├── web/          # React 18 + TypeScript + Vite + Tailwind
│   └── api/          # Node.js 20 + Express + TypeScript
├── packages/
│   ├── runtime-model/   # JS prototype chain model, object state snapshots
│   ├── gadget-engine/   # Gadget inventory, version-aware matching
│   ├── chain-engine/    # Source→gadget reachability, confidence, evidence
│   ├── evidence/        # Evidence collection, run storage
│   ├── shared/          # Domain types (Chain, Gadget, PollutionSource, etc.)
│   └── ui/              # Design system components
├── lab/
│   ├── vulnerable-app/  # Intentionally unsafe Node.js fixtures
│   ├── hardened-app/    # Hardened variants
│   ├── http-sim/        # Synthetic HTTP listener
│   ├── auth-sim/        # Synthetic authorization service
│   └── metadata-sim/    # Synthetic metadata endpoint
├── scenarios/           # YAML scenario definitions
├── fixtures/            # Test fixtures
├── tests/               # Test suites
├── docs/                # Documentation
└── docker-compose.yml   # Isolated internal network
```

### Docker Network

Internal network only: `bleed-net`

```
bleed-ui (web) ─► bleed-api ─► vulnerable-app ─► http-sim
                                               └► auth-sim
                                               └► metadata-sim
```

No arbitrary outbound traffic. Lab targets are hardcoded service names.

---

## 3. Domain Model

```typescript
// Core types in packages/shared

type PollutionSource = {
  id: string              // SOURCE-0001
  name: string
  file: string
  functionName: string
  property: string        // e.g. "baseURL"
  fixtureId: string
  hardeningVariant: string
  description: string
}

type ObjectState = {
  timestamp: number
  ownProperties: Record<string, unknown>
  inheritedProperties: Record<string, unknown>
  prototypeChain: string[]
}

type PropertyPropagation = {
  property: string
  origin: 'Object.prototype'
  affectedObjects: ObjectReference[]
  evidence: Evidence[]
}

type Gadget = {
  id: string              // GDG-AXIOS-001
  library: string
  versionRange?: string
  property: string
  trigger: string
  category: 'ROUTING' | 'AUTH' | 'HTTP' | 'EXECUTION_SIM' | 'FILE'
  impactClass: string
  evidence: Evidence[]
  mitigation: Mitigation
}

type Chain = {
  id: string              // CHAIN-0001
  sourceId: string
  property: string
  gadgetIds: string[]
  impact: ControlledImpact
  status: ChainStatus
  confidence: 'CONFIRMED' | 'HIGH' | 'MEDIUM' | 'UNKNOWN'
  evidence: Evidence[]
}

type ChainStatus =
  | 'POTENTIAL'
  | 'REACHABLE'
  | 'REPRODUCED'   // preferred over "exploitable"
  | 'BLOCKED'
  | 'INCONCLUSIVE'
  | 'ERROR'

type ControlledImpact =
  | 'SYNTHETIC_SSRF'
  | 'SYNTHETIC_HTTP_MANIPULATION'
  | 'SYNTHETIC_AUTH_BYPASS'
  | 'SYNTHETIC_CREDENTIAL_FLOW'
  | 'SYNTHETIC_EXECUTION_MARKER'

type ResearchRun = {
  id: string              // RUN-2026-00001
  scenarioId: string
  fixtureVersion: string
  packageVersions: Record<string, string>
  chain: Chain
  inputs: unknown
  objectStates: ObjectState[]
  runtimeEvents: RuntimeEvent[]
  result: ChainStatus
  mitigationState: 'VULNERABLE' | 'HARDENED'
  evidence: Evidence[]
  timestamp: number
}
```

---

## 4. Frontend Pages (apps/web)

| Route | Page |
|-------|------|
| `/` | Landing — hero animation, "One property. Every object." |
| `/dashboard` | Metrics, active lab, recent runs, gadget classes |
| `/lab` | Research lab — scenario selection, fixture picker |
| `/sources` | Pollution source library |
| `/sources/:id` | Source detail — before/after object state |
| `/gadgets` | Gadget inventory |
| `/gadgets/:id` | Gadget detail |
| `/chains` | Chain library |
| `/chains/builder` | Visual chain builder |
| `/chains/:id` | Chain detail + replay |
| `/visualizer` | Interactive prototype graph |
| `/runs` | Research run history |
| `/runs/:id` | Run detail — timeline, evidence, replay |
| `/evidence` | Evidence explorer |
| `/inspector` | Object prototype inspector |
| `/methodology` | Methodology documentation |
| `/research` | Research library |
| `/settings` | Lab settings |

---

## 5. API Endpoints (apps/api)

```
GET  /api/sources              # All pollution sources
GET  /api/sources/:id          # Source detail
GET  /api/gadgets              # All gadgets
GET  /api/gadgets/:id          # Gadget detail
GET  /api/chains               # All chains
POST /api/chains/analyze       # Analyze reachability
POST /api/chains/build         # Build chain
GET  /api/chains/:id           # Chain detail
GET  /api/runs                 # All research runs
GET  /api/runs/:id             # Run detail
POST /api/runs                 # Start a new run
POST /api/runs/:id/replay      # Replay a run
GET  /api/lab/status           # Lab container status
POST /api/lab/start            # Start lab
POST /api/lab/stop             # Stop lab
GET  /api/scenarios            # All scenarios
GET  /api/scenarios/:id        # Scenario detail
POST /api/scenarios/:id/run    # Execute scenario
GET  /api/metrics              # Dashboard metrics
POST /api/dependency-scan      # Scan package.json
```

---

## 6. Pollution Sources (lab/vulnerable-app)

### SOURCE-0001: Unsafe Merge
```js
function mergeConfig(target, source) {
  for (const key in source) {
    target[key] = source[key]  // no own-property check
  }
}
```

### SOURCE-0002: Recursive Merge
```js
function deepMerge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') deepMerge(target[key] ??= {}, source[key])
    else target[key] = source[key]
  }
}
```

### SOURCE-0003: Deep Object Parser
```js
function setByPath(obj, path, value) {
  const keys = path.split('.')
  keys.reduce((acc, key, i) => {
    if (i === keys.length - 1) acc[key] = value
    else acc[key] ??= {}
    return acc[key]
  }, obj)
}
```

### SOURCE-0004: Unsafe Property Assignment
```js
function applyOptions(target, options) {
  Object.assign(target, options)  // shallow but still pollutable via constructor.prototype
}
```

### SOURCE-0005: Configuration Merge
```js
function buildConfig(defaults, userInput) {
  return { ...defaults, ...userInput }  // spread with __proto__ key
}
```

### SOURCE-0006: Query/Object Normalization
```js
function normalize(query) {
  const result = {}
  for (const [k, v] of Object.entries(query)) {
    result[k] = v  // no prototype check
  }
  return result
}
```

---

## 7. Gadget Inventory (packages/gadget-engine)

### GDG-AXIOS-001: baseURL Routing
- Library: Axios
- Property: `baseURL`
- Category: `ROUTING`
- Impact: Synthetic SSRF — request routed to `internal-api`

### GDG-AXIOS-002: method Override
- Library: Axios
- Property: `method`
- Category: `HTTP`
- Impact: Synthetic HTTP manipulation

### GDG-AXIOS-003: headers Injection
- Library: Axios
- Property: `headers`
- Category: `HTTP`
- Impact: Synthetic header injection

### GDG-AUTH-001: role Escalation
- Library: custom auth middleware
- Property: `role` / `isAdmin`
- Category: `AUTH`
- Impact: Synthetic auth bypass via `auth-sim`

### GDG-CB-001: visitor Callback
- Library: custom traversal
- Property: `visitor`
- Category: `EXECUTION_SIM`
- Impact: Synthetic execution marker `BLEED-DEMO-EXEC-001`

### GDG-NODE-001: prototype.toString
- Library: Node.js core
- Property: `toString`
- Category: `EXECUTION_SIM`
- Impact: Controlled method override marker

---

## 8. Scenario Matrix

| Scenario | Source | Property | Gadget | Impact | Hardened |
|----------|--------|----------|--------|--------|----------|
| baseurl-chain | SOURCE-0002 | baseURL | GDG-AXIOS-001 | SYNTHETIC_SSRF | BLOCKED |
| method-chain | SOURCE-0001 | method | GDG-AXIOS-002 | SYNTHETIC_HTTP_MANIPULATION | BLOCKED |
| role-chain | SOURCE-0003 | role | GDG-AUTH-001 | SYNTHETIC_AUTH_BYPASS | BLOCKED |
| visitor-chain | SOURCE-0002 | visitor | GDG-CB-001 | SYNTHETIC_EXECUTION_MARKER | BLOCKED |
| credential-chain | SOURCE-0005 | headers | GDG-AXIOS-003 | SYNTHETIC_CREDENTIAL_FLOW | BLOCKED |

---

## 9. Controlled Impact Modules

All impacts are synthetic. Lab targets are hardcoded Docker service names only.

| Impact | Lab Target | Synthetic Credential |
|--------|-----------|---------------------|
| SSRF-sim | `http-sim:3001` | — |
| Auth bypass | `auth-sim:3002` | — |
| Credential flow | `metadata-sim:3003` | `LAB_TOKEN` / `LAB_SECRET` |
| Execution marker | In-process | `BLEED-DEMO-EXEC-001` |
| HTTP manipulation | `http-sim:3001` | — |

---

## 10. Design System

**Colors:**
- Background: `#171717` (graphite)
- Surface: `#1E1E1E`
- Text: `#F5F0E7` (warm ivory)
- Stone: `#E6DED1`
- Coral: `#E45D4B` (danger / impact / source)
- Marigold: `#D6A944` (warning / medium confidence)
- Sage: `#7F9B80` (success / hardened / blocked)
- Iris: `#9082B0` (info / methodology)
- Plum: `#513D4F` (secondary)

**Typography:**
- Interface: Manrope (Google Fonts)
- Code/values: IBM Plex Mono (Google Fonts)

**Border radius:** controls 12px, cards 16px, panels 20px, hero 28px

**NO:** neon glow, cyberpunk aesthetics, skull icons, scanner vibes

---

## 11. Key Signature Features

1. **Bleed Path Animation** — property flows node-by-node through merge → prototype → config → gadget → impact
2. **Object Prototype Inspector** — click any inherited property to see origin source, timestamp, propagation count
3. **Object State Diff** — before/after with propagation path explanation
4. **Chain Replay** — step-by-step with synchronized graph + code + object state + timeline
5. **Hardened Comparison** — same scenario, vulnerable vs hardened, side by side
6. **Source → Gadget → Impact Matrix** — research summary table with run/replay/evidence per row

---

## 12. Safety Constraints

- No free-form target URL input for attack destinations
- All lab targets are enum-typed Docker service names
- Package.json upload: size limit 1MB, path traversal protection
- No arbitrary script execution from uploads
- Docker containers: no privileged mode, no host socket mount
- Network: isolated `bleed-net`, no arbitrary outbound
- Synthetic credentials only: `LAB_TOKEN`, `LAB_SECRET`, `LAB_SESSION_TOKEN`
- Impact UI always labeled: **CONTROLLED LAB IMPACT**

---

## 13. Test Suite Requirements

- Source detection: valid/harmless/nested/malformed input
- Propagation: own vs inherited, multiple objects, prototype restoration
- Gadget: reachable/unreachable/version-mismatch/mitigated
- Chain: valid/incomplete/partial/hardened-blocked
- Security: host access denied, arbitrary target denied, resource limits

Target: 100+ tests across engine packages

---

## 14. Documentation

- `README.md` — what BLEED is, why, methodology, running locally
- `docs/architecture.md`
- `docs/methodology.md`
- `docs/security.md`
- `docs/scenarios.md`
- `docs/gadget-model.md`
- `docs/research-notes.md`
- `docs/threat-model.md`
