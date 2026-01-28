import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { validateRegister, validateLogin, normalizeEmail } from '../utils/validate.js'

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    const v = validateRegister({ name, email, password })
    if (!v.ok) return res.status(400).json({ message: 'Validation error', errors: v.errors })

    const cleanEmail = normalizeEmail(email)
    const exists = await User.findOne({ email: cleanEmail })
    if (exists) return res.status(400).json({ message: 'Email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email: cleanEmail, passwordHash })

    res.status(201).json({ id: user._id, name: user.name, email: user.email })
  } catch (e) {
    next(e)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const v = validateLogin({ email, password })
    if (!v.ok) return res.status(400).json({ message: 'Validation error', errors: v.errors })

    const cleanEmail = normalizeEmail(email)
    const user = await User.findOne({ email: cleanEmail })
    if (!user) return res.status(400).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token })
  } catch (e) {
    next(e)
  }
}

export const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('_id email createdAt updatedAt')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ id: user._id, email: user.email, createdAt: user.createdAt, updatedAt: user.updatedAt })
  } catch (e) {
    next(e)
  }
}
