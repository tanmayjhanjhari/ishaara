import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

/**
 * ProtectedRoute
 * Guards authenticated routes.
 * If the user is not authenticated, redirects to /login.
 * Otherwise renders child routes via <Outlet />.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
