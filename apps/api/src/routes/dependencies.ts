import { Router } from 'express'
import { matchGadgetsToPackages } from '@bleed/gadget-engine'
import { randomUUID } from 'node:crypto'
import type { DependencyAnalysis } from '@bleed/shared'

const router = Router()

router.post('/', (req, res) => {
  const body = req.body as Record<string, unknown>
  const packages = body['packages']

  if (!packages || typeof packages !== 'object' || Array.isArray(packages)) {
    res.status(400).json({ error: 'packages must be an object mapping package names to version strings' })
    return
  }

  const pkgMap = packages as Record<string, unknown>
  if (Object.keys(pkgMap).length > 500) {
    res.status(400).json({ error: 'Too many packages (max 500)' })
    return
  }
  const validated: Record<string, string> = {}
  for (const [name, version] of Object.entries(pkgMap)) {
    if (typeof version !== 'string') {
      res.status(400).json({ error: `Package version for "${name}" must be a string` })
      return
    }
    validated[name] = version
  }

  const records = matchGadgetsToPackages(validated)
  const analysis: DependencyAnalysis = {
    id: randomUUID(),
    packages: records,
    totalPackages: records.length,
    potentialGadgetPackages: records.filter(r => r.potentialGadgets.length > 0).length,
    confirmedFixturePaths: records.filter(r => r.confirmedInFixture).length,
    timestamp: Date.now(),
  }

  res.json(analysis)
})

export default router
