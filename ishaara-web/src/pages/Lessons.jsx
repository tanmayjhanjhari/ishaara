import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import { SkeletonLoader } from '../components/ui'
import { useLessonPath } from '../api/lessons'
import { buildPathLayout, getLessonStatus } from '../utils/pathLayout'
import PathSection from '../components/lesson/PathSection'
import { useAuthStore } from '../store/authStore'

export default function Lessons() {
  const navigate               = useNavigate()
  const { user }               = useAuthStore()
  const { data: lessons = [], isLoading } = useLessonPath()
  const [lockedTooltip, setLockedTooltip] = useState(null)

  const userLevel = user?.profile?.level || 1
  const sections  = lessons ? buildPathLayout(lessons) : []

  // Find first available active lesson for quick-start
  const nextLesson = lessons?.find(l =>
    getLessonStatus(l, userLevel) === 'available' ||
    getLessonStatus(l, userLevel) === 'active')

  // Close tooltip on scroll or click outside
  useEffect(() => {
    if (!lockedTooltip) return
    const handleClose = () => setLockedTooltip(null)
    window.addEventListener('click', handleClose)
    window.addEventListener('scroll', handleClose)
    return () => {
      window.removeEventListener('click', handleClose)
      window.removeEventListener('scroll', handleClose)
    }
  }, [lockedTooltip])

  const handleLockedClick = (lesson, e) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    // Calculate page scroll offset for absolute fixed coordinates
    setLockedTooltip({
      lesson,
      x: rect.left + rect.width / 2,
      y: rect.top - 12
    })
  }

  const completedCount = lessons?.filter(l => l.user_progress_status === 'completed').length || 0

  return (
    <PageWrapper>
      <div className="w-full max-w-[480px] mx-auto px-4 relative pb-16">

        {/* Page header */}
        <div className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
              Learning Path
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                LEVEL {userLevel}
              </span>
              <span className="text-xs text-gray-400 font-bold">
                • {completedCount} completed
              </span>
            </div>
          </div>

          {/* Quick continue button */}
          {nextLesson && (
            <button
              onClick={() => navigate(`/lessons/${nextLesson.id}`)}
              className="relative overflow-hidden group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs tracking-wider rounded-xl px-4 py-2.5 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 border border-indigo-400/20"
            >
              <span className="relative z-10 flex items-center gap-1.5">
                CONTINUE <span className="text-sm font-black">→</span>
              </span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>

        {/* Sticky progress bar */}
        <div className="bg-[#0b0c16]/75 backdrop-blur-xl border border-white/5 rounded-2xl p-4 mb-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-10 opacity-5 blur-xl pointer-events-none bg-gradient-to-tr from-indigo-500 to-purple-500" />
          <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-400 mb-2 relative z-10">
            <span>OVERALL PATH PROGRESS</span>
            <span className="text-gray-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {completedCount} / {lessons?.length || 0} Lessons
            </span>
          </div>
          <div className="bg-slate-950/80 rounded-full h-2 w-full p-[1px] border border-white/5 overflow-hidden relative z-10">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${lessons?.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
                boxShadow: '0 0 10px rgba(168,85,247,0.5)'
              }}
            />
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="flex flex-col items-center gap-16 py-12">
            <div className="w-72 h-20 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
            <div className="flex flex-col items-center gap-20 w-full relative">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-[72px] h-[72px] rounded-full bg-white/5 border-4 border-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Path sections */}
        {!isLoading && sections.map(section => (
          <PathSection
            key={section.id}
            section={section}
            userLevel={userLevel}
            nextLessonId={nextLesson?.id}
            onLessonClick={(lesson) => navigate(`/lessons/${lesson.id}`)}
            onLockedClick={handleLockedClick}
          />
        ))}

        {/* End of path */}
        {!isLoading && sections.length > 0 && (
          <div className="text-center py-10 text-gray-500 font-bold text-xs tracking-wider">
            🎉 More lessons coming soon!
          </div>
        )}

        {/* Floating locked tooltip speech bubble */}
        {lockedTooltip && (
          <div
            className="fixed z-[100] w-64 p-[1.5px] rounded-2xl bg-gradient-to-b from-red-500/30 to-red-950/50 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
            style={{
              left: lockedTooltip.x,
              top: lockedTooltip.y,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#0f0b18]/98 backdrop-blur-xl rounded-[15px] p-4 flex flex-col gap-1.5 relative">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest text-red-400 flex items-center gap-1">
                  <span>🔒</span> LOCKED LESSON
                </span>
                <button
                  onClick={() => setLockedTooltip(null)}
                  className="text-gray-500 hover:text-gray-300 transition-colors text-xs font-bold focus:outline-none p-0.5"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-white font-extrabold leading-snug">
                Reach Level {lockedTooltip.lesson.required_level} to unlock.
              </p>
              <p className="text-[10px] text-gray-400 font-bold">
                You are currently Level {userLevel}.
              </p>

              {/* Downward triangle indicator */}
              <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0"
                style={{
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '8px solid rgba(15, 11, 24, 0.98)',
                }}
              />
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}
