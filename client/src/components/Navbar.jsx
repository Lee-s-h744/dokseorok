import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="inner">
        <Link to="/" className="brand">📚 독서록</Link>
        <div className="nav-links">
          <NavLink to="/" end>홈</NavLink>
          <NavLink to="/search">책 검색</NavLink>
          <NavLink to="/library">내 서재</NavLink>
          <NavLink to="/mypage">마이페이지</NavLink>
        </div>
        <div className="nav-right">
          {user ? (
            <>
              <span className="nickname">{user.nickname}님</span>
              <button className="btn sm gray" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn sm gray">로그인</Link>
              <Link to="/signup" className="btn sm">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
