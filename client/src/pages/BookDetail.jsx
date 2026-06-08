import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getBookByIsbn, getRecordForBook, saveRecord, updateRecord, deleteRecord,
  getReviewForBook, saveReview, deleteReview,
} from '../api/data'
import BookCover from '../components/BookCover'
import StarRating from '../components/StarRating'

const STATUS_LABEL = { want: '읽고 싶은', reading: '읽는 중', completed: '완독' }

export default function BookDetail() {
  const { isbn } = useParams()
  const { state } = useLocation()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [book, setBook] = useState(state?.book || null)
  const [record, setRecord] = useState(null)
  const [review, setReview] = useState(null)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [progress, setProgressLocal] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (!book) setBook(await getBookByIsbn(isbn))
        if (user) {
          const [rec, rev] = await Promise.all([getRecordForBook(isbn), getReviewForBook(isbn)])
          setRecord(rec)
          setReview(rev)
          setRating(rev?.rating || 0)
          setContent(rev?.content || '')
          setEditing(!rev)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isbn, user])

  // 서버 기록이 바뀌면 슬라이더 로컬값을 맞춘다
  useEffect(() => {
    setProgressLocal(record?.progress ?? 0)
  }, [record])

  if (loading && !book) return <div className="loading">불러오는 중…</div>
  if (!book) return <div className="container page"><h2>책을 찾을 수 없습니다.</h2><Link to="/search" className="btn ghost">검색으로</Link></div>

  const requireLogin = () => {
    if (!user) { navigate('/login', { state: { from: `/book/${encodeURIComponent(isbn)}` } }); return true }
    return false
  }

  const setStatus = async (status) => {
    if (requireLogin()) return
    setRecord(await saveRecord(book, status))
  }
  const commitProgress = async (value) => {
    // 기록이 없을 수도 있으므로 PATCH 대신 upsert(POST)로 저장한다.
    // 진행률 슬라이더는 '읽는 중' 상태에서만 노출되므로 상태도 함께 보낸다.
    const updated = await saveRecord(book, record?.status || 'reading', Number(value))
    setRecord(updated)
  }
  // 슬라이더: 화면은 즉시 갱신, 저장은 0.4초 디바운스 (드래그·클릭·키보드 모두 저장됨)
  const saveTimer = useRef(null)
  const onSlide = (value) => {
    const v = Number(value)
    setProgressLocal(v)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => commitProgress(v), 400)
  }
  const removeFromLibrary = async () => {
    await deleteRecord(isbn)
    setRecord(null)
  }
  const submitReview = async () => {
    if (requireLogin()) return
    if (rating === 0) return alert('별점을 선택해주세요.')
    const saved = await saveReview(book, rating, content)
    setReview(saved)
    setEditing(false)
  }
  const removeReview = async () => {
    await deleteReview(isbn)
    setReview(null)
    setRating(0)
    setContent('')
    setEditing(true)
  }

  return (
    <div className="container page">
      <Link to="/search" className="section-sub" style={{ display: 'inline-block' }}>← 검색으로 돌아가기</Link>
      <div className="detail">
        <BookCover book={book} />
        <div className="info">
          <h1>{book.title}</h1>
          <div className="author">{book.author}</div>
          {book.contents && <p>{book.contents}</p>}
          <div className="pub">{book.publisher} · ISBN {book.isbn}</div>
        </div>
      </div>

      <div className="panel">
        <h3>독서 상태</h3>
        <div className="status-btns">
          {['want', 'reading', 'completed'].map((s) => (
            <button key={s} className={'chip' + (record?.status === s ? ' active' : '')}
              onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</button>
          ))}
          {record && <button className="btn sm danger" onClick={removeFromLibrary}>서재에서 제거</button>}
        </div>
        {record?.status === 'reading' && (
          <div style={{ marginTop: 18, maxWidth: 420 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>독서 진행률: {progress}%</label>
            <div className="progress-bar"><div style={{ width: `${progress}%` }} /></div>
            <input type="range" min="0" max="100" step="5" value={progress}
              style={{ width: '100%' }}
              onChange={(e) => onSlide(e.target.value)}
              onMouseUp={(e) => commitProgress(e.target.value)}
              onTouchEnd={(e) => commitProgress(e.target.value)} />
          </div>
        )}
        {record?.status === 'completed' && (
          <p className="section-sub" style={{ marginTop: 14 }}>✅ 완독한 책입니다. 리뷰를 남겨보세요!</p>
        )}
      </div>

      <div className="panel">
        <h3>리뷰 & 별점</h3>
        {!user && <p className="section-sub">리뷰를 작성하려면 <Link to="/login" style={{ color: 'var(--blue)' }}>로그인</Link>이 필요합니다.</p>}

        {user && !editing && review && (
          <div className="review-card">
            <div className="rv-head">
              <StarRating value={review.rating} readOnly />
              <span className="rv-date">{new Date(review.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{review.content || '(작성한 글 없음)'}</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn sm gray" onClick={() => setEditing(true)}>수정</button>
              <button className="btn sm danger" onClick={removeReview}>삭제</button>
            </div>
          </div>
        )}

        {user && editing && (
          <div>
            <div style={{ marginBottom: 12 }}>
              <StarRating value={rating} onChange={setRating} size={28} />
            </div>
            <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="이 책에 대한 한줄 리뷰를 남겨보세요." />
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn sm" onClick={submitReview}>저장</button>
              {review && <button className="btn sm gray" onClick={() => { setEditing(false); setRating(review.rating); setContent(review.content) }}>취소</button>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
