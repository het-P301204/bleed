import { Router } from 'express'
import { getAllGadgets, getGadgetById, findGadgetsForProperty, findGadgetsForLibrary } from '@bleed/gadget-engine'

const router = Router()

router.get('/', (req, res) => {
  const property = typeof req.query['property'] === 'string' ? req.query['property'] : undefined
  const library = typeof req.query['library'] === 'string' ? req.query['library'] : undefined
  if (property) return void res.json(findGadgetsForProperty(property))
  if (library) return void res.json(findGadgetsForLibrary(library))
  res.json(getAllGadgets())
})

router.get('/:id', (req, res) => {
  const gadget = getGadgetById(req.params['id'] ?? '')
  if (!gadget) {
    res.status(404).json({ error: 'Gadget not found' })
    return
  }
  res.json(gadget)
})

export default router
