import Task from '../models/Task.js'

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
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user.userId },
      req.body,
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
