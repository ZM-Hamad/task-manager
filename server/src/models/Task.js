import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    category: { type: String, required: true, trim: true, default: 'General' },
    status: { type: String, enum: ['active', 'done'], default: 'active' }
  },
  { timestamps: true }
)

taskSchema.index({ ownerId: 1, createdAt: -1 })
taskSchema.index({ ownerId: 1, status: 1, createdAt: -1 })

export default mongoose.model('Task', taskSchema)
