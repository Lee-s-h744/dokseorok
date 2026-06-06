import { Router } from 'express'
import { searchKakao, findByIsbn, usingKakao } from '../services/kakao.js'
import { authRequired } from '../middleware/auth.js'
import { Record } from '../models/index.js'

const router = Router()

// 책 검색: GET /api/books/search?query=클린코드
router.get('/search', async (req, res) => {
  try {
    const { query = '', target } = req.query
    const books = await searchKakao(query, { target })
    res.json({ source: usingKakao() ? 'kakao' : 'seed', books })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '검색 중 오류가 발생했습니다.' })
  }
})

// ISBN 단건 조회: GET /api/books/isbn/:isbn
router.get('/isbn/:isbn', async (req, res) => {
  const book = await findByIsbn(req.params.isbn)
  if (!book) return res.status(404).json({ message: '책을 찾을 수 없습니다.' })
  res.json({ book })
})

// 추천: 내 서재의 저자 기반으로 카카오에서 비슷한 책을 찾는다.
router.get('/recommend', authRequired, async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id }).populate('book')
    const ownedIsbn = new Set(records.map((r) => r.book?.isbn).filter(Boolean))

    const authorCount = {}
    records.forEach((r) => {
      const a = (r.book?.author || '').split(',')[0].trim()
      if (a) authorCount[a] = (authorCount[a] || 0) + 1
    })
    const topAuthors = Object.entries(authorCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([a]) => a)

    let pool = []
    for (const author of topAuthors) {
      pool.push(...(await searchKakao(author, { target: 'person', size: 10 })))
    }
    if (pool.length < 4) {
      pool.push(...(await searchKakao('베스트셀러', { size: 12 })))
    }

    const seen = new Set()
    const recs = []
    for (const b of pool) {
      if (!b.isbn || ownedIsbn.has(b.isbn) || seen.has(b.isbn)) continue
      seen.add(b.isbn)
      recs.push(b)
      if (recs.length >= 8) break
    }
    res.json({ books: recs })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '추천 중 오류가 발생했습니다.' })
  }
})

export default router
