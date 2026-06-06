import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getRecords, updateRecord, deleteRecord } from '../api/data'
import BookCover from '../components/BookCover'

const STATUS_LABEL = { want: '읽고 싶은', reading: '읽는 중', completed: '완독' }
const TABS = [
  { key: 'all', label: '전체' },
  { key: 'reading', label: '읽는 중' },
  { key: 'completed', label: '완독' },
  { key: 'want', label: '읽고 싶은' },
]

export default function MyLibrary() {
  const [tab, setTab] = useState('all')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try { setRecords(await getRecords()) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const items = records.filter((r) => tab === 'all' || r.status === tab)
  const counts = {
    all: records.length,
    reading: records.filter((r) => r.status === 'reading').length,
    completed: records.filter((r) => r.status === 'completed').length,
    want: records.filter((r) => r.status === 'want').length,
  }

  const changeStatus = async (isbn, status) => {
    await updateRecord(isbn, { status })
    load()
  }
  const remove = async (isbn) => {
    await deleteRecord(isbn)
    load()
  }

  return (
    <div className="container page">
      <h2 className="section-title">내 서재</h2>
      <p className="section-sub">읽는 중 · 완독 · 읽고 싶은 책을 한곳에서 관리하세요.</p>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? 'active' : ''} onClick={() => setTab(t.key)}>
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">불러오는 중…</div>
      ) : items.length === 0 ? (
        <div className="empty">
          <div className="big">📚</div>
          아직 담은 책이 없습니다.<br />
          <Link to="/search" className="btn" style={{ marginTop: 16, display: 'inline-block' }}>책 검색하러 가기</Link>
        </div>
      ) : (
        items.map((rec) => rec.book && (
          <div className="lib-item" key={rec.id}>
            <Link to={`/book/${encodeURIComponent(rec.book.isbn)}`} state={{ book: rec.book }}><BookCover book={rec.book} /></Link>
            <div className="li-body">
              <Link to={`/book/${encodeURIComponent(rec.book.isbn)}`} state={{ book: rec.book }}>
                <div className="li-title">{rec.book.title}</div>
              </Link>
              <div className="li-author">{rec.book.author}</div>
              {rec.status === 'reading' && (
                <div style={{ maxWidth: 280 }}>
                  <div className="progress-bar"><div style={{ width: `${rec.progress}%` }} /></div>
                  <span className="section-sub">진행률 {rec.progress}%</span>
                </div>
              )}
              <div className="status-btns" style={{ marginTop: 8 }}>
                {['want', 'reading', 'completed'].map((s) => (
                  <button key={s} className={'chip' + (rec.status === s ? ' active' : '')}
                    onClick={() => changeStatus(rec.book.isbn, s)}>{STATUS_LABEL[s]}</button>
                ))}
              </div>
            </div>
            <button className="btn sm danger" onClick={() => remove(rec.book.isbn)}>제거</button>
          </div>
        ))
      )}
    </div>
  )
}
