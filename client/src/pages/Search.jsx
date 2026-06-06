import { useState, useEffect, useCallback } from 'react'
import { searchBooks } from '../api/data'
import BookCard from '../components/BookCard'

export default function Search() {
  const [query, setQuery] = useState('')
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = useCallback(async (q) => {
    setLoading(true)
    setError('')
    try {
      setBooks(await searchBooks(q))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // 첫 진입 시 기본 목록 + 입력 디바운스 검색
  useEffect(() => {
    const t = setTimeout(() => run(query), 350)
    return () => clearTimeout(t)
  }, [query, run])

  return (
    <div className="container page">
      <h2 className="section-title">책 검색</h2>
      <p className="section-sub">제목 · 저자 · ISBN으로 검색하세요. (카카오 Books API 연동)</p>

      <div className="field" style={{ maxWidth: 520 }}>
        <input className="input" value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="예: 클린 코드, 유발 하라리, 9788966262281" autoFocus />
      </div>

      {error && <div className="error-msg">{error}</div>}
      {loading ? (
        <div className="loading">검색 중…</div>
      ) : books.length === 0 ? (
        <div className="empty"><div className="big">🔍</div>검색 결과가 없습니다.</div>
      ) : (
        <>
          <p className="section-sub">검색 결과 {books.length}권</p>
          <div className="book-grid">
            {books.map((b) => <BookCard key={b.isbn} book={b} />)}
          </div>
        </>
      )}
    </div>
  )
}
