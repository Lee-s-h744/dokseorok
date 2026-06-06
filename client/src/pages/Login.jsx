import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      navigate(location.state?.from || '/library')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => { if (e.key === 'Enter') submit() }

  return (
    <div className="container">
      <div className="auth-wrap">
        <h1>로그인</h1>
        <p className="sub">독서 기록과 리뷰를 관리하려면 로그인하세요.</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>이메일</label>
          <input className="input" type="email" value={email}
            onChange={(e) => setEmail(e.target.value)} onKeyDown={onKey} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input className="input" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" />
        </div>
        <button className="btn" onClick={submit} disabled={loading}>{loading ? '로그인 중…' : '로그인'}</button>
        <p className="auth-switch">계정이 없으신가요? <Link to="/signup">회원가입</Link></p>
      </div>
    </div>
  )
}
