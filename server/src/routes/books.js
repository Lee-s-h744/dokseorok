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

// ---- 추천용 키워드 추출 헬퍼 ----
const STOPWORDS = new Set([
  '그리고', '하지만', '그러나', '대한', '위한', '통해', '이런', '저런', '그런', '우리',
  '정말', '가장', '모든', '다시', '이것', '그것', '지음', '옮김', '저자', '지은이',
  '이야기', '책', '소설', '에세이', '대해', '에서', '에게',
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'your', 'about', 'book', 'novel',
])

// 한글 토큰 끝의 흔한 조사 제거 (결과가 2자 미만이면 원형 유지)
function normalizeKo(t) {
  if (!/[가-힣]/.test(t)) return t
  const s = t.replace(/(으로|에서|에게|까지|부터|들의|와의|과의|을|를|이|가|은|는|에|의|도|로|와|과|만|뿐)$/, '')
  return s.length >= 2 ? s : t
}

// 서재 책들의 제목·소개에서 핵심 키워드 추출 (제목 가중치 2, 소개 1)
function topKeywords(records, limit = 4) {
  const freq = {}
  const bump = (text, w) => {
    if (!text) return
    text.toLowerCase().split(/[^가-힣a-z0-9]+/).filter(Boolean).forEach((raw) => {
      if (/^[0-9]+$/.test(raw)) return
      const t = normalizeKo(raw)
      if (t.length < 2 || STOPWORDS.has(t)) return
      freq[t] = (freq[t] || 0) + w
    })
  }
  records.forEach((r) => {
    if (!r.book) return
    bump(r.book.title, 2)
    bump(r.book.contents, 1)
  })
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k)
}

// 추천: 내 서재의 "저자 + 키워드"를 함께 분석해 비슷한 책을 찾는다.
router.get('/recommend', authRequired, async (req, res) => {
  try {
    const records = await Record.find({ user: req.user.id }).populate('book')
    const ownedIsbn = new Set(records.map((r) => r.book?.isbn).filter(Boolean))

    // 선호 저자 (완독한 책은 가중치 2배)
    const authorScore = {}
    records.forEach((r) => {
      const a = (r.book?.author || '').split(',')[0].trim()
      if (!a) return
      authorScore[a] = (authorScore[a] || 0) + (r.status === 'completed' ? 2 : 1)
    })
    const topAuthors = Object.entries(authorScore)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([a]) => a)
    const authorSet = new Set(topAuthors)
    const keywords = topKeywords(records, 4)

    // 후보 수집 (isbn 기준 점수 누적)
    const candidates = new Map()
    const add = (book, score) => {
      if (!book?.isbn || ownedIsbn.has(book.isbn)) return
      const cur = candidates.get(book.isbn)
      if (cur) cur.score += score
      else candidates.set(book.isbn, { book, score })
    }

    // 1) 같은 저자의 다른 책 (강한 신호)
    for (const author of topAuthors) {
      const list = await searchKakao(author, { target: 'person', size: 10 })
      list.forEach((b) => add(b, 3))
    }
    // 2) 취향 키워드로 비슷한 주제의 책
    for (const kw of keywords) {
      const list = await searchKakao(kw, { size: 10 })
      list.forEach((b) => add(b, 1))
    }

    // 보너스: 후보의 저자가 선호 저자거나, 키워드를 제목/소개에 포함하면 가점
    for (const c of candidates.values()) {
      const firstAuthor = (c.book.author || '').split(',')[0].trim()
      if (authorSet.has(firstAuthor)) c.score += 2
      const text = `${c.book.title} ${c.book.contents || ''}`.toLowerCase()
      keywords.forEach((kw) => { if (text.includes(kw)) c.score += 1 })
    }

    // 점수순 정렬 (동점은 약간 섞어 다양성 확보)
    let recs = [...candidates.values()]
      .sort((a, b) => b.score - a.score || Math.random() - 0.5)
      .map((c) => c.book)

    // 기록이 없거나 후보가 부족하면 인기 도서로 보충
    if (recs.length < 4) {
      const filler = await searchKakao('베스트셀러', { size: 12 })
      const have = new Set(recs.map((b) => b.isbn))
      filler.forEach((b) => {
        if (b.isbn && !ownedIsbn.has(b.isbn) && !have.has(b.isbn)) {
          have.add(b.isbn)
          recs.push(b)
        }
      })
    }

    res.json({ books: recs.slice(0, 8) })
  } catch (e) {
    console.error(e)
    res.status(500).json({ message: '추천 중 오류가 발생했습니다.' })
  }
})

export default router
