import { Router } from 'express'
import { getAllGadgets, getGadgetById, findGadgetsForProperty, findGadgetsForLibrary } from '@bleed/gadget-engine'

const router = Router()

router.get('/', (req, res) => {
  const { property, library } = req.query as Record<string, string>
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
