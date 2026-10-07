import { Router } from 'express'
import { SOURCES, getSourceById } from '../data/sources.js'

const router = Router()

router.get('/', (_req, res) => {
  res.json(SOURCES)
})

router.get('/:id', (req, res) => {
  const source = getSourceById(req.params['id'] ?? '')
  if (!source) {
    res.status(404).json({ error: 'Source not found' })
    return
  }
  res.json(source)
})

export default router
