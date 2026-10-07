import type { Scenario } from '@bleed/shared'

export const SCENARIOS: Scenario[] = [
  {
    id: 'scn-baseurl',
    name: 'Synthetic baseURL Routing Chain',
    description:
      'Unsafe recursive merge pollutes Object.prototype.baseURL; Axios HTTP client inherits it and routes requests to the controlled lab target.',
    difficulty: 'BEGINNER',
    fixtureId: 'vulnerable-app',
    sourceId: 'src-recursive-merge',
    property: 'baseURL',
    gadgetId: 'GDG-AXIOS-001',
    impact: 'SYNTHETIC_SSRF',
    labTarget: 'http-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['axios', 'ssrf', 'routing', 'beginner'],
  },
  {
    id: 'scn-method',
    name: 'Synthetic HTTP Method Override',
    description:
      'Unsafe merge pollutes Object.prototype.method; Axios reads method from the polluted prototype.',
    difficulty: 'BEGINNER',
    fixtureId: 'vulnerable-app',
    sourceId: 'src-unsafe-merge',
    property: 'method',
    gadgetId: 'GDG-AXIOS-002',
    impact: 'SYNTHETIC_HTTP_MANIPULATION',
    labTarget: 'http-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['axios', 'http', 'method-override', 'beginner'],
  },
  {
    id: 'scn-role',
    name: 'Synthetic Authorization Bypass',
    description:
      'Deep object parser pollutes Object.prototype.role; auth middleware reads role without own-property check.',
    difficulty: 'INTERMEDIATE',
    fixtureId: 'vulnerable-app',
    sourceId: 'src-deep-parser',
    property: 'role',
    gadgetId: 'GDG-AUTH-001',
    impact: 'SYNTHETIC_AUTH_BYPASS',
    labTarget: 'auth-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['auth', 'privilege-escalation', 'intermediate'],
  },
  {
    id: 'scn-visitor',
    name: 'Synthetic Callback Execution',
    description:
      'Recursive merge pollutes Object.prototype.visitor; traversal function invokes it as a callback.',
    difficulty: 'ADVANCED',
    fixtureId: 'vulnerable-app',
    sourceId: 'src-recursive-merge',
    property: 'visitor',
    gadgetId: 'GDG-CB-001',
    impact: 'SYNTHETIC_EXECUTION_MARKER',
    labTarget: 'execution-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['callback', 'execution', 'advanced'],
  },
  {
    id: 'scn-headers',
    name: 'Synthetic Credential Header Injection',
    description:
      'Config merge pollutes Object.prototype.headers; Axios sends synthetic lab credentials to metadata-sim.',
    difficulty: 'INTERMEDIATE',
    fixtureId: 'vulnerable-app',
    sourceId: 'src-config-merge',
    property: 'headers',
    gadgetId: 'GDG-AXIOS-003',
    impact: 'SYNTHETIC_CREDENTIAL_FLOW',
    labTarget: 'metadata-sim',
    expected: {
      propagation: true,
      gadgetReachable: true,
      impactReproduced: true,
      hardenedBlocked: true,
    },
    tags: ['axios', 'headers', 'credential-injection', 'intermediate'],
  },
]

export function getScenarios(): Scenario[] {
  return SCENARIOS
}

export function getScenarioById(id: string): Scenario | undefined {
  return SCENARIOS.find(s => s.id === id)
}
