import { useRef, useCallback, useEffect } from 'react'
import {
  computeScore, smoothScores, normalizeReference, getRating,
  SCORE_THRESHOLD, HOLD_DURATION_MS, SMOOTH_WINDOW
} from './scoring'
import { predictSign, isModelReady } from './onnxModel'

export function useSignScorer({
  sign,          // current sign object with reference_landmarks
  onScoreReady,  // callback: ({ score, is_success, rating }) => void
  onScoreUpdate  // callback: (smoothedScore) => void — for live meter
}) {
  const scoreWindowRef   = useRef([])
  const holdStartRef     = useRef(null)
  const referenceRef     = useRef(null)
  const isScoringRef     = useRef(false) // prevent double-trigger
  const cooldownRef      = useRef(false) // post-trigger cooldown
  const isInferenceRunningRef = useRef(false) // prevent concurrent inferences

  // Recompute reference when sign changes
  useEffect(() => {
    referenceRef.current  = sign?.reference_landmarks
      ? normalizeReference(sign.reference_landmarks)
      : null
    scoreWindowRef.current = []
    holdStartRef.current   = null
    isScoringRef.current   = false
    cooldownRef.current    = false
    isInferenceRunningRef.current = false
  }, [sign?.id])

  const processFrame = useCallback(async (userVector) => {
    if (cooldownRef.current) return
    if (isInferenceRunningRef.current) return

    if (!userVector) {
      // No hand detected — reset hold
      holdStartRef.current = null
      scoreWindowRef.current = []
      onScoreUpdate?.(0)
      return
    }

    isInferenceRunningRef.current = true
    try {
      let score = 0
      
      if (isModelReady()) {
        const pred = await predictSign(userVector)
        if (pred) {
          const targetLabel = sign?.label?.toUpperCase()
          const predictedLabel = pred.label?.toUpperCase()

          if (predictedLabel === targetLabel) {
            // Correct sign matched! Use model confidence score (0-100)
            score = pred.score
          } else {
            // Incorrect sign shape!
            score = 0
          }
        }
      } else {
        // Fallback to geometric distance if model is not loaded yet
        if (referenceRef.current) {
          score = computeScore(userVector, referenceRef.current)
        }
      }

      // Update sliding window
      scoreWindowRef.current.push(score)
      if (scoreWindowRef.current.length > SMOOTH_WINDOW) {
        scoreWindowRef.current.shift()
      }
      const smoothed = smoothScores(scoreWindowRef.current)

      // Notify live meter
      onScoreUpdate?.(smoothed)

      // Hold detection
      if (smoothed >= SCORE_THRESHOLD) {
        if (!holdStartRef.current) {
          holdStartRef.current = Date.now()
        }
        const elapsed = Date.now() - holdStartRef.current
        if (elapsed >= HOLD_DURATION_MS && !isScoringRef.current) {
          isScoringRef.current = true
          cooldownRef.current  = true

          const rating = getRating(smoothed)
          const is_success = smoothed >= 70

          onScoreReady?.({
            score:      smoothed,
            is_success,
            rating
          })

          // Reset after cooldown (allow retry)
          setTimeout(() => {
            scoreWindowRef.current = []
            holdStartRef.current   = null
            isScoringRef.current   = false
            cooldownRef.current    = is_success  // keep cooldown if success
            if (!is_success) cooldownRef.current = false
          }, 1500)
        }
      } else {
        holdStartRef.current = null
      }
    } catch (err) {
      console.error('[Scorer] Inference error:', err)
    } finally {
      isInferenceRunningRef.current = false
    }
  }, [sign, onScoreReady, onScoreUpdate])

  // Reset on sign change
  const resetScorer = useCallback(() => {
    scoreWindowRef.current = []
    holdStartRef.current   = null
    isScoringRef.current   = false
    cooldownRef.current    = false
    isInferenceRunningRef.current = false
  }, [])

  return { processFrame, resetScorer }
}
