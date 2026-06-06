import mongoose from 'mongoose'

// reviews: user, book, rating(1~5), content, createdAt, updatedAt
const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, default: '' },
  },
  { timestamps: true }
)

reviewSchema.index({ user: 1, book: 1 }, { unique: true })

export const Review = mongoose.model('Review', reviewSchema)
