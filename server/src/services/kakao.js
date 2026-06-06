import axios from 'axios'
import { SEED_BOOKS } from '../data/seedBooks.js'

const KAKAO_URL = 'https://dapi.kakao.com/v3/search/book'

function hasKey() {
  return !!(process.env.KAKAO_REST_API_KEY && process.env.KAKAO_REST_API_KEY.trim())
}

// 카카오 응답 문서를 우리 앱의 책 형태로 정규화
function normalize(doc) {
  return {
    isbn: (doc.isbn || '').split(' ').pop() || doc.isbn, // "isbn10 isbn13" 형태 → 뒤쪽 사용
    title: doc.title,
    author: (doc.authors && doc.authors.join(', ')) || '',
    publisher: doc.publisher || '',
    cover_img: doc.thumbnail || '',
    contents: doc.contents || '',
  }
}

// query 로 책 검색 (target: title | isbn | publisher | person)
export async function searchKakao(query, { target, size = 20 } = {}) {
  if (!query || !query.trim()) return seedSearch('', target)
  if (!hasKey()) return seedSearch(query, target)
  try {
    const { data } = await axios.get(KAKAO_URL, {
      params: { query, size, ...(target ? { target } : {}) },
      headers: { Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}` },
    })
    return (data.documents || []).map(normalize)
  } catch (e) {
    console.error('[kakao] 검색 실패, 샘플 데이터로 대체:', e.response?.status || e.message)
    return seedSearch(query, target)
  }
}

// 키가 없을 때 샘플 데이터 검색
function seedSearch(query, target) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return SEED_BOOKS
  return SEED_BOOKS.filter((b) => {
    if (target === 'isbn') return b.isbn.includes(q)
    if (target === 'person') return b.author.toLowerCase().includes(q)
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    )
  })
}

export async function findByIsbn(isbn) {
  const list = await searchKakao(isbn, { target: 'isbn', size: 1 })
  return list[0] || SEED_BOOKS.find((b) => b.isbn === isbn) || null
}

export function usingKakao() {
  return hasKey()
}
