import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getRecords, getReviews, getRecommendations, searchBooks } from '../api/data'
import BookCard from '../components/BookCard'

export default function Home() {
  const { user, ready } = useAuth()
  const [recs, setRecs] = useState([])
  const [records, setRecords] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (!ready) return
    async function load() {
      try {
        if (user) {
          const [rc, rv, re] = await Promise.all([getRecords(), getReviews(), getRecommendations()])
          setRecords(rc)
          setReviews(rv)
          setRecs(re.slice(0, 4))
        } else {
          // 비로그인: 기본 도서 목록 노출
          setRecs((await searchBooks('베스트셀러')).slice(0, 4))
        }
      } catch {
        /* 무시: 홈은 비핵심 */
      }
    }
    load()
  }, [user, ready])

  const completed = records.filter((r) => r.status === 'completed').length
  const reading = records.filter((r) => r.status === 'reading').length
  const recent = records.slice(0, 4)

  return (
    <div className="container page">
      <section className="hero">
        <h1>{user ? `${user.nickname}님, 오늘도 한 페이지 📖` : '읽은 책을 기억하고, 다음 책을 쉽게 찾다'}</h1>
        <p>독서록은 읽은 책을 기록하고 별점·리뷰를 남기며, 취향에 맞는 책을 추천받는 개인 독서 관리 서비스입니다.</p>
        <Link to={user ? '/library' : '/signup'} className="btn">
          {user ? '내 서재 보기' : '지금 시작하기'}
        </Link>
      </section>

      {user && (
        <div className="stat-row">
          <div className="stat-tile"><div className="num">{records.length}</div><div className="lab">서재에 담은 책</div></div>
          <div className="stat-tile"><div className="num">{completed}</div><div className="lab">완독</div></div>
          <div className="stat-tile"><div className="num">{reading}</div><div className="lab">읽는 중</div></div>
          <div className="stat-tile"><div className="num">{reviews.length}</div><div className="lab">작성한 리뷰</div></div>
        </div>
      )}

      {user && recent.length > 0 && (
        <section style={{ marginBottom: 40 }}>
          <h2 className="section-title">최근 기록</h2>
          <p className="section-sub">가장 최근에 업데이트한 책들이에요.</p>
          <div className="book-grid">
            {recent.map((r) => r.book && <BookCard key={r.book.isbn} book={r.book} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="section-title">📚 오늘의 추천</h2>
        <p className="section-sub">
          {user ? '회원님의 독서 이력을 분석한 맞춤 추천입니다.' : '먼저 둘러볼 만한 책을 골라봤어요.'}
        </p>
        {recs.length === 0 ? (
          <div className="loading">추천을 불러오는 중…</div>
        ) : (
          <div className="book-grid">
            {recs.map((b) => <BookCard key={b.isbn} book={b} />)}
          </div>
        )}
      </section>
    </div>
  )
}
