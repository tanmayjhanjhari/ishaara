import { useRef, useCallback, useEffect } from 'react'
import {
  computeScore, smoothScores, normalizeReference, getRating, getVariantLandmarks,
  SCORE_THRESHOLD, SUCCESS_THRESHOLD, HOLD_DURATION_MS, SMOOTH_WINDOW
} from './scoring'
import { predictSign, isModelReady } from './onnxModel'

// Minimum ms between inference calls — prevents flooding the WASM runtime
const INFERENCE_INTERVAL_MS = 80

export function useSignScorer({
  sign,          // current sign object with reference_landmarks
  activeVariant = 'two',
  onScoreReady,  // callback: ({ score, is_success, rating }) => void
  onScoreUpdate  // callback: (smoothedScore) => void — for live meter
}) {
  const scoreWindowRef    = useRef([])
  const holdStartRef      = useRef(null)
  const referenceRef      = useRef(null)
  const isScoringRef      = useRef(false)  // prevent double-trigger
  const cooldownRef       = useRef(false)  // post-success cooldown
  const lastInferenceRef  = useRef(0)      // timestamp of last inference

  // Recompute reference vector when sign changes or variant toggles
  useEffect(() => {
    let ref = sign?.reference_landmarks
    if (sign && (sign.label === 'I' || sign.label === 'U' || sign.label === 'Z')) {
      ref = getVariantLandmarks(sign.label, activeVariant)
    }

    referenceRef.current  = ref
      ? normalizeReference(ref)
      : null
    scoreWindowRef.current = []
    holdStartRef.current   = null
    isScoringRef.current   = false
    cooldownRef.current    = false
    lastInferenceRef.current = 0
  }, [sign?.id, activeVariant])

  const processFrame = useCallback(async (userVector) => {
    // Post-success cooldown — don't score until user dismisses overlay
    if (cooldownRef.current) return

    // No hand detected — reset hold timer and report 0
    if (!userVector) {
      holdStartRef.current   = null
      scoreWindowRef.current = []
      onScoreUpdate?.(0)
      return
    }

    // Throttle inference — skip frame if last call was too recent
    const now = Date.now()
    if (now - lastInferenceRef.current < INFERENCE_INTERVAL_MS) return
    lastInferenceRef.current = now

    // Apply zero-padding to inactive hand indices if activeVariant is 'one'
    let processedVector = userVector
    if (activeVariant === 'one') {
      processedVector = new Float32Array(126)
      processedVector.set(userVector.subarray(0, 63), 0)
    }

    let score = 0

    const targetLabel = sign?.label?.toUpperCase()
    const isVariant = targetLabel === 'I' || targetLabel === 'U' || targetLabel === 'Z'
    const defaultForm = (targetLabel === 'I' || targetLabel === 'U') ? 'one' : 'two'
    const useONNX = isModelReady() && (!isVariant || activeVariant === defaultForm)

    if (useONNX) {
      try {
        const pred = await predictSign(processedVector)

        if (pred) {
          const predictedLabel = pred.label?.toUpperCase()

          console.log('[Scorer] Sign check:', predictedLabel,
                      '| Expected:', targetLabel,
                      '| Confidence:', pred.confidence.toFixed(3))

          if (predictedLabel === targetLabel) {
            // Correct sign — use model confidence as score (0–100)
            score = pred.score
          } else {
            // Wrong sign — small residual so meter isn't frozen at 0
            score = Math.max(0, Math.round((1 - pred.confidence) * 10))
          }
        }
      } catch (err) {
        console.error('[Scorer] Inference error:', err)
      }
    } else {
      // Model not yet loaded or using custom variant — fall back to geometric distance scoring
      console.log('[Scorer] Using geometric fallback for', targetLabel, '(variant form:', activeVariant, ')')
      if (referenceRef.current) {
        score = computeScore(processedVector, referenceRef.current)
      }
    }

    // Sliding-window smoothing
    scoreWindowRef.current.push(score)
    if (scoreWindowRef.current.length > SMOOTH_WINDOW) {
      scoreWindowRef.current.shift()
    }
    const smoothed = smoothScores(scoreWindowRef.current)

    // Push to live score meter
    onScoreUpdate?.(smoothed)

    // Hold detection — only trigger once per attempt
    if (smoothed >= SCORE_THRESHOLD) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now()
      }
      const elapsed = Date.now() - holdStartRef.current
      if (elapsed >= HOLD_DURATION_MS && !isScoringRef.current) {
        isScoringRef.current = true
        cooldownRef.current  = true

        const rating     = getRating(smoothed)
        const is_success = smoothed >= SUCCESS_THRESHOLD

        onScoreReady?.({ score: smoothed, is_success, rating })

        setTimeout(() => {
          scoreWindowRef.current   = []
          holdStartRef.current     = null
          isScoringRef.current     = false
          // keep cooldown=true on success (overlay handles reset via resetScorer)
          if (!is_success) cooldownRef.current = false
        }, 1500)
      }
    } else {
      holdStartRef.current = null
    }
  }, [sign?.label, activeVariant, onScoreReady, onScoreUpdate])  // eslint-disable-line react-hooks/exhaustive-deps

  const resetScorer = useCallback(() => {
    scoreWindowRef.current   = []
    holdStartRef.current     = null
    isScoringRef.current     = false
    cooldownRef.current      = false
    lastInferenceRef.current = 0
  }, [])

  return { processFrame, resetScorer }
}
