import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend,
} from 'chart.js'
import { useAuth } from '../context/AuthContext'
import { getRecords, getReviews, deleteReview } from '../api/data'
import StarRating from '../components/StarRating'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const RATING_COLORS = ['#E0598B', '#E08A3C', '#F6B500', '#4CA3D9', '#2BA8A0']

export default function MyPage() {
  const { user, updateNickname } = useAuth()
  const [records, setRecords] = useState([])
  const [reviews, setReviews] = useState([])
  const [nickname, setNick] = useState(user?.nickname || '')
  const [savedMsg, setSavedMsg] = useState('')

  const load = async () => {
    const [rc, rv] = await Promise.all([getRecords(), getReviews()])
    setRecords(rc)
    setReviews(rv)
  }
  useEffect(() => { load() }, [])
  useEffect(() => { if (user) setNick(user.nickname) }, [user])

  // 월별 완독 수 (최근 6개월)
  const monthly = useMemo(() => {
    const labels = [], counts = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      labels.push(`${d.getMonth() + 1}월`)
      counts.push(records.filter((r) => {
        if (r.status !== 'completed') return false
        const m = new Date(r.updatedAt)
        return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}` === key
      }).length)
    }
    return { labels, counts }
  }, [records])

  // 별점 분포 (1~5)
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0]
    reviews.forEach((rv) => { if (rv.rating >= 1 && rv.rating <= 5) dist[rv.rating - 1]++ })
    return dist
  }, [reviews])
  const hasReviews = reviews.length > 0

  const saveProfile = async () => {
    await updateNickname(nickname.trim() || user.nickname)
    setSavedMsg('저장되었습니다.')
    setTimeout(() => setSavedMsg(''), 1500)
  }
  const removeReview = async (isbn) => {
    await deleteReview(isbn)
    load()
  }

  if (!user) return null

  return (
    <div className="container page">
      <h2 className="section-title">마이페이지</h2>
      <p className="section-sub">프로필과 나의 리뷰, 독서 통계를 확인하세요.</p>

      <div className="panel">
        <h3>프로필</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="field" style={{ marginBottom: 0, flex: 1, minWidth: 220 }}>
            <label>닉네임</label>
            <input className="input" value={nickname} onChange={(e) => setNick(e.target.value)} />
          </div>
          <button className="btn" onClick={saveProfile}>저장</button>
        </div>
        <p className="section-sub" style={{ marginTop: 10 }}>
          {user.email}{savedMsg && <span style={{ color: 'var(--blue)', marginLeft: 10 }}>{savedMsg}</span>}
        </p>
      </div>

      <h3 style={{ marginTop: 32 }}>독서 통계</h3>
      <div className="chart-row">
        <div className="chart-box">
          <h3>월별 완독 권수</h3>
          <Bar
            data={{ labels: monthly.labels, datasets: [{ label: '완독', data: monthly.counts, backgroundColor: '#3A6BC8', borderRadius: 6 }] }}
            options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } } } }}
          />
        </div>
        <div className="chart-box">
          <h3>별점 분포</h3>
          {hasReviews ? (
            <Doughnut
              data={{
                labels: ['★1', '★2', '★3', '★4', '★5'],
                datasets: [{ data: ratingDist, backgroundColor: RATING_COLORS, borderWidth: 2, borderColor: '#fff' }],
              }}
              options={{ plugins: { legend: { position: 'bottom' } } }}
            />
          ) : (
            <p className="section-sub">리뷰를 작성하면 별점 분포가 표시됩니다.</p>
          )}
        </div>
      </div>

      <h3 style={{ marginTop: 32 }}>나의 리뷰 ({reviews.length})</h3>
      {reviews.length === 0 ? (
        <p className="section-sub">아직 작성한 리뷰가 없습니다. <Link to="/search" style={{ color: 'var(--blue)' }}>책을 찾아</Link> 첫 리뷰를 남겨보세요.</p>
      ) : (
        reviews.map((rv) => rv.book && (
          <div className="review-card" key={rv.id}>
            <div className="rv-head">
              <Link to={`/book/${encodeURIComponent(rv.book.isbn)}`} state={{ book: rv.book }}>
                <span className="rv-book">{rv.book.title}</span>
              </Link>
              <span className="rv-date">{new Date(rv.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <StarRating value={rv.rating} readOnly size={16} />
            <p style={{ margin: '8px 0', whiteSpace: 'pre-wrap' }}>{rv.content || '(작성한 글 없음)'}</p>
            <button className="btn sm danger" onClick={() => removeReview(rv.book.isbn)}>삭제</button>
          </div>
        ))
      )}
    </div>
  )
}
