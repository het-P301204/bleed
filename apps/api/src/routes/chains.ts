import { Router } from 'express'
import { analyzeReachability, buildChain } from '@bleed/chain-engine'

const router = Router()

router.get('/', (_req, res) => {
  res.json([])
})

router.post('/analyze', (req, res) => {
  const body = req.body as Record<string, unknown>
  const { sourceId, gadgetId } = body

  if (typeof sourceId !== 'string' || !sourceId) {
    res.status(400).json({ error: 'sourceId is required' })
    return
  }
  if (typeof gadgetId !== 'string' || !gadgetId) {
    res.status(400).json({ error: 'gadgetId is required' })
    return
  }

  const result = analyzeReachability(sourceId, gadgetId)
  res.json(result)
})

router.post('/build', (req, res) => {
  const body = req.body as Record<string, unknown>
  const { sourceId, gadgetId, scenarioId } = body

  if (typeof sourceId !== 'string' || !sourceId) {
    res.status(400).json({ error: 'sourceId is required' })
    return
  }
  if (typeof gadgetId !== 'string' || !gadgetId) {
    res.status(400).json({ error: 'gadgetId is required' })
    return
  }

  const chain = buildChain(sourceId, gadgetId, typeof scenarioId === 'string' ? scenarioId : '')
  res.json(chain)
})

export default router
