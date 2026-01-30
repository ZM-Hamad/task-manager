import { Router } from 'express'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  deleteHistory
} from '../controllers/tasks.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getTasks)
router.post('/', createTask)
router.delete("/history", deleteHistory)

router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)


export default router
