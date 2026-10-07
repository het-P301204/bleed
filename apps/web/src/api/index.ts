import type {
  PollutionSource, Gadget, Chain, ResearchRun, Scenario, LabState, BleedMetrics,
} from '@bleed/shared'
import {
  mockSources, mockGadgets, mockChains, mockRuns, mockScenarios,
  mockLabState, mockMetrics,
} from './mockData'

// All API functions fall back to mock data when the server is unavailable

async function safeFetch<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

export const sourcesApi = {
  list: () => safeFetch<PollutionSource[]>(
    async () => { const r = await fetch('/api/sources'); return r.json() },
    mockSources
  ),
  get: (id: string) => safeFetch<PollutionSource | undefined>(
    async () => { const r = await fetch(`/api/sources/${id}`); return r.json() },
    mockSources.find(s => s.id === id)
  ),
}

export const gadgetsApi = {
  list: () => safeFetch<Gadget[]>(
    async () => { const r = await fetch('/api/gadgets'); return r.json() },
    mockGadgets
  ),
  get: (id: string) => safeFetch<Gadget | undefined>(
    async () => { const r = await fetch(`/api/gadgets/${id}`); return r.json() },
    mockGadgets.find(g => g.id === id)
  ),
}

export const chainsApi = {
  list: () => safeFetch<Chain[]>(
    async () => { const r = await fetch('/api/chains'); return r.json() },
    mockChains
  ),
  get: (id: string) => safeFetch<Chain | undefined>(
    async () => { const r = await fetch(`/api/chains/${id}`); return r.json() },
    mockChains.find(c => c.id === id)
  ),
  build: async (payload: { sourceId: string; gadgetId: string; labTarget: string }) => {
    try {
      const r = await fetch('/api/chains', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      return r.json() as Promise<Chain>
    } catch {
      const chain = mockChains[0]!
      return { ...chain, id: `CHN-${Date.now()}`, createdAt: Date.now() }
    }
  },
}

export const runsApi = {
  list: () => safeFetch<ResearchRun[]>(
    async () => { const r = await fetch('/api/runs'); return r.json() },
    mockRuns
  ),
  get: (id: string) => safeFetch<ResearchRun | undefined>(
    async () => { const r = await fetch(`/api/runs/${id}`); return r.json() },
    mockRuns.find(r => r.id === id)
  ),
}

export const scenariosApi = {
  list: () => safeFetch<Scenario[]>(
    async () => { const r = await fetch('/api/scenarios'); return r.json() },
    mockScenarios
  ),
  get: (id: string) => safeFetch<Scenario | undefined>(
    async () => { const r = await fetch(`/api/scenarios/${id}`); return r.json() },
    mockScenarios.find(s => s.id === id)
  ),
  run: async (id: string, mode: 'vulnerable' | 'hardened' = 'vulnerable'): Promise<ResearchRun> => {
    const r = await fetch(`/api/scenarios/${id}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode }),
    })
    if (!r.ok) throw new Error(`Scenario run failed: ${r.status}`)
    return r.json() as Promise<ResearchRun>
  },
}

export const labApi = {
  state: () => safeFetch<LabState>(
    async () => { const r = await fetch('/api/lab/state'); return r.json() },
    mockLabState
  ),
}

export const metricsApi = {
  get: () => safeFetch<BleedMetrics>(
    async () => { const r = await fetch('/api/metrics'); return r.json() },
    mockMetrics
  ),
}
