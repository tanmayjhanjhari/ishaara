import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Zap, Flame, LayoutDashboard, BookOpen, User, Trophy, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Button } from '../ui'
import { getDisplayName } from '../../utils/user'
import client from '../../api/client'
import { useXPData, useStreak } from '../../api/gamification'
import LevelBadge from '../game/LevelBadge'
import XPBar from '../game/XPBar'
import StreakCard from '../game/StreakCard'

const NAV = [
  { to: '/dashboard',   label: 'Home',    Icon: LayoutDashboard },
  { to: '/lessons',     label: 'Journey', Icon: BookOpen },
  { to: '/leaderboard', label: 'League',  Icon: Trophy },
  { to: '/profile',     label: 'Profile', Icon: User },
]

export default function Navbar() {
  const { isAuthenticated, logout: storeLogout, user } = useAuthStore()
  const { data: xpData } = useXPData({ enabled: !!isAuthenticated })
  const { data: streakData } = useStreak({ enabled: !!isAuthenticated })
  const [open,        setOpen]        = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    const refresh = localStorage.getItem('ishaara_refresh_token')
    try {
      await client.post('/api/v1/auth/logout/', { refresh })
    } catch (e) {
      // Ignore API error — still logout locally
    } finally {
      storeLogout()
      navigate('/login')
    }
  }

  const displayName = getDisplayName(user)
  const initials = displayName.slice(0, 2).toUpperCase() || 'U'
  const streak   = streakData?.current_streak ?? user?.streak?.current_streak ?? 0
  const xp       = xpData?.total_xp ?? user?.profile?.xp_total ?? 0
  const level    = xpData?.level ?? user?.profile?.level ?? 1

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(7,7,20,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(167,139,250,0.1)',
        }}
      >
        <div className="page-container h-16 flex items-center justify-between">
          {/* ── Wordmark ── */}
          <Link to="/" className="wordmark text-2xl select-none">
            <span className="wordmark-i">i</span>shaara
          </Link>

          {/* ── Desktop nav ── */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-dim text-primary-light'
                        : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? { background: 'rgba(124,58,237,0.12)' } : {}}
                >
                  <Icon size={15} />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* ── Right side ── */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Streak pill */}
                <div className="hidden sm:flex">
                  <StreakCard compact={true} currentStreak={streak} />
                </div>
                {/* XP pill */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-mono"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Zap size={13} />
                  {xp.toLocaleString()} XP
                </div>

                {/* Level badge and XP Progress tooltip */}
                <div className="relative group flex items-center cursor-pointer">
                  <LevelBadge level={level} size="sm" />
                  
                  {/* On hover tooltip showing full XP progress */}
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 bg-[#0c0c20]/95 border border-indigo-500/20 p-4 rounded-xl shadow-2xl w-64 pointer-events-none transition-all duration-200 backdrop-blur-md">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-2">
                      XP PROGRESS
                    </span>
                    <XPBar
                      xp={xp}
                      level={level}
                      prevLevelXP={xpData?.prev_level_xp ?? 0}
                      nextLevelXP={xpData?.next_level_xp ?? 100}
                    />
                    <div className="mt-2 text-[10px] text-gray-500 font-bold flex justify-between">
                      <span>Total: {xp.toLocaleString()} XP</span>
                      {xpData?.xp_to_next > 0 ? (
                        <span>{xpData.xp_to_next} XP to Level {level + 1}</span>
                      ) : (
                        <span>Max Level reached!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Avatar dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(v => !v)}
                    className="hidden md:flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                      {initials}
                    </div>
                    <ChevronDown size={14} style={{ color: '#7B7BA8', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {dropdownOpen && (
                    <div
                      style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                        minWidth: 180, borderRadius: 14, padding: '8px',
                        background: 'rgba(12,12,32,0.97)', border: '1px solid rgba(167,139,250,0.12)',
                        backdropFilter: 'blur(20px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                        zIndex: 100,
                      }}
                    >
                      <div style={{ padding: '8px 12px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#EEE9FF' }}>{displayName}</div>
                        <div style={{ fontSize: 12, color: '#7B7BA8', marginTop: 2 }}>{user?.email}</div>
                      </div>
                      <button
                        onClick={() => { navigate('/profile'); setDropdownOpen(false) }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          fontSize: 13, color: '#7B7BA8', background: 'transparent',
                          transition: 'all 0.15s', textDecoration: 'none',
                        }}
                        className="hover:bg-white/5 hover:text-text-primary text-left"
                      >
                        <User size={14} />
                        Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                          fontSize: 13, color: '#EF4444', background: 'transparent',
                          transition: 'all 0.15s',
                        }}
                        className="hover:bg-red-500/10 text-left"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>

                {/* Mobile menu btn */}
                <button className="md:hidden p-2 rounded-xl text-text-muted hover:text-text-primary"
                  onClick={() => setOpen(v => !v)}>
                  {open ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        {isAuthenticated && open && (
          <div className="md:hidden border-t px-4 pb-4 pt-2 flex flex-col gap-1"
            style={{ borderColor: 'rgba(167,139,250,0.1)', background: 'rgba(7,7,20,0.95)' }}>
            {NAV.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? 'text-primary-light' : 'text-text-muted'
                  }`
                }
                style={({ isActive }) => isActive ? { background: 'rgba(124,58,237,0.12)' } : {}}>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-error/70 hover:text-error">
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </header>


    </>
  )
}
