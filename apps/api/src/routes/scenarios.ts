import { Router } from 'express'
import { getScenarios, getScenarioById } from '@bleed/chain-engine'
import { runScenario } from '../services/scenario-runner.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(getScenarios())
})

router.get('/:id', (req, res) => {
  const scenario = getScenarioById(req.params['id'] ?? '')
  if (!scenario) {
    res.status(404).json({ error: 'Scenario not found' })
    return
  }
  res.json(scenario)
})

router.post('/:id/run', async (req, res) => {
  const scenario = getScenarioById(req.params['id'] ?? '')
  if (!scenario) {
    res.status(404).json({ error: 'Scenario not found' })
    return
  }

  const body = req.body as Record<string, unknown>
  const mode = body['mode'] === 'hardened' ? 'hardened' : 'vulnerable'

  try {
    const run = await runScenario(scenario, mode)
    res.json(run)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
})

export default router
