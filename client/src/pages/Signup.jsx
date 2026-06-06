import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', nickname: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('이메일과 비밀번호를 입력하세요.')
    if (form.password.length < 4) return setError('비밀번호는 4자 이상이어야 합니다.')
    if (form.password !== form.confirm) return setError('비밀번호가 일치하지 않습니다.')
    setLoading(true)
    try {
      await signup({ email: form.email, nickname: form.nickname, password: form.password })
      navigate('/library')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="auth-wrap">
        <h1>회원가입</h1>
        <p className="sub">독서록과 함께 나만의 서재를 만들어 보세요.</p>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>이메일</label>
          <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
        </div>
        <div className="field">
          <label>닉네임</label>
          <input className="input" value={form.nickname} onChange={set('nickname')} placeholder="독서가" />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input className="input" type="password" value={form.password} onChange={set('password')} placeholder="4자 이상" />
        </div>
        <div className="field">
          <label>비밀번호 확인</label>
          <input className="input" type="password" value={form.confirm} onChange={set('confirm')} />
        </div>
        <button className="btn" onClick={submit} disabled={loading}>{loading ? '가입 중…' : '가입하기'}</button>
        <p className="auth-switch">이미 계정이 있으신가요? <Link to="/login">로그인</Link></p>
      </div>
    </div>
  )
}
