import { Router } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/tasks.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getTasks)
router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
