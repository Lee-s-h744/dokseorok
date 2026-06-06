import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return <div className="loading">불러오는 중…</div>
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
