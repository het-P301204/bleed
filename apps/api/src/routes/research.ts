import { Router } from 'express'
import { RESEARCH_REFERENCES } from '../data/research-references.js'

const router = Router()

router.get('/', (req, res) => {
  let refs = RESEARCH_REFERENCES

  const { reproduced, gadgetId, q } = req.query

  if (reproduced === 'true') refs = refs.filter(r => r.reproduced === true)
  if (reproduced === 'false') refs = refs.filter(r => r.reproduced === false)

  if (typeof gadgetId === 'string' && gadgetId) {
    refs = refs.filter(r => r.relatedGadgetIds.includes(gadgetId))
  }

  if (typeof q === 'string' && q) {
    const lower = q.toLowerCase()
    refs = refs.filter(
      r =>
        r.title.toLowerCase().includes(lower) ||
        r.summary.toLowerCase().includes(lower) ||
        r.library?.toLowerCase().includes(lower) ||
        r.source.toLowerCase().includes(lower),
    )
  }

  res.json(refs)
})

router.get('/:id', (req, res) => {
  const ref = RESEARCH_REFERENCES.find(r => r.id === req.params['id'])
  if (!ref) return res.status(404).json({ error: 'Not found' })
  return res.json(ref)
})

export default router
