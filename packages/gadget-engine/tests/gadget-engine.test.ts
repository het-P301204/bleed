import { describe, it, expect } from 'vitest'
import { getAllGadgets, getGadgetById, findGadgetsForProperty, findGadgetsForLibrary, matchGadgetsToPackages } from '../src/index'

describe('getAllGadgets', () => {
  it('returns 6 gadgets', () => {
    expect(getAllGadgets()).toHaveLength(6)
  })

  it('all gadgets have required fields', () => {
    for (const g of getAllGadgets()) {
      expect(g.id).toBeTruthy()
      expect(g.library).toBeTruthy()
      expect(g.property).toBeTruthy()
      expect(g.impactClass).toBeTruthy()
    }
  })
})

describe('getGadgetById', () => {
  it('returns correct gadget for GDG-AXIOS-001', () => {
    const g = getGadgetById('GDG-AXIOS-001')
    expect(g).toBeDefined()
    expect(g?.library).toBe('axios')
    expect(g?.property).toBe('baseURL')
  })

  it('returns undefined for unknown id', () => {
    expect(getGadgetById('DOES-NOT-EXIST')).toBeUndefined()
  })
})

describe('findGadgetsForProperty', () => {
  it('returns GDG-AXIOS-001 for baseURL', () => {
    const gadgets = findGadgetsForProperty('baseURL')
    expect(gadgets.some(g => g.id === 'GDG-AXIOS-001')).toBe(true)
  })

  it('returns GDG-AUTH-001 for role', () => {
    const gadgets = findGadgetsForProperty('role')
    expect(gadgets.some(g => g.id === 'GDG-AUTH-001')).toBe(true)
  })

  it('returns empty array for unknown property', () => {
    expect(findGadgetsForProperty('unknownProp')).toHaveLength(0)
  })
})

describe('findGadgetsForLibrary', () => {
  it('returns 3 axios gadgets', () => {
    const gadgets = findGadgetsForLibrary('axios')
    expect(gadgets).toHaveLength(3)
  })
})

describe('matchGadgetsToPackages', () => {
  it('matches axios package to gadgets', () => {
    const result = matchGadgetsToPackages({ axios: '1.7.0' })
    const axiosRecord = result.find(r => r.name === 'axios')
    expect(axiosRecord).toBeDefined()
    expect(axiosRecord?.potentialGadgets.length).toBeGreaterThan(0)
    expect(axiosRecord?.version).toBe('1.7.0')
  })

  it('marks unknown packages with no gadgets', () => {
    const result = matchGadgetsToPackages({ 'some-random-lib': '1.0.0' })
    const record = result[0]
    expect(record?.potentialGadgets).toHaveLength(0)
  })
})
