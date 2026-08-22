import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Target, X } from 'lucide-react'
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
import TutorialPanel from '../components/lesson/TutorialPanel'
import ISLReferenceImage from '../components/lesson/ISLReferenceImage'
import { getSignData } from '../data/islAlphabet'
import { useNotificationQueue } from '../utils/notificationQueue'
import { getLiveHint, getPostAttemptTip } from '../cv/feedback'
import XPToast from '../components/game/XPToast'
import XPBar from '../components/game/XPBar'
import { useXPData } from '../api/gamification'
import StreakMilestoneModal from '../components/game/StreakMilestoneModal'
import { isMilestone, getMilestoneMessage } from '../utils/streakMilestones'
import { useStreakStore } from '../store/streakStore'

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
  const [completedSignIds, setCompletedSignIds] = useState(new Set())

  // Keep completedSignIds synced when lesson data is loaded/changed
  useEffect(() => {
    if (lesson && lesson.signs) {
      const completed = new Set(
        lesson.signs.filter(s => s.is_completed).map(s => s.id)
      )
      setCompletedSignIds(completed)
    }
  }, [lesson])

  const completeCalled = useRef(false)

  const videoReadyRef = useRef(null)
  const onVideoReady  = (ref) => { videoReadyRef.current = ref.current }

  const signs       = sessionStore.signs
  const signIndex   = sessionStore.signIndex
  const currentSign = signs[signIndex] || null

  // ── Tutorial / Practice mode ──────────────────────────────────────────────
  // 'tutorial' = learning mode (TutorialPanel overlay visible, no scoring)
  // 'practice' = scoring mode (ONNX runs, score meter active)
  const [mode, setMode]                     = useState('tutorial')
  const [showTutorialPanel, setShowTutorialPanel] = useState(true)
  const [activeVariant, setActiveVariant]   = useState('two')

  // When the sign changes, reset to tutorial mode automatically
  useEffect(() => {
    setMode('tutorial')
    setShowTutorialPanel(true)
    if (currentSign) {
      const signData = getSignData(currentSign.label)
      setActiveVariant(signData?.defaultHandForm || 'two')
    } else {
      setActiveVariant('two')
    }
    scorer.resetScorer()
    holdPercent.current = 0
    updateMeter(meterRef, 0)
    updateRing(ringRef, 0, false)
  }, [signIndex, currentSign?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartPractice = useCallback(() => {
    setShowTutorialPanel(false)
    setMode('practice')
    scorer.resetScorer()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Feature 12 & 13 refs ──────────────────────────────────────────────────
  const meterRef     = useRef(null)
  const ringRef      = useRef(null)
  const hintRef      = useRef(null)
  const holdPercent  = useRef(0)
  const latestRawRef = useRef(null)

  const [overlayVisible, setOverlayVisible] = useState(false)
  const [overlayData, setOverlayData]       = useState(null)
  const [captureStatus, setCaptureStatus]   = useState(null)

  // Feature 13 state
  const [feedbackTip, setFeedbackTip]   = useState(null)
  const [isPulsing, setIsPulsing]       = useState(false)
  const [signResults, setSignResults]   = useState([])
  const [hasTwoHands, setHasTwoHands]   = useState(false)
  const { current: notification, enqueue, dismiss } = useNotificationQueue()
  const { data: xpData }                = useXPData()
  const [xpToastVisible, setXpToastVisible] = useState(false)
  const [xpToastAmount, setXpToastAmount]   = useState(0)
  const [pendingLevelUp, setPendingLevelUp] = useState(false)
  const [milestoneCelebration, setMilestoneCelebration] = useState(null)

  const sessionXP = signResults.reduce((sum, r) => sum + (r.xpEarned || 0), 0)

  // Direct DOM updates for 30fps performance (bypass React render loop)
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
        sign_id:    currentSign.id,
        score,
        is_success,
      })
    } catch (e) {
      console.error('Attempt submit failed:', e)
    }

    const actualXpEarned = attemptResponse?.xp_earned ?? xpEarned

    if (attemptResponse && attemptResponse.xp_earned > 0) {
      setXpToastAmount(attemptResponse.xp_earned)
      setXpToastVisible(true)
    }

    if (attemptResponse?.leveled_up) {
      setPendingLevelUp(true)
    }

    if (is_success) {
      setCompletedSignIds(prev => {
        const next = new Set(prev)
        next.add(currentSign.id)
        return next
      })
      queryClient.invalidateQueries({ queryKey: ['xp'] })
      queryClient.invalidateQueries({ queryKey: ['my-stats'] })
    }

    setOverlayData({ score, rating, xpEarned: actualXpEarned })
    setOverlayVisible(true)
    holdPercent.current = 0
    updateRing(ringRef, 0, false)

    const tip = getPostAttemptTip(score)
    setFeedbackTip(is_success ? null : tip)
    setIsPulsing(!is_success)
    setTimeout(() => setIsPulsing(false), 3000)

    setSignResults(prev => {
      const idx = prev.findIndex(r => r.sign.id === currentSign.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          score:     Math.max(updated[idx].score, score),
          isSuccess: updated[idx].isSuccess || is_success,
          attempts:  updated[idx].attempts + 1,
          xpEarned:  Math.max(updated[idx].xpEarned || 0, actualXpEarned)
        }
        return updated
      }
      return [...prev, { sign: currentSign, score, isSuccess: is_success, attempts: 1, xpEarned: actualXpEarned }]
    })

    if (attemptResponse?.streak_updated) {
      const newStreak = attemptResponse.current_streak
      useStreakStore.getState().markActiveToday(newStreak)

      if (isMilestone(newStreak)) {
        const milestoneMsg = getMilestoneMessage(newStreak)
        if (milestoneMsg) {
          setMilestoneCelebration({ streak: newStreak, milestone: milestoneMsg })
        }
      } else {
        enqueue({ type: 'streak', currentStreak: newStreak })
      }
    }
    if (attemptResponse?.badges_earned?.length > 0) {
      attemptResponse.badges_earned.forEach(badge => enqueue({ type: 'badge', badge }))
      queryClient.invalidateQueries({ queryKey: ['badges'] })
    }
  }, [currentSign, postAttempt, enqueue, queryClient])

  // Scorer hook — always mounted, mode gate is in handleLandmarks
  const scorer = useSignScorer({
    sign:          currentSign,
    activeVariant,
    onScoreReady:  handleScoreReady,
    onScoreUpdate: handleScoreUpdate,
  })

  // Unified next sign / lesson completion handler
  const handleNextSign = useCallback(() => {
    scorer.resetScorer()
    setFeedbackTip(null)
    setIsPulsing(false)
    if (signIndex < signs.length - 1) {
      sessionStore.nextSign()
    } else {
      sessionStore.setSignIndex(signs.length)
    }
  }, [signIndex, signs.length, sessionStore, scorer])

  // Dismiss score overlay
  const handleOverlayDismiss = useCallback(() => {
    setOverlayVisible(false)
    if (overlayData?.score >= SUCCESS_THRESHOLD) {
      if (pendingLevelUp) {
        queryClient.invalidateQueries({ queryKey: ['xp'] })
        setPendingLevelUp(false)
      }
      handleNextSign()
    } else {
      // Failed — stay in practice mode for retry
      scorer.resetScorer()
    }
  }, [overlayData, handleNextSign, scorer, pendingLevelUp, queryClient])

  // Skip handler
  const handleSkip = () => {
    handleNextSign()
  }

  // Capture reference landmarks (staff only)
  const handleCaptureReference = async () => {
    if (!latestRawRef.current) {
      setCaptureStatus('error')
      setTimeout(() => setCaptureStatus(null), 3000)
      return
    }
    setCaptureStatus('capturing')
    try {
      const payload = {
        left_hand:  latestRawRef.current.leftHand  ? landmarksToArray(latestRawRef.current.leftHand)  : null,
        right_hand: latestRawRef.current.rightHand ? landmarksToArray(latestRawRef.current.rightHand) : null,
      }
      await client.put(`/api/v1/admin/signs/${currentSign.id}/`, {
        reference_landmarks: payload,
      })
      setCaptureStatus('success')
      queryClient.invalidateQueries({ queryKey: ['lessons', id] })
      setTimeout(() => setCaptureStatus(null), 3000)
    } catch (err) {
      console.error('Failed to capture reference landmarks:', err)
      setCaptureStatus('error')
      setTimeout(() => setCaptureStatus(null), 3000)
    }
  }

  // ── Landmark callback — mode-gated scoring ────────────────────────────────
  const handleLandmarks = useCallback((vector, leftHand, rightHand) => {
    latestRawRef.current = { leftHand, rightHand }
    setHasTwoHands(!!leftHand && !!rightHand)

    // Only run scoring in practice mode
    if (mode === 'practice' && vector) {
      scorer.processFrame(vector)
    } else if (mode === 'tutorial') {
      // Keep hint showing "show your hand" even in tutorial mode
      updateMeter(meterRef, 0)
    }
  }, [mode, scorer])

  // Scroll to top + preload ONNX on mount
  useEffect(() => {
    window.scrollTo(0, 0)
    initModel().catch(err => console.warn('[ONNX] Preload failed:', err))
  }, [])

  // Start lesson when data arrives
  useEffect(() => {
    if (lesson && lesson.signs?.length > 0 && sessionStore.lessonId !== lesson.id) {
      sessionStore.startLesson(lesson)
      
      // Auto-resume at the first uncompleted sign
      const firstUncompletedIndex = lesson.signs.findIndex(s => !s.is_completed)
      if (firstUncompletedIndex > 0) {
        sessionStore.setSignIndex(firstUncompletedIndex)
      }
      
      completeCalled.current = false
      setSignResults([])
    }
  }, [lesson]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on unmount
  useEffect(() => {
    return () => { sessionStore.resetSession() }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete = sessionStore.isComplete()

  // Call complete API once when session finishes
  useEffect(() => {
    if (isComplete && lesson && !completeCalled.current) {
      completeCalled.current = true
      const accuracy = sessionStore.getAccuracy() ?? 0
      completeLesson.mutate(
        { lessonId: lesson.id, accuracy },
        {
          onSuccess: (data) => {
            setCompleteResult(data)
            queryClient.invalidateQueries({ queryKey: ['lessons'] })
            queryClient.invalidateQueries({ queryKey: ['badges'] })
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

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070714' }}>
        <Spinner size="lg" />
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
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

  // ── Complete ──────────────────────────────────────────────────────────────
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

  // ── Player ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col animate-fade-in" style={{ background: '#070714' }}>

      {/* Fixed header bar */}
      <header
        className="fixed top-0 left-0 right-0 z-40 h-14"
        style={{
          background:     'rgba(7,7,20,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom:   '1px solid rgba(167,139,250,0.1)',
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

          {/* Left: Webcam — 2/5 width */}
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

                {/* Two-hands badge */}
                {hasTwoHands && (
                  <div className="absolute top-4 left-4 z-20 bg-black/60 backdrop-blur-md text-cyan text-[11px] font-bold rounded-full px-2.5 py-1.5 flex items-center gap-1.5 border border-cyan/20 animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#06b6d4]" />
                    Both Hands Tracked
                  </div>
                )}

                {/* Mode badge */}
                <div
                  className="absolute top-4 right-4 z-20 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-full border"
                  style={mode === 'practice'
                    ? { background: 'rgba(79,70,229,0.25)', borderColor: 'rgba(79,70,229,0.4)', color: '#a5b4fc' }
                    : { background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)', color: '#fcd34d' }
                  }
                >
                  {mode === 'practice' ? '🎯 Practice' : '📖 Study'}
                </div>
              </div>
            </ErrorBoundary>

            {/* Live hint overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
              <LiveHint hintRef={hintRef} />
            </div>
          </div>

          {/* Right: Sign info — 3/5 width */}
          <div className="lg:col-span-3 p-4 lg:pl-2 lg:pr-6 flex flex-col">
            <div className="sticky top-20">

              {/* Progress counter */}
              <LessonProgress
                current={signIndex + 1}
                total={signs.length}
                lessonTitle={lesson?.title ?? ''}
              />

              {/* Session XP Progress & Level Progress */}
              <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-xl space-y-4 shadow-lg">
                {/* Session XP */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                      Session XP
                    </span>
                    <span className="text-xs font-black text-amber-400">
                      +{sessionXP} XP
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, (sessionXP / Math.max(1, signs.length * 10)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Overall Level Progress */}
                {xpData && (
                  <div className="pt-3 border-t border-white/5">
                    <XPBar
                      xp={xpData.total_xp}
                      level={xpData.level}
                      prevLevelXP={xpData.prev_level_xp}
                      nextLevelXP={xpData.next_level_xp}
                    />
                  </div>
                )}
              </div>

              {/* Interactive Sign Selector */}
              {signs.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">
                    Signs in Lesson (Click to Navigate)
                  </p>
                  <div className="flex flex-wrap gap-2 pb-3 border-b border-white/5">
                    {signs.map((signItem, idx) => {
                      const isCurrent = idx === signIndex
                      const isCompleted = completedSignIds.has(signItem.id)
                      const unlocked = idx === 0 || completedSignIds.has(signItem.id) || completedSignIds.has(signs[idx - 1]?.id)
                      
                      return (
                        <button
                          key={signItem.id}
                          disabled={!unlocked}
                          onClick={() => {
                            sessionStore.setSignIndex(idx)
                            scorer.resetScorer()
                          }}
                          className={`relative px-3.5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-1.5 border ${
                            isCurrent
                              ? 'bg-primary border-primary-light/35 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                              : isCompleted
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15'
                                : unlocked
                                  ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                                  : 'bg-white/[0.02] border-transparent text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          {signItem.label}
                          {isCompleted && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Mode toggle tabs */}
              {currentSign && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setMode('tutorial')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      mode === 'tutorial'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                        : 'border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15'
                    }`}
                  >
                    <BookOpen size={14} />
                    Tutorial
                  </button>
                  <button
                    onClick={() => { setMode('practice'); setShowTutorialPanel(false) }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                      mode === 'practice'
                        ? 'bg-primary/15 border-primary/30 text-indigo-300'
                        : 'border-white/8 text-gray-500 hover:text-gray-300 hover:border-white/15'
                    }`}
                  >
                    <Target size={14} />
                    Practice
                  </button>
                </div>
              )}

              {/* Variant Selector Toggle */}
              {currentSign && getSignData(currentSign.label)?.hands === 'variant' && (
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                  <div className="text-left">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">
                      Hand Form Variant
                    </span>
                    <span className="text-xs text-gray-400">
                      Choose which style to perform
                    </span>
                  </div>
                  <div className="flex bg-black/35 p-0.5 rounded-lg border border-white/5">
                    <button
                      onClick={() => setActiveVariant('one')}
                      className={`text-xs px-3.5 py-1.5 rounded-md transition-all font-bold ${
                        activeVariant === 'one'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      1-Hand
                    </button>
                    <button
                      onClick={() => setActiveVariant('two')}
                      className={`text-xs px-3.5 py-1.5 rounded-md transition-all font-bold ${
                        activeVariant === 'two'
                          ? 'bg-indigo-600 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      2-Hand
                    </button>
                  </div>
                </div>
              )}

              {/* Sign info section */}
              {currentSign && (
                <div className="mt-6 space-y-5">
                  {mode === 'tutorial' ? (
                    <div className="space-y-4">
                      {/* Big reference visual */}
                      <ISLReferenceImage letter={currentSign.label} size="large" activeVariant={activeVariant} />

                      {/* Instructions & tips */}
                      {getSignData(currentSign.label) && (
                        <div className="space-y-3">
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1.5">
                              Instruction
                            </h4>
                            <p className="text-sm text-gray-200">
                              {getSignData(currentSign.label).instruction}
                            </p>
                          </div>

                          {getSignData(currentSign.label).tip && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-1.5">
                                Pro-Tip
                              </h4>
                              <p className="text-sm text-amber-200/90">
                                {getSignData(currentSign.label).tip}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Ready to try / Already completed CTAs */}
                      <div className="pt-2 space-y-3">
                        {completedSignIds.has(currentSign.id) ? (
                          <div className="space-y-3">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Sign Already Completed
                              </span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                                Passed
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={handleStartPractice}
                                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] bg-white/5 border border-white/10 text-white hover:bg-white/10"
                              >
                                🎯 Practice Again
                              </button>
                              <button
                                onClick={handleNextSign}
                                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] text-white hover:brightness-110"
                                style={{
                                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                                  boxShadow: '0 4px 15px rgba(16,185,129,0.25)',
                                }}
                              >
                                {signIndex < signs.length - 1 ? '➡️ Next Sign' : '🏁 Finish Lesson'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-3">
                            <p className="text-xs text-gray-400 font-semibold">Ready to test your hand pose?</p>
                            <button
                              onClick={handleStartPractice}
                              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] hover:brightness-110 active:brightness-95"
                              style={{
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                color: '#fff',
                                boxShadow: '0 4px 20px rgba(79,70,229,0.35)',
                              }}
                            >
                              🎯 Start Practice
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Practice Layout: small reference image in a nice header card */}
                      <div className="flex gap-4 items-center bg-white/5 border border-white/10 rounded-xl p-4">
                        <div className="shrink-0">
                          <ISLReferenceImage letter={currentSign.label} size="small" activeVariant={activeVariant} />
                        </div>
                        <div className="flex-1">
                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                            Active Sign
                          </span>
                          <h3 className="text-2xl font-black text-white mt-0.5">
                            {currentSign.label}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                            Form this sign in front of the camera and hold steady for a split second.
                          </p>
                        </div>
                      </div>

                      {/* Score Meter */}
                      <ScoreMeter meterRef={meterRef} />

                      {/* Live Hint */}
                      <div className="hidden">
                        <LiveHint hintRef={hintRef} />
                      </div>

                      {/* Feedback Coaching Tip */}
                      <FeedbackTip tip={feedbackTip} isVisible={!overlayVisible && !!feedbackTip} />

                      {/* If already completed, display next sign button in practice mode too */}
                      {completedSignIds.has(currentSign.id) && (
                        <div className="pt-2">
                          <button
                            onClick={handleNextSign}
                            className="w-full py-2.5 rounded-xl font-bold text-sm bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                          >
                            <span>➡️ Skip to Next Sign</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Skip button when no reference data */}
              {mode === 'practice' && (!currentSign?.reference_landmarks || currentSign?.reference_landmarks.length === 0) && (
                <div className="flex justify-center mt-6">
                  <Button variant="ghost" size="sm" onClick={handleSkip}>
                    Skip (No Reference)
                  </Button>
                </div>
              )}

              {/* Staff Capture tool */}
              {isStaff && currentSign && (
                <div className="mt-6 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-center">
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
                    <p className="text-xs text-danger mt-2 font-medium">✗ Failed to capture (is hand in view?).</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tutorial Panel overlay (shown on each new sign) */}
      {showTutorialPanel && currentSign && (
        <TutorialPanel
          sign={currentSign}
          activeVariant={activeVariant}
          setActiveVariant={setActiveVariant}
          onClose={() => setShowTutorialPanel(false)}
          onStartPractice={handleStartPractice}
        />
      )}

      {/* Exit modal */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="Exit Lesson?" size="sm">
        <p className="text-text-muted text-sm mb-6">
          Your progress in this lesson will be lost.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowExitModal(false)}>Keep Learning</Button>
          <Button variant="danger" onClick={handleExit}>Exit</Button>
        </div>
      </Modal>

      {/* Score Overlay */}
      <ScoreOverlay
        score={overlayData?.score}
        rating={overlayData?.rating}
        xpEarned={overlayData?.xpEarned}
        isVisible={overlayVisible}
        onDismiss={handleOverlayDismiss}
      />

      {/* Streak notification */}
      {notification?.type === 'streak' && (
        <StreakNotification currentStreak={notification.currentStreak} isVisible={true} onDismiss={dismiss} />
      )}

      {/* Badge notification */}
      {notification?.type === 'badge' && (
        <BadgeNotification badge={notification.badge} isVisible={true} onDismiss={dismiss} />
      )}

      {/* XP Toast notification */}
      <XPToast
        amount={xpToastAmount}
        visible={xpToastVisible}
        onDone={() => setXpToastVisible(false)}
      />

      {/* Streak milestone celebration modal */}
      {milestoneCelebration && (
        <StreakMilestoneModal
          streak={milestoneCelebration.streak}
          milestone={milestoneCelebration.milestone}
          onDismiss={() => setMilestoneCelebration(null)}
        />
      )}
    </div>
  )
}
