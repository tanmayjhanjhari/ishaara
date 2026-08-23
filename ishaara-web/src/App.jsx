import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { useAuthStore } from './store/authStore'

// Pages
import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Dashboard    from './pages/Dashboard'
import Lessons      from './pages/Lessons'
import LessonPlayer from './pages/LessonPlayer'
import Profile      from './pages/Profile'
import Leaderboard  from './pages/Leaderboard'
import Admin        from './pages/Admin'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function StaffRoute({ children }) {
  const { user } = useAuthStore()
  if (!user?.is_staff) return <Navigate to="/dashboard" replace />
  return children ? children : <Outlet />
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* ── Public routes ────────────────────────────────────────── */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected routes ─────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard"     element={<Dashboard />} />
          <Route path="/lessons"       element={<Lessons />} />
          <Route path="/lessons/:id"   element={<LessonPlayer />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/leaderboard"   element={<Leaderboard />} />
          <Route element={<StaffRoute />}>
            <Route path="/admin"       element={<Admin />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

