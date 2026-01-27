import Task from '../models/Task.js'
import { validateCreateTask, validateUpdateTask } from '../utils/validate.js'

const parseIntSafe = (v, fallback) => {
  const n = Number.parseInt(String(v), 10)
  return Number.isFinite(n) ? n : fallback
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export const getTasks = async (req, res, next) => {
  try {
    const ownerId = req.user.userId

    const status = req.query.status
    const sort = String(req.query.sort || 'desc').toLowerCase()
    const page = clamp(parseIntSafe(req.query.page, 1), 1, 1000000)
    const limit = clamp(parseIntSafe(req.query.limit, 20), 1, 100)

    const filter = { ownerId }
    if (status !== undefined) {
      const s = String(status).toLowerCase()
      if (!['active', 'done'].includes(s)) {
        return res.status(400).json({ message: 'Validation error', errors: { status: 'Invalid status' } })
      }
      filter.status = s
    }

    const sortDir = sort === 'asc' ? 1 : -1

    const total = await Task.countDocuments(filter)
    const pages = Math.max(1, Math.ceil(total / limit))

    const items = await Task.find(filter)
      .sort({ createdAt: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)

    res.json({ items, page, limit, total, pages })
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
