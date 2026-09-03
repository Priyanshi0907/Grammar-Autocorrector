import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-(--color-text-faint)">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />
  }

  return children
}
