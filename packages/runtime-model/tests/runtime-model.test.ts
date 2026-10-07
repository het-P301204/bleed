import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { capturePrototypeBaseline, detectPrototypePollution, restorePrototype } from '../src/prototype-chain'
import { snapshotObject } from '../src/object-snapshot'
import { tracePropertyPropagation } from '../src/propagation'

let baseline: Set<string>

beforeEach(() => {
  baseline = capturePrototypeBaseline()
})

afterEach(() => {
  restorePrototype(baseline)
})

describe('snapshotObject', () => {
  it('captures own properties correctly', () => {
    const obj = { foo: 'bar', num: 42 }
    const state = snapshotObject(obj, 'test-obj')
    expect(state.ownProperties).toHaveLength(2)
    expect(state.ownProperties.find(p => p.key === 'foo')?.value).toBe('bar')
    expect(state.ownProperties.find(p => p.key === 'num')?.value).toBe(42)
  })

  it('returns own:true for own properties', () => {
    const obj = { a: 1 }
    const state = snapshotObject(obj, 'own-test')
    expect(state.ownProperties.every(p => p.own)).toBe(true)
  })

  it('identifies inherited properties from polluted prototype', () => {
    ;(Object.prototype as Record<string, unknown>)['injected'] = 'polluted-value'
    const obj = {}
    const state = snapshotObject(obj, 'polluted-test')
    expect(state.polluted).toBe(true)
    expect(state.inheritedProperties.find(p => p.key === 'injected')).toBeDefined()
  })

  it('includes prototype chain entries', () => {
    const state = snapshotObject({}, 'chain-test')
    expect(state.prototypeChain.length).toBeGreaterThan(0)
  })
})

describe('detectPrototypePollution', () => {
  it('finds added prototype keys', () => {
    ;(Object.prototype as Record<string, unknown>)['evilProp'] = 'evil'
    const pollution = detectPrototypePollution(baseline)
    expect(pollution).toContain('evilProp')
  })

  it('returns empty array when prototype is clean', () => {
    expect(detectPrototypePollution(baseline)).toHaveLength(0)
  })
})

describe('restorePrototype', () => {
  it('cleans up added properties', () => {
    ;(Object.prototype as Record<string, unknown>)['toRemove'] = 'yes'
    restorePrototype(baseline)
    expect(Object.prototype.hasOwnProperty('toRemove')).toBe(false)
  })

  it('preserves standard prototype properties', () => {
    ;(Object.prototype as Record<string, unknown>)['extra'] = 1
    restorePrototype(baseline)
    expect(typeof Object.prototype.hasOwnProperty).toBe('function')
    expect(typeof Object.prototype.toString).toBe('function')
  })
})

describe('tracePropertyPropagation', () => {
  it('counts objects that inherit the property (not own)', () => {
    ;(Object.prototype as Record<string, unknown>)['tracedProp'] = 'value'
    const ownObj = { tracedProp: 'mine' }
    const inheritObj1 = {}
    const inheritObj2 = {}
    const result = tracePropertyPropagation('tracedProp', [ownObj, inheritObj1, inheritObj2])
    expect(result.affectedObjects).toHaveLength(2)
  })

  it('returns empty array when property not polluted', () => {
    const result = tracePropertyPropagation('notPolluted', [{}, {}])
    expect(result.affectedObjects).toHaveLength(0)
  })

  it('sets origin to Object.prototype', () => {
    ;(Object.prototype as Record<string, unknown>)['pollProp'] = true
    const result = tracePropertyPropagation('pollProp', [{}])
    expect(result.origin).toBe('Object.prototype')
  })
})
