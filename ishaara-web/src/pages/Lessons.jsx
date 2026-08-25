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
    setLockedTooltip({
      lesson,
      x: rect.left + rect.width / 2,
      y: rect.top - 8
    })
  }

  const completedCount = lessons?.filter(l => l.user_progress_status === 'completed').length || 0

  return (
    <PageWrapper>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px', position: 'relative' }}>

        {/* Page header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 0 16px'
        }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>
              Learning Path
            </h1>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              Level {userLevel} · {completedCount} lesson{completedCount !== 1 ? 's' : ''} done
            </p>
          </div>

          {/* Quick continue button */}
          {nextLesson && (
            <button
              onClick={() => navigate(`/lessons/${nextLesson.id}`)}
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '8px 16px',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              className="hover:scale-105 active:scale-95"
            >
              Continue →
            </button>
          )}
        </div>

        {/* Sticky progress bar */}
        <div style={{
          background: '#1f2937',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 20
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#6b7280',
            marginBottom: 4
          }}>
            <span>Overall Progress</span>
            <span>{completedCount} / {lessons?.length || 0} lessons</span>
          </div>
          <div style={{
            background: '#374151',
            borderRadius: 4,
            height: 6
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
              borderRadius: 4,
              height: 6,
              width: `${lessons?.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            paddingTop: 40
          }}>
            {[1, 2, 3, 4].map(i => (
              <SkeletonLoader key={i} variant="circle" size="xl" className="!w-16 !h-16" />
            ))}
          </div>
        )}

        {/* Path sections */}
        {!isLoading && sections.map(section => (
          <PathSection
            key={section.id}
            section={section}
            userLevel={userLevel}
            onLessonClick={(lesson) => navigate(`/lessons/${lesson.id}`)}
            onLockedClick={handleLockedClick}
          />
        ))}

        {/* End of path */}
        {!isLoading && sections.length > 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 0',
            color: '#374151',
            fontSize: 13
          }}>
            🎉 More lessons coming soon!
          </div>
        )}

        {/* Floating tooltip */}
        {lockedTooltip && (
          <div
            style={{
              position: 'fixed',
              left: lockedTooltip.x,
              top: lockedTooltip.y,
              transform: 'translate(-50%, -100%)',
              background: '#1f2937',
              border: '2px solid #ef4444',
              borderRadius: 12,
              padding: '12px 16px',
              zIndex: 100,
              width: 220,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              pointerEvents: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#ef4444' }}>
                  🔒 Locked Lesson
                </span>
                <button
                  onClick={() => setLockedTooltip(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    fontSize: 14,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 4 }}>
                Reach Level {lockedTooltip.lesson.required_level} to unlock.
              </p>
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                You are currently Level {userLevel}.
              </p>
            </div>
          </div>
        )}

      </div>
    </PageWrapper>
  )
}
