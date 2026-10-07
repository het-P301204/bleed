import { Router } from 'express'
import { getAllRuns, getRun } from '@bleed/evidence'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getAllRuns())
})

router.get('/:id', (req, res) => {
  const run = getRun(req.params['id'] ?? '')
  if (!run) {
    res.status(404).json({ error: 'Run not found' })
    return
  }
  res.json(run)
})

router.post('/:id/replay', (req, res) => {
  const run = getRun(req.params['id'] ?? '')
  if (!run) {
    res.status(404).json({ error: 'Run not found' })
    return
  }
  res.json({ message: 'Replay not yet implemented', runId: run.id })
})

export default router
