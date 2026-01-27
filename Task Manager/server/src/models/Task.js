import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    description: { type: String, default: '', trim: true, maxlength: 1000 },
    status: { type: String, enum: ['active', 'done'], default: 'active' }
  },
  { timestamps: true }
)

export default mongoose.model('Task', taskSchema)
