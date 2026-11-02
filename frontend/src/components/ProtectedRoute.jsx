import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation()
  const token = localStorage.getItem('access_token')
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    localStorage.removeItem('user')
  }

  if (!token || !user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
