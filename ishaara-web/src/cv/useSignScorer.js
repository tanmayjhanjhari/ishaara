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
  signType = 'static',
  onScoreReady,  // callback: ({ score, is_success, rating }) => void
  onScoreUpdate  // callback: (smoothedScore) => void — for live meter
}) {
  const scoreWindowRef   = useRef([])
  const holdStartRef     = useRef(null)
  const referenceRef     = useRef(null)
  const isScoringRef     = useRef(false)   // prevent double-trigger
  const cooldownRef      = useRef(false)   // post-success cooldown
  const lastInferenceRef = useRef(0)       // timestamp of last inference

  // Recompute reference vector whenever sign or variant changes
  useEffect(() => {
    let ref = sign?.reference_landmarks
    if (sign && (sign.label === 'I' || sign.label === 'U' || sign.label === 'Z')) {
      ref = getVariantLandmarks(sign.label, activeVariant)
    }

    referenceRef.current   = ref ? normalizeReference(ref) : null
    scoreWindowRef.current = []
    holdStartRef.current   = null
    isScoringRef.current   = false
    cooldownRef.current    = false
    lastInferenceRef.current = 0
  }, [sign?.id, activeVariant])

  const processFrame = useCallback(async (userVector) => {
    if (signType === 'motion') return

    // Post-success cooldown — wait for overlay to dismiss via resetScorer()
    if (cooldownRef.current) return

    // No hand detected — reset hold timer, push 0 to meter
    if (!userVector) {
      holdStartRef.current   = null
      scoreWindowRef.current = []
      onScoreUpdate?.(0)
      return
    }

    // Throttle to ~12fps max to avoid flooding WASM
    const now = Date.now()
    if (now - lastInferenceRef.current < INFERENCE_INTERVAL_MS) return
    lastInferenceRef.current = now

    // When activeVariant is 'one', zero-pad the right-hand slot
    let processedVector = userVector
    if (activeVariant === 'one') {
      processedVector = new Float32Array(126)
      processedVector.set(userVector.subarray(0, 63), 0)
    }

    let score = 0

    const targetLabel = sign?.label?.toUpperCase()
    const isVariant   = targetLabel === 'I' || targetLabel === 'U' || targetLabel === 'Z'
    const defaultForm = (targetLabel === 'I' || targetLabel === 'U') ? 'one' : 'two'
    const isAlphabet  = sign?.category === 'alphabet'
    const modelReady  = isModelReady()
    // Use ONNX for alphabet signs when: model is loaded AND (not a variant OR in the variant's default form)
    const useONNX     = isAlphabet && modelReady && (!isVariant || activeVariant === defaultForm)

    if (useONNX) {
      // ── ONNX classification path (alphabet signs) ──────────────────────────
      const pred = await predictSign(processedVector)
      if (pred) {
        if (pred.label?.toUpperCase() === targetLabel) {
          score = pred.score
        } else {
          // Wrong sign — small non-zero residual so the meter visibly moves
          score = Math.max(0, Math.round((1 - pred.confidence) * 15))
        }
      }
    } else if (!isAlphabet && referenceRef.current) {
      // ── Distance-based scoring for word signs ──────────────────────────────
      score = computeScore(processedVector, referenceRef.current)
    } else if (isAlphabet && !modelReady && referenceRef.current) {
      // ── Alphabet geometric fallback until ONNX model loads ─────────────────
      score = computeScore(processedVector, referenceRef.current)
    } else if (isVariant && activeVariant !== defaultForm && referenceRef.current) {
      // ── Variant alternate-form geometric fallback ──────────────────────────
      score = computeScore(processedVector, referenceRef.current)
    }
    // else: no scoring path available → score stays 0

    // Sliding-window smoothing
    scoreWindowRef.current.push(score)
    if (scoreWindowRef.current.length > SMOOTH_WINDOW) scoreWindowRef.current.shift()
    const smoothed = smoothScores(scoreWindowRef.current)

    onScoreUpdate?.(smoothed)

    // Slightly higher threshold for commonly confused signs
    const STRICT_SIGNS = ['M', 'N', 'A', 'S', 'T']
    const threshold    = STRICT_SIGNS.includes(targetLabel) ? 55 : SCORE_THRESHOLD

    // Hold detection — fire once per attempt after holding threshold for HOLD_DURATION_MS
    if (smoothed >= threshold) {
      if (!holdStartRef.current) holdStartRef.current = Date.now()
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
          if (!is_success) cooldownRef.current = false
        }, 1500)
      }
    } else {
      holdStartRef.current = null
    }
  }, [sign?.label, activeVariant, signType, onScoreReady, onScoreUpdate])  // eslint-disable-line react-hooks/exhaustive-deps

  const resetScorer = useCallback(() => {
    scoreWindowRef.current   = []
    holdStartRef.current     = null
    isScoringRef.current     = false
    cooldownRef.current      = false
    lastInferenceRef.current = 0
  }, [])

  return { processFrame, resetScorer }
}
