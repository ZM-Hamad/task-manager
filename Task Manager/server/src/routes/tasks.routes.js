import { Router } from 'express'

const router = Router()

router.get('/', (req, res) => {
  res.json([])
})

router.post('/', (req, res) => {
  res.json({})
})

router.patch('/:id', (req, res) => {
  res.json({})
})

router.delete('/:id', (req, res) => {
  res.json({})
})

export default router
