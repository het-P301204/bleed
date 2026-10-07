import { describe, it, expect } from 'vitest'
import { getScenarios, getScenarioById, analyzeReachability, buildChain } from '../src/index'

describe('getScenarios', () => {
  it('returns 5 scenarios', () => {
    expect(getScenarios()).toHaveLength(5)
  })

  it('all scenarios have required fields', () => {
    for (const s of getScenarios()) {
      expect(s.id).toBeTruthy()
      expect(s.sourceId).toBeTruthy()
      expect(s.gadgetId).toBeTruthy()
      expect(s.property).toBeTruthy()
    }
  })
})

describe('getScenarioById', () => {
  it('returns scn-baseurl scenario', () => {
    const s = getScenarioById('scn-baseurl')
    expect(s).toBeDefined()
    expect(s?.gadgetId).toBe('GDG-AXIOS-001')
    expect(s?.property).toBe('baseURL')
  })

  it('returns undefined for unknown id', () => {
    expect(getScenarioById('does-not-exist')).toBeUndefined()
  })
})

describe('analyzeReachability', () => {
  it('returns reachable:true for known scn-baseurl pair', () => {
    const result = analyzeReachability('src-recursive-merge', 'GDG-AXIOS-001')
    expect(result.reachable).toBe(true)
    expect(result.gadgetTriggers).toBe(true)
    expect(result.confidence).not.toBe('UNKNOWN')
  })

  it('returns reachable:true for scn-role pair', () => {
    const result = analyzeReachability('src-deep-parser', 'GDG-AUTH-001')
    expect(result.reachable).toBe(true)
  })

  it('returns reachable:false for unknown combination', () => {
    const result = analyzeReachability('src-unknown', 'GDG-UNKNOWN')
    expect(result.reachable).toBe(false)
    expect(result.confidence).toBe('UNKNOWN')
  })
})

describe('buildChain', () => {
  it('creates chain with correct sourceId', () => {
    const chain = buildChain('src-recursive-merge', 'GDG-AXIOS-001', 'scn-baseurl')
    expect(chain.sourceId).toBe('src-recursive-merge')
  })

  it('creates chain with nodes', () => {
    const chain = buildChain('src-recursive-merge', 'GDG-AXIOS-001', 'scn-baseurl')
    expect(chain.nodes.length).toBeGreaterThan(0)
  })

  it('creates chain with edges', () => {
    const chain = buildChain('src-recursive-merge', 'GDG-AXIOS-001', 'scn-baseurl')
    expect(chain.edges.length).toBeGreaterThan(0)
  })

  it('chain has REACHABLE status for known pair', () => {
    const chain = buildChain('src-recursive-merge', 'GDG-AXIOS-001', 'scn-baseurl')
    expect(chain.status).toBe('REACHABLE')
  })

  it('chain includes gadgetId in gadgetIds array', () => {
    const chain = buildChain('src-recursive-merge', 'GDG-AXIOS-001', 'scn-baseurl')
    expect(chain.gadgetIds).toContain('GDG-AXIOS-001')
  })
})
