import { Router } from 'express'
import { Record, Book } from '../models/index.js'
import { authRequired } from '../middleware/auth.js'
import { upsertBook } from '../services/bookStore.js'

const router = Router()
router.use(authRequired)

// 응답 형태(JSON 계약)는 프론트엔드와 맞춰 고정한다
const shape = (rec) => ({
  id: rec.id,
  status: rec.status,
  progress: rec.progress,
  startDate: rec.startDate,
  updatedAt: rec.updatedAt,
  book: rec.book
    ? {
        isbn: rec.book.isbn,
        title: rec.book.title,
        author: rec.book.author,
        publisher: rec.book.publisher,
        cover_img: rec.book.cover_img,
        contents: rec.book.contents,
      }
    : null,
})

// 내 기록 전체
router.get('/', async (req, res) => {
  const records = await Record.find({ user: req.user.id })
    .populate('book')
    .sort({ updatedAt: -1 })
  res.json({ records: records.map(shape) })
})

// 특정 책의 기록
router.get('/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn })
  if (!book) return res.json({ record: null })
  const rec = await Record.findOne({ user: req.user.id, book: book._id }).populate('book')
  res.json({ record: rec ? shape(rec) : null })
})

// 추가/수정(upsert): body { book, status, progress }
router.post('/', async (req, res) => {
  try {
    const { book: bookData, status, progress } = req.body
    const book = await upsertBook(bookData)
    let rec = await Record.findOne({ user: req.user.id, book: book._id })
    if (!rec) {
      const initStatus = status || 'want'
      let initProgress = progress ?? 0
      if (initStatus === 'completed') initProgress = 100
      else if (initStatus === 'want') initProgress = 0
      rec = await Record.create({
        user: req.user.id,
        book: book._id,
        status: initStatus,
        progress: initProgress,
      })
    } else {
      if (progress !== undefined) rec.progress = progress
      if (status !== undefined) {
        rec.status = status
        if (status === 'completed') rec.progress = 100
        else if (status === 'want') rec.progress = 0
      }
      await rec.save()
    }
    await rec.populate('book')
    res.json({ record: shape(rec) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '기록 저장 중 오류가 발생했습니다.' })
  }
})

// 상태/진행률 수정: PATCH /api/records/:isbn
router.patch('/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn })
  if (!book) return res.status(404).json({ message: '책을 찾을 수 없습니다.' })
  const rec = await Record.findOne({ user: req.user.id, book: book._id })
  if (!rec) return res.status(404).json({ message: '기록을 찾을 수 없습니다.' })
  const { status, progress } = req.body
  if (progress !== undefined) rec.progress = progress
  if (status !== undefined) {
    rec.status = status
    if (status === 'completed') rec.progress = 100
    else if (status === 'want') rec.progress = 0
  }
  await rec.save()
  await rec.populate('book')
  res.json({ record: shape(rec) })
})

// 삭제
router.delete('/:isbn', async (req, res) => {
  const book = await Book.findOne({ isbn: req.params.isbn })
  if (book) await Record.deleteOne({ user: req.user.id, book: book._id })
  res.json({ ok: true })
})

export default router
