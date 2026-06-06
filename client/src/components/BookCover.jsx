// 카카오 표지(cover_img)가 있으면 이미지를, 없으면 제목 해시 기반 색상 표지를 생성한다.
const PALETTE = ['#3A6BC8', '#E0598B', '#7C5CBF', '#E08A3C', '#2BA8A0', '#4CA3D9', '#C7558C', '#5566B5']

function hashColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 99999
  return PALETTE[h % PALETTE.length]
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (n >> 16) + amt))
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt))
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

export default function BookCover({ book }) {
  if (book.cover_img) {
    return (
      <div className="cover has-img">
        <img src={book.cover_img} alt={book.title} loading="lazy" />
      </div>
    )
  }
  const base = hashColor(book.title || book.isbn || 'book')
  const bg = `linear-gradient(150deg, ${shade(base, 20)}, ${shade(base, -36)})`
  return (
    <div className="cover" style={{ background: bg }}>
      <div className="c-spine" />
      <div className="c-title">{book.title}</div>
      <div className="c-author">{book.author}</div>
    </div>
  )
}
