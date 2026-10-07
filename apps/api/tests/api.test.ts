import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/index'

const app = createApp()

describe('GET /health', () => {
  it('returns 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('GET /api/sources', () => {
  it('returns 200 with array', async () => {
    const res = await request(app).get('/api/sources')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('returns 6 sources', async () => {
    const res = await request(app).get('/api/sources')
    expect(res.body).toHaveLength(6)
  })
})

describe('GET /api/sources/:id', () => {
  it('returns src-recursive-merge', async () => {
    const res = await request(app).get('/api/sources/src-recursive-merge')
    expect(res.status).toBe(200)
    expect(res.body.id).toBe('src-recursive-merge')
    expect(res.body.category).toBe('RECURSIVE_MERGE')
  })

  it('returns 404 for unknown source', async () => {
    const res = await request(app).get('/api/sources/does-not-exist')
    expect(res.status).toBe(404)
  })
})

describe('GET /api/gadgets', () => {
  it('returns 200 with 6 gadgets', async () => {
    const res = await request(app).get('/api/gadgets')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(6)
  })

  it('filters by property', async () => {
    const res = await request(app).get('/api/gadgets?property=baseURL')
    expect(res.status).toBe(200)
    expect(res.body.some((g: { id: string }) => g.id === 'GDG-AXIOS-001')).toBe(true)
  })
})

describe('POST /api/chains/analyze', () => {
  it('validates sourceId is required', async () => {
    const res = await request(app).post('/api/chains/analyze').send({ gadgetId: 'GDG-AXIOS-001' })
    expect(res.status).toBe(400)
  })

  it('validates gadgetId is required', async () => {
    const res = await request(app).post('/api/chains/analyze').send({ sourceId: 'src-recursive-merge' })
    expect(res.status).toBe(400)
  })

  it('returns reachability result for known pair', async () => {
    const res = await request(app)
      .post('/api/chains/analyze')
      .send({ sourceId: 'src-recursive-merge', gadgetId: 'GDG-AXIOS-001' })
    expect(res.status).toBe(200)
    expect(res.body.reachable).toBe(true)
  })
})

describe('POST /api/dependency-scan', () => {
  it('rejects missing packages field', async () => {
    const res = await request(app).post('/api/dependency-scan').send({})
    expect(res.status).toBe(400)
  })

  it('rejects oversized labTarget', async () => {
    const res = await request(app)
      .post('/api/dependency-scan')
      .send({ packages: { axios: '1.0.0' }, labTarget: 'evil-server' })
    expect(res.status).toBe(400)
  })

  it('accepts valid packages object', async () => {
    const res = await request(app)
      .post('/api/dependency-scan')
      .send({ packages: { axios: '1.7.0', express: '4.21.0' } })
    expect(res.status).toBe(200)
    expect(res.body.totalPackages).toBe(2)
  })
})

describe('GET /api/scenarios', () => {
  it('returns 5 scenarios', async () => {
    const res = await request(app).get('/api/scenarios')
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(5)
  })
})

describe('GET /api/metrics', () => {
  it('returns metrics with correct shape', async () => {
    const res = await request(app).get('/api/metrics')
    expect(res.status).toBe(200)
    expect(typeof res.body.sources).toBe('number')
    expect(typeof res.body.gadgets).toBe('number')
    expect(res.body.sources).toBe(6)
    expect(res.body.gadgets).toBe(6)
  })
})

describe('Security: path traversal rejection', () => {
  it('rejects .. in path', async () => {
    const res = await request(app).get('/api/sources/..%2fetc%2fpasswd')
    expect(res.status).toBe(400)
  })
})
