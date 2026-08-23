import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { useAuthStore } from './store/authStore'
import PageSpinner from './components/ui/PageSpinner'

// Lazy loaded pages
const Landing      = lazy(() => import('./pages/Landing'))
const Login        = lazy(() => import('./pages/Login'))
const Register     = lazy(() => import('./pages/Register'))
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Lessons      = lazy(() => import('./pages/Lessons'))
const LessonPlayer = lazy(() => import('./pages/LessonPlayer'))
const Profile      = lazy(() => import('./pages/Profile'))
const Leaderboard  = lazy(() => import('./pages/Leaderboard'))
const Admin        = lazy(() => import('./pages/Admin'))

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
      <Suspense fallback={<PageSpinner />}>
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
      </Suspense>
    </BrowserRouter>
  )
}

