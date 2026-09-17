import { useRef, useCallback, useEffect } from 'react'
import {
  computeScore, smoothScores, normalizeReference, getRating, getVariantLandmarks,
  SMOOTH_WINDOW
} from './scoring'
import { predictSign, isModelReady, getLabelMap } from './onnxModel'

// Minimum ms between inference calls — prevents flooding the WASM runtime
const INFERENCE_INTERVAL_MS = 80

export function useSignScorer({
  sign,          // current sign object with reference_landmarks
  activeVariant = 'two',
  signType = 'static',
  onScoreReady,  // callback: ({ score, is_success, rating }) => void
  onScoreUpdate  // callback: (smoothedScore, aiLabel?) => void
}) {
  const scoreWindowRef   = useRef([])
  const holdStartRef     = useRef(null)
  const referenceRef     = useRef(null)
  const isScoringRef     = useRef(false)
  const cooldownRef      = useRef(false)
  const lastInferenceRef = useRef(0)

  // Dynamic thresholds based on sign type
  const isAlphabet = sign?.category === 'alphabet'
  const HOLD_MS       = isAlphabet ? 250 : 350
  const SCORE_THRESH  = isAlphabet ? 30  : 28
  const SUCCESS_THRESH = isAlphabet ? 48  : 42

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
    if (cooldownRef.current) return

    if (!window._scorerCount) window._scorerCount = 0
    window._scorerCount++
    const isFreq = window._scorerCount % 60 === 0

    if (isFreq) console.log('[Scorer] frame', window._scorerCount,
      'sign:', sign?.label, 'category:', sign?.category,
      'vector ok:', !!userVector && userVector.length === 126)

    // No hand detected — reset and push 0
    if (!userVector) {
      holdStartRef.current   = null
      scoreWindowRef.current = []
      onScoreUpdate?.(0, null)
      return
    }

    // Throttle to ~12fps max for WASM
    const now = Date.now()
    if (now - lastInferenceRef.current < INFERENCE_INTERVAL_MS) return
    lastInferenceRef.current = now

    // When activeVariant is 'one', zero-pad the right-hand slot
    let processedVector = userVector
    if (activeVariant === 'one') {
      processedVector = new Float32Array(126)
      processedVector.set(userVector.subarray(0, 63), 0)
    }

    let score    = 0
    let aiLabel  = null   // what the ONNX model predicts (alphabet only)

    const targetLabel = sign?.label?.toUpperCase()
    const isVariant   = targetLabel === 'I' || targetLabel === 'U' || targetLabel === 'Z'
    const defaultForm = (targetLabel === 'I' || targetLabel === 'U') ? 'one' : 'two'
    const modelReady  = isModelReady()
    const useONNX     = isAlphabet && modelReady && (!isVariant || activeVariant === defaultForm)

    let geomScore = 0
    if (referenceRef.current) {
      geomScore = computeScore(processedVector, referenceRef.current)
    }

    if (useONNX) {
      // ONNX classification path for alphabet signs
      const pred = await predictSign(processedVector)
      if (pred) {
        aiLabel = pred.label?.toUpperCase()
        
        // Check probability of target sign in full probability distribution
        let targetProb = 0
        const labelMap = getLabelMap()
        if (pred.allProbs && labelMap) {
          const targetEntry = Object.entries(labelMap).find(([, lbl]) => lbl.toUpperCase() === targetLabel)
          if (targetEntry) {
            targetProb = pred.allProbs[Number(targetEntry[0])] ?? 0
          }
        }

        let aiScore = 0
        if (aiLabel === targetLabel) {
          // Exact prediction match: reward generously even with mild lighting/camera variance
          aiScore = Math.min(100, Math.max(65, Math.round(pred.confidence * 85 + 22)))
        } else if (targetProb >= 0.15) {
          // Strong secondary probability in 26-class distribution
          aiScore = Math.min(85, Math.round(targetProb * 150))
        } else {
          // Minor residual for active hand motion
          aiScore = Math.max(0, Math.round((1 - pred.confidence) * 12))
        }

        // Blend with geometric match
        score = (aiLabel === targetLabel || targetProb >= 0.20)
          ? Math.max(aiScore, geomScore)
          : Math.max(aiScore, Math.round(geomScore * 0.90))

        if (isFreq) console.log('[Scorer] alphabet',
          'expected:', targetLabel,
          'got:', aiLabel,
          'conf:', pred.confidence.toFixed(3),
          'targetProb:', targetProb.toFixed(3),
          'aiScore:', aiScore,
          'geomScore:', geomScore,
          'finalScore:', score)
      } else {
        score = geomScore
      }
    } else if (referenceRef.current) {
      // Distance-based scoring for word signs or geometric fallback
      score = geomScore
      if (isFreq) console.log('[Scorer]', isAlphabet ? 'fallback' : 'word',
        sign?.label, 'geom score:', score)
    }

    // Sliding-window smoothing
    scoreWindowRef.current.push(score)
    if (scoreWindowRef.current.length > SMOOTH_WINDOW) scoreWindowRef.current.shift()
    const smoothed = smoothScores(scoreWindowRef.current)

    onScoreUpdate?.(smoothed, aiLabel)

    // Forgiving hold threshold so camera/lighting variations don't get stuck
    const threshold = SCORE_THRESH

    // Hold detection — fire once per attempt
    if (smoothed >= threshold) {
      if (!holdStartRef.current) holdStartRef.current = Date.now()
      const elapsed = Date.now() - holdStartRef.current
      if (isFreq) console.log('[Scorer] holding',
        elapsed, `ms / ${HOLD_MS}ms needed`)
      if (elapsed >= HOLD_MS && !isScoringRef.current) {
        isScoringRef.current = true
        cooldownRef.current  = true

        const rating     = getRating(smoothed)
        const is_success = smoothed >= SUCCESS_THRESH
        console.log('[Scorer] TRIGGERED score:', smoothed, 'is_success:', is_success)

        onScoreReady?.({ score: smoothed, is_success, rating })

        setTimeout(() => {
          scoreWindowRef.current   = []
          holdStartRef.current     = null
          isScoringRef.current     = false
          if (!is_success) cooldownRef.current = false
        }, 1200)
      }
    } else {
      holdStartRef.current = null
    }
  }, [sign?.label, activeVariant, signType, isAlphabet, onScoreReady, onScoreUpdate, SCORE_THRESH, SUCCESS_THRESH, HOLD_MS])  // eslint-disable-line react-hooks/exhaustive-deps

  const resetScorer = useCallback(() => {
    scoreWindowRef.current   = []
    holdStartRef.current     = null
    isScoringRef.current     = false
    cooldownRef.current      = false
    lastInferenceRef.current = 0
  }, [])

  return { processFrame, resetScorer }
}
