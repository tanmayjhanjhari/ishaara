import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X } from 'lucide-react'
import { Button, Modal, Spinner } from '../components/ui'
import { useLesson } from '../api/lessons'
import { useCompleteLesson } from '../api/progress'
import { useSessionStore } from '../store/sessionStore'
import LessonProgress from '../components/lesson/LessonProgress'
import SignCard from '../components/lesson/SignCard'
import LessonComplete from '../components/lesson/LessonComplete'
import WebcamPanel from '../components/webcam/WebcamPanel'
import WebcamPermission from '../components/webcam/WebcamPermission'
import ErrorBoundary from '../components/ui/ErrorBoundary'

export default function LessonPlayer() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const sessionStore = useSessionStore()

  const { data: lesson, isLoading, isError } = useLesson(id)
  const completeLesson = useCompleteLesson()

  const [showExitModal, setShowExitModal]   = useState(false)
  // Holds API response once complete call resolves
  const [completeResult, setCompleteResult] = useState(null)
  // Prevent duplicate API calls on re-renders
  const completeCalled = useRef(false)

  const videoReadyRef = useRef(null)
  const onVideoReady = (ref) => { videoReadyRef.current = ref.current }

  // Scroll to top on mount
  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Start lesson when data arrives — only once per lesson id
  useEffect(() => {
    if (lesson && lesson.signs?.length > 0 && sessionStore.lessonId !== lesson.id) {
      sessionStore.startLesson(lesson)
      completeCalled.current = false  // reset for new lesson
    }
  }, [lesson]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on unmount
  useEffect(() => {
    return () => { sessionStore.resetSession() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signs       = sessionStore.signs
  const signIndex   = sessionStore.signIndex
  const currentSign = signs[signIndex] || null
  const isComplete  = sessionStore.isComplete()
  const scores      = sessionStore.scores

  // Call complete API once when session becomes complete
  useEffect(() => {
    if (isComplete && lesson && !completeCalled.current) {
      completeCalled.current = true
      const accuracy = sessionStore.getAccuracy() ?? 0
      completeLesson.mutate(
        { lessonId: lesson.id, accuracy },
        {
          onSuccess: (data) => {
            setCompleteResult(data)
            // Invalidate lessons so progress_status updates on the browse page
            queryClient.invalidateQueries({ queryKey: ['lessons'] })
          },
        }
      )
    }
  }, [isComplete]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleExit() {
    sessionStore.resetSession()
    navigate('/lessons')
  }

  function handlePracticeAgain() {
    if (lesson) {
      sessionStore.startLesson(lesson)
      completeCalled.current = false
      setCompleteResult(null)
    }
  }

  function handleBack() {
    sessionStore.resetSession()
    navigate('/lessons')
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070714' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#070714' }}>
        <p className="text-text-muted">Failed to load lesson.</p>
        <Button variant="secondary" onClick={() => navigate('/lessons')}>
          Back to Lessons
        </Button>
      </div>
    )
  }

  // ── Complete ─────────────────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="min-h-screen" style={{ background: '#070714' }}>
        <header
          className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4"
          style={{ background: 'rgba(7,7,20,0.9)', borderBottom: '1px solid rgba(167,139,250,0.1)' }}
        >
          <span className="wordmark text-lg mx-auto">
            <span className="wordmark-i">i</span>shaara
          </span>
        </header>
        <div className="pt-14">
          <LessonComplete
            lesson={lesson}
            scores={scores}
            onPracticeAgain={handlePracticeAgain}
            onBack={handleBack}
            xpEarned={completeResult?.xp_earned ?? null}
            newLevel={completeResult?.new_level ?? null}
            leveledUp={completeResult?.leveled_up ?? false}
            badgesEarned={completeResult?.badges_earned ?? []}
          />
        </div>
      </div>
    )
  }

  // ── Player ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070714' }}>

      {/* Fixed header bar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14"
        style={{
          background: 'rgba(7,7,20,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(167,139,250,0.1)',
        }}
      >
        <div className="h-full flex items-center justify-between px-4">
          <button
            onClick={() => setShowExitModal(true)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <span className="text-sm font-medium text-text-primary truncate max-w-[50%] text-center">
            {lesson?.title}
          </span>

          <button
            onClick={() => setShowExitModal(true)}
            className="text-text-muted hover:text-text-primary transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>
        {/* Progress strip */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary/10">
          <div
            className="h-full bg-gradient-to-r from-primary to-cyan transition-all duration-500"
            style={{ width: `${signs.length > 0 ? ((signIndex + 1) / signs.length) * 100 : 0}%` }}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-[calc(100vh-56px)]">

          {/* Left: Webcam */}
          <div className="lg:col-span-3 h-[50vh] lg:h-auto bg-gray-900 rounded-2xl overflow-hidden m-4 min-h-[400px] flex">
            <ErrorBoundary fallback={<WebcamPermission error="device_error" onRetry={() => window.location.reload()} />}>
              <WebcamPanel
                onVideoReady={onVideoReady}
                className="w-full h-full flex-1"
              />
            </ErrorBoundary>
          </div>

          {/* Right: Sign info + controls */}
          <div className="lg:col-span-2 p-6 flex flex-col">
            <div className="sticky top-20">
              <LessonProgress
                current={signIndex + 1}
                total={signs.length}
                lessonTitle={lesson?.title ?? ''}
              />

              {currentSign && (
                <div className="mt-6">
                  <SignCard sign={currentSign} size="lg" />
                </div>
              )}

              {currentSign && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-text-muted">Make the sign for:</p>
                  <p
                    className="font-black font-outfit text-primary-light mt-1"
                    style={{ fontSize: '3rem', lineHeight: 1, textShadow: '0 0 30px rgba(167,139,250,0.5)' }}
                  >
                    {currentSign.label}
                  </p>
                </div>
              )}

              <div className="flex justify-between gap-3 mt-8">
                <Button variant="ghost" size="sm" onClick={() => sessionStore.nextSign()}>
                  Skip
                </Button>
                <Button variant="primary" size="md" onClick={() => sessionStore.nextSign()}>
                  Next →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit modal */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Exit Lesson?" size="sm">
        <p className="text-text-muted text-sm mb-6">
          Your progress in this lesson will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowExitModal(false)}>
            Keep Learning
          </Button>
          <Button variant="danger" onClick={handleExit}>
            Exit
          </Button>
        </div>
      </Modal>
    </div>
  )
}
