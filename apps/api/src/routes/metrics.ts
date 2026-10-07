import { Router } from 'express'
import { getAllGadgets } from '@bleed/gadget-engine'
import { getAllRuns, getRunCount, getLastRunAt } from '@bleed/evidence'
import { SOURCES } from '../data/sources.js'
import type { BleedMetrics } from '@bleed/shared'

const router = Router()

router.get('/', (_req, res) => {
  const runs = getAllRuns()
  const gadgets = getAllGadgets()

  const lastRunAt = getLastRunAt()
  const metrics: BleedMetrics = {
    sources: SOURCES.length,
    gadgets: gadgets.length,
    reachableChains: runs.filter(r => r.result === 'REACHABLE' || r.result === 'REPRODUCED').length,
    reproducedChains: runs.filter(r => r.result === 'REPRODUCED').length,
    hardenedBlocked: runs.filter(r => r.result === 'BLOCKED').length,
    totalRuns: getRunCount(),
    ...(lastRunAt !== undefined && { lastRunAt }),
  }

  res.json(metrics)
})

export default router
