import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes.js'
import tasksRoutes from './routes/tasks.routes.js'
import { connectDB } from './utils/db.js'
import { errorMiddleware } from './middleware/error.middleware.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', tasksRoutes)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use(errorMiddleware)

const PORT = process.env.PORT || 5000

connectDB(process.env.DATABASE_URL).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
})
