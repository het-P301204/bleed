import { Router } from 'express'
import { getLabState, startLab, stopLab } from '../services/lab-service.js'

const router = Router()

router.get('/status', async (_req, res) => {
  const state = await getLabState()
  res.json(state)
})

router.post('/start', async (_req, res) => {
  const state = await startLab()
  res.json(state)
})

router.post('/stop', async (_req, res) => {
  const state = await stopLab()
  res.json(state)
})

export default router
