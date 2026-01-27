import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const exists = await User.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already exists' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ email, passwordHash })

    res.status(201).json({ id: user._id, email: user.email })
  } catch (e) {
    next(e)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
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
