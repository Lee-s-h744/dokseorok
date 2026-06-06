import mongoose from 'mongoose'

// books: 카카오 API로 검색한 책을 isbn 기준으로 저장
const bookSchema = new mongoose.Schema(
  {
    isbn: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    author: { type: String, default: '' },
    publisher: { type: String, default: '' },
    cover_img: { type: String, default: '' },
    contents: { type: String, default: '' },
  },
  { timestamps: false }
)

export const Book = mongoose.model('Book', bookSchema)
