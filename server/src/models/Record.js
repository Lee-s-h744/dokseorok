import mongoose from 'mongoose'

// records: user, book, status, progress, startDate, updatedAt
const recordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    status: { type: String, enum: ['want', 'reading', 'completed'], default: 'want' },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: false, updatedAt: 'updatedAt' } }
)

// 한 사용자가 한 책에 하나의 기록만 갖도록
recordSchema.index({ user: 1, book: 1 }, { unique: true })

export const Record = mongoose.model('Record', recordSchema)
