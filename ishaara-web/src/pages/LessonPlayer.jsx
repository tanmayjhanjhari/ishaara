import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, X } from 'lucide-react'
import { Button, Modal, Spinner } from '../components/ui'
import { useLesson } from '../api/lessons'
import { useCompleteLesson, useSubmitAttempt } from '../api/progress'
import { useSessionStore } from '../store/sessionStore'
import { useAuthStore } from '../store/authStore'
import LessonProgress from '../components/lesson/LessonProgress'
import WebcamPanel from '../components/webcam/WebcamPanel'
import WebcamPermission from '../components/webcam/WebcamPermission'
import ErrorBoundary from '../components/ui/ErrorBoundary'
import client from '../api/client'

// Feature 12 imports
import { useSignScorer } from '../cv/useSignScorer'
import ScoreMeter, { updateMeter } from '../components/webcam/ScoreMeter'
import HoldRing, { updateRing } from '../components/webcam/HoldRing'
import ScoreOverlay from '../components/webcam/ScoreOverlay'
import { SCORE_THRESHOLD, SUCCESS_THRESHOLD, computeXP } from '../cv/scoring'
import { initModel } from '../cv/onnxModel'
import { landmarksToArray } from '../cv/normalize'

// Feature 13 imports
import LiveHint, { updateHint } from '../components/lesson/LiveHint'
import FeedbackTip from '../components/lesson/FeedbackTip'
import SignReference from '../components/lesson/SignReference'
import LessonSummary from '../components/lesson/LessonSummary'
import StreakNotification from '../components/lesson/StreakNotification'
import BadgeNotification from '../components/lesson/BadgeNotification'
import { useNotificationQueue } from '../utils/notificationQueue'
import { getLiveHint, getPostAttemptTip } from '../cv/feedback'

export default function LessonPlayer() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const queryClient  = useQueryClient()
  const sessionStore = useSessionStore()
  const authStore    = useAuthStore()

  const isStaff = authStore.user?.is_staff || false

  const { data: lesson, isLoading, isError } = useLesson(id)
  const completeLesson = useCompleteLesson()
  const postAttempt    = useSubmitAttempt()

  const [showExitModal, setShowExitModal]   = useState(false)
  const [completeResult, setCompleteResult] = useState(null)
  const completeCalled = useRef(false)

  const videoReadyRef = useRef(null)
  const onVideoReady = (ref) => { videoReadyRef.current = ref.current }

  const signs       = sessionStore.signs
  const signIndex   = sessionStore.signIndex
  const currentSign = signs[signIndex] || null

  // Feature 12 & 13 states & refs
  const meterRef     = useRef(null)
  const ringRef      = useRef(null)
  const hintRef      = useRef(null)
  const holdPercent  = useRef(0)
  const latestRawRef = useRef(null)

  const [overlayVisible, setOverlayVisible] = useState(false)
  const [overlayData, setOverlayData]       = useState(null)
  const [captureStatus, setCaptureStatus]   = useState(null)

  // Feature 13 state & queue hooks
  const [feedbackTip, setFeedbackTip]   = useState(null)
  const [isPulsing, setIsPulsing]       = useState(false)
  const [signResults, setSignResults]   = useState([])
  const { current: notification, enqueue, dismiss } = useNotificationQueue()

  // Direct DOM updates for performance (bypass React render loop at 30fps)
  const handleScoreUpdate = useCallback((smoothed) => {
    updateMeter(meterRef, smoothed)
    const isHandDetected = latestRawRef.current !== null
    const hint = getLiveHint(smoothed, isHandDetected)
    updateHint(hintRef, hint)

    const isHolding = smoothed >= SCORE_THRESHOLD
    if (isHolding) {
      holdPercent.current = Math.min(holdPercent.current + 3, 100)
    } else {
      holdPercent.current = 0
    }
    updateRing(ringRef, holdPercent.current, holdPercent.current >= 100)
  }, [])

  // Score ready handler
  const handleScoreReady = useCallback(async (result) => {
    const { score, is_success, rating } = result
    const xpEarned = computeXP(score, currentSign?.xp_reward || 10)

    let attemptResponse = null
    try {
      attemptResponse = await postAttempt.mutateAsync({
        sign_id: currentSign.id,
        score,
        is_success
      })
    } catch (e) {
      console.error('Attempt submit failed:', e)
    }

    // Set overlay
    setOverlayData({ score, rating, xpEarned })
    setOverlayVisible(true)
    holdPercent.current = 0
    updateRing(ringRef, 0, false)

    // Set coaching tip feedback & visual pulsing
    const tip = getPostAttemptTip(score)
    setFeedbackTip(is_success ? null : tip)
    setIsPulsing(!is_success)
    setTimeout(() => setIsPulsing(false), 3000)

    // Record result
    setSignResults(prev => {
      const idx = prev.findIndex(r => r.sign.id === currentSign.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          score: Math.max(updated[idx].score, score),
          isSuccess: updated[idx].isSuccess || is_success,
          attempts: updated[idx].attempts + 1
        }
        return updated
      } else {
        return [...prev, {
          sign: currentSign,
          score,
          isSuccess: is_success,
          attempts: 1
        }]
      }
    })

    // Handle notifications from attempt response
    if (attemptResponse?.streak_updated) {
      enqueue({
        type: 'streak',
        currentStreak: attemptResponse.current_streak
      })
    }
    if (attemptResponse?.badges_earned?.length > 0) {
      attemptResponse.badges_earned.forEach(badge => {
        enqueue({ type: 'badge', badge })
      })
    }
  }, [currentSign, postAttempt, enqueue])

  // Initialize useSignScorer hook
  const scorer = useSignScorer({
    sign: currentSign,
    onScoreReady: handleScoreReady,
    onScoreUpdate: handleScoreUpdate
  })

  // Dismiss score overlay
  const handleOverlayDismiss = useCallback(() => {
    setOverlayVisible(false)
    if (overlayData?.score >= SUCCESS_THRESHOLD) {
      sessionStore.nextSign()
      scorer.resetScorer()
      setFeedbackTip(null)
      setIsPulsing(false)
    }
  }, [overlayData, sessionStore, scorer])

  // Skip handler
  const handleSkip = () => {
    scorer.resetScorer()
    sessionStore.nextSign()
    setFeedbackTip(null)
    setIsPulsing(false)
  }

  // Capture current camera frame as reference landmarks (is_staff only)
  const handleCaptureReference = async () => {
    if (!latestRawRef.current) {
      setCaptureStatus('error')
      setTimeout(() => setCaptureStatus(null), 3000)
      return
    }
    setCaptureStatus('capturing')
    try {
      const payload = {
        left_hand: latestRawRef.current.leftHand ? landmarksToArray(latestRawRef.current.leftHand) : null,
        right_hand: latestRawRef.current.rightHand ? landmarksToArray(latestRawRef.current.rightHand) : null
      }
      await client.put(`/api/v1/admin/signs/${currentSign.id}/`, {
        reference_landmarks: payload
      })
      setCaptureStatus('success')
      // Refetch lesson to update current sign's reference landmarks
      queryClient.invalidateQueries({ queryKey: ['lessons', id] })
      setTimeout(() => setCaptureStatus(null), 3000)
    } catch (err) {
      console.error('Failed to capture reference landmarks:', err)
      setCaptureStatus('error')
      setTimeout(() => setCaptureStatus(null), 3000)
    }
  }

  const [hasTwoHands, setHasTwoHands] = useState(false)

  // Handle landmarks callback from WebcamPanel
  const handleLandmarks = useCallback((vector, leftHand, rightHand) => {
    latestRawRef.current = { leftHand, rightHand }
    setHasTwoHands(!!leftHand && !!rightHand)
    scorer.processFrame(vector)
  }, [scorer])

  // Scroll to top and preload the ONNX model on mount
  useEffect(() => {
    window.scrollTo(0, 0)
    initModel().catch(err => console.warn('[ONNX] Preload failed in LessonPlayer:', err))
  }, [])

  // Start lesson when data arrives — only once per lesson id
  useEffect(() => {
    if (lesson && lesson.signs?.length > 0 && sessionStore.lessonId !== lesson.id) {
      sessionStore.startLesson(lesson)
      completeCalled.current = false
      setSignResults([])
    }
  }, [lesson]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on unmount
  useEffect(() => {
    return () => { sessionStore.resetSession() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete  = sessionStore.isComplete()

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
      setSignResults([])
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
          <LessonSummary
            lesson={lesson}
            signResults={signResults}
            totalXP={completeResult?.xp_earned ?? signResults.reduce((sum, r) => sum + computeXP(r.score, r.sign.xp_reward), 0)}
            onPracticeAgain={handlePracticeAgain}
            onBack={handleBack}
          />
        </div>
      </div>
    )
  }

  // ── Player ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: '#070714' }}>

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

          {/* Left: Webcam with overlays — 2/5 width */}
          <div className="lg:col-span-2 h-[45vh] lg:h-auto bg-gray-900 rounded-2xl overflow-hidden m-4 lg:mr-2 min-h-[320px] flex flex-col relative shadow-2xl border border-white/5">
            <ErrorBoundary fallback={<WebcamPermission error="device_error" onRetry={() => window.location.reload()} />}>
              <div className="relative flex-1 w-full h-full min-h-0">
                <WebcamPanel
                  onVideoReady={onVideoReady}
                  onLandmarks={handleLandmarks}
                  showSkeleton={true}
                  mediaPipeEnabled={true}
                  className="w-full h-full object-cover"
                />
                <HoldRing ringRef={ringRef} />
                {hasTwoHands && (
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-cyan text-[11px] font-bold rounded-full px-2.5 py-1.5 flex items-center gap-1.5 border border-cyan/20 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#06b6d4]"></div>
                    Both Hands Tracked
                  </div>
                )}
              </div>
            </ErrorBoundary>

            {/* Live coaching hint overlay inside the webcam view (bottom center) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <LiveHint hintRef={hintRef} />
            </div>
          </div>

          {/* Right: Sign info + controls — 3/5 width */}
          <div className="lg:col-span-3 p-4 lg:pl-2 lg:pr-6 flex flex-col">
            <div className="sticky top-20">
              <LessonProgress
                current={signIndex + 1}
                total={signs.length}
                lessonTitle={lesson?.title ?? ''}
              />

              {currentSign && (
                <div className="mt-6">
                  <SignReference sign={currentSign} isPulsing={isPulsing} />
                </div>
              )}

              {/* Confidence Score Meter */}
              {currentSign && (
                <div className="mt-4">
                  <ScoreMeter meterRef={meterRef} />
                </div>
              )}

              {/* Feedback coaching tip for failed attempts */}
              <FeedbackTip tip={feedbackTip} isVisible={!overlayVisible && !!feedbackTip} />

              {/* Skip button only when no reference landmarks exist */}
              {(!currentSign?.reference_landmarks || currentSign?.reference_landmarks.length === 0) && (
                <div className="flex justify-center mt-8">
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Skip (No Reference)
                  </Button>
                </div>
              )}

              {/* Staff Capture reference tool */}
              {isStaff && currentSign && (
                <div className="mt-8 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
                  <p className="text-xs text-primary-light font-bold mb-2">Staff Developer Tool</p>
                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={handleCaptureReference}
                    disabled={captureStatus === 'capturing'}
                  >
                    {captureStatus === 'capturing' ? 'Capturing...' : 'Capture Reference'}
                  </Button>
                  {captureStatus === 'success' && (
                    <p className="text-xs text-success mt-2 font-medium">✓ Reference landmarks captured!</p>
                  )}
                  {captureStatus === 'error' && (
                    <p className="text-xs text-danger mt-2 font-medium">✗ Failed to capture landmarks (is hand in view?).</p>
                  )}
                </div>
              )}
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

      {/* Score Overlay modal */}
      <ScoreOverlay
        score={overlayData?.score}
        rating={overlayData?.rating}
        xpEarned={overlayData?.xpEarned}
        isVisible={overlayVisible}
        onDismiss={handleOverlayDismiss}
      />

      {/* Streak Notification Toast */}
      {notification?.type === 'streak' && (
        <StreakNotification
          currentStreak={notification.currentStreak}
          isVisible={true}
          onDismiss={dismiss}
        />
      )}

      {/* Badge Notification Toast */}
      {notification?.type === 'badge' && (
        <BadgeNotification
          badge={notification.badge}
          isVisible={true}
          onDismiss={dismiss}
        />
      )}
    </div>
  )
}
