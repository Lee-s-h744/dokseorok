import { Router } from 'express'
import { Review, Book } from '../models/index.js'
import { authRequired } from '../middleware/auth.js'
import { upsertBook } from '../services/bookStore.js'

const router = Router()
router.use(authRequired)

const shape = (rev) => ({
  id: rev.id,
  rating: rev.rating,
  content: rev.content,
  createdAt: rev.createdAt,
  updatedAt: rev.updatedAt,
  book: rev.book
    ? { isbn: rev.book.isbn, title: rev.book.title, author: rev.book.author, cover_img: rev.book.cover_img }
    : null,
})

// 내 리뷰 전체
router.get('/', async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .populate('book')
    .sort({ updatedAt: -1 })
  res.json({ reviews: reviews.map(shape) })
})

// 특정 책의 리뷰
router.get('/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn })
  if (!book) return res.json({ review: null })
  const rev = await Review.findOne({ user: req.user.id, book: book._id }).populate('book')
  res.json({ review: rev ? shape(rev) : null })
})

// 작성/수정(upsert): body { book, rating, content }
router.post('/', async (req, res) => {
  try {
    const { book: bookData, rating, content } = req.body
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: '별점(1~5)을 선택하세요.' })
    }
    const book = await upsertBook(bookData)
    let rev = await Review.findOne({ user: req.user.id, book: book._id })
    if (!rev) {
      rev = await Review.create({ user: req.user.id, book: book._id, rating, content: content || '' })
    } else {
      rev.rating = rating
      rev.content = content || ''
      await rev.save()
    }
    await rev.populate('book')
    res.json({ review: shape(rev) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '리뷰 저장 중 오류가 발생했습니다.' })
  }
})

// 삭제
router.delete('/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn })
  if (book) await Review.deleteOne({ user: req.user.id, book: book._id })
  res.json({ ok: true })
})

export default router
