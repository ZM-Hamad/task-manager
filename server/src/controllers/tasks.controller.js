import Task from '../models/Task.js'
import { validateCreateTask, validateUpdateTask } from '../utils/validate.js'

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ ownerId: req.user.userId }).sort({ createdAt: -1 })
    res.json(tasks)
  } catch (e) {
    next(e)
  }
}

export const createTask = async (req, res, next) => {
  try {
    const v = validateCreateTask(req.body)
    if (!v.ok) return res.status(400).json({ message: 'Validation error', errors: v.errors })

    const task = await Task.create({
      ownerId: req.user.userId,
      title: req.body.title,
      description: req.body.description || ''
    })
    res.status(201).json(task)
  } catch (e) {
    next(e)
  }
}

export const updateTask = async (req, res, next) => {
  try {
    const v = validateUpdateTask(req.body)
    if (!v.ok) return res.status(400).json({ message: 'Validation error', errors: v.errors })

    const allowed = {}
    if (req.body.title !== undefined) allowed.title = req.body.title
    if (req.body.description !== undefined) allowed.description = req.body.description
    if (req.body.status !== undefined) allowed.status = req.body.status

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      allowed,
      { new: true }
    )
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (e) {
    next(e)
  }
}

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user.userId
    })
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
