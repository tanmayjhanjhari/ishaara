import { useRef, useCallback, useEffect } from 'react'
import {
  computeScore, smoothScores, normalizeReference, getRating, getVariantLandmarks,
  SMOOTH_WINDOW
} from './scoring'
import { predictSign, isModelReady, getLabelMap } from './onnxModel'
import { REFERENCE_LANDMARKS } from '../data/referenceLandmarks'

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
  const isAlphabet = sign?.category === 'alphabet' || (!sign?.category && sign?.label?.length === 1)
  const HOLD_MS       = isAlphabet ? 250 : 350
  const SUCCESS_THRESH = 75 // Strictly 75% required to move to next sign across all lessons

  // Recompute reference vector whenever sign or variant changes
  useEffect(() => {
    let ref = sign?.reference_landmarks
    const label = sign?.label?.toUpperCase()

    if (sign && (label === 'I' || label === 'U' || label === 'Z')) {
      ref = getVariantLandmarks(sign.label, activeVariant)
    } else if (!ref && label && REFERENCE_LANDMARKS[label]) {
      ref = REFERENCE_LANDMARKS[label]
    }

    referenceRef.current   = ref ? normalizeReference(ref) : null
    scoreWindowRef.current = []
    holdStartRef.current   = null
    isScoringRef.current   = false
    cooldownRef.current    = false
    lastInferenceRef.current = 0
  }, [sign?.id, sign?.label, sign?.reference_landmarks, activeVariant])

  const processFrame = useCallback(async (userVector) => {
    if (cooldownRef.current) return

    // For motion signs, provide live visual feedback on the meter when hands are tracked
    if (signType === 'motion') {
      if (!userVector) {
        onScoreUpdate?.(0, null)
      } else {
        onScoreUpdate?.(65, null)
      }
      return
    }

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

    // Detect active hands in user's captured vector
    let userLeftActive = false, userRightActive = false
    for (let i = 0; i < 63; i++)  if (processedVector[i] !== 0) { userLeftActive  = true; break }
    for (let i = 63; i < 126; i++) if (processedVector[i] !== 0) { userRightActive = true; break }
    const userHands = (userLeftActive ? 1 : 0) + (userRightActive ? 1 : 0)

    // Fallback if referenceRef is not yet initialized
    if (!referenceRef.current && targetLabel && REFERENCE_LANDMARKS[targetLabel]) {
      referenceRef.current = normalizeReference(REFERENCE_LANDMARKS[targetLabel])
    }

    // Detect reference hands requirement
    let refLeftActive = false, refRightActive = false
    if (referenceRef.current) {
      for (let i = 0; i < 63; i++)  if (referenceRef.current[i] !== 0) { refLeftActive  = true; break }
      for (let i = 63; i < 126; i++) if (referenceRef.current[i] !== 0) { refRightActive = true; break }
    }
    const refHands = (refLeftActive ? 1 : 0) + (refRightActive ? 1 : 0)
    const requiresTwoHands = refHands >= 2

    let geomScore = 0
    if (referenceRef.current) {
      geomScore = computeScore(processedVector, referenceRef.current)
    }

    // 1. STRICT HAND COUNT GATING:
    // If the sign requires two hands (like Letter H) but user only shows 1 hand,
    // the sign cannot pass. Cap at 15% and do not allow ONNX hallucination to pass.
    if (requiresTwoHands && userHands < 2) {
      score = 15
      if (isFreq) console.log('[Scorer] Two hands required for', targetLabel, 'but user has 1 hand.')
    } else if (useONNX) {
      // 2. ONNX CLASSIFICATION PATH (Alphabet only)
      // Only run inference and consider predictions if hand count is satisfied.
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

        // PHYSICAL SKELETON GATE:
        // Only allow ONNX to confirm and boost the sign if the physical hand landmarks
        // are already in plausible alignment (geomScore >= 50).
        // If someone shows a random open palm (where geomScore is < 45),
        // ONNX predictions are out-of-distribution hallucinations and MUST NOT award points!
        if (geomScore >= 50) {
          let aiScore = 0
          if (aiLabel === targetLabel) {
            // Exact prediction match confirmed by physical skeleton: reward cleanly
            aiScore = Math.min(100, Math.max(78, Math.round(geomScore * 0.5 + pred.confidence * 35 + 20)))
          } else if (targetProb >= 0.20) {
            // Strong secondary probability confirmed by physical skeleton
            aiScore = Math.min(82, Math.round(geomScore * 0.6 + targetProb * 40))
          } else {
            aiScore = geomScore
          }
          score = Math.max(aiScore, geomScore)
        } else {
          // Hand shape/fingers do not match reference (e.g. open palm on Letter I or H)
          // Rely strictly on geomScore (penalized to <= 15-30%)
          score = geomScore
        }

        if (isFreq) console.log('[Scorer] alphabet',
          'expected:', targetLabel,
          'got:', aiLabel,
          'conf:', pred.confidence.toFixed(3),
          'targetProb:', targetProb.toFixed(3),
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

    // Hold detection
    // Case A: Passed threshold (>= 75%) held for HOLD_MS -> Success!
    if (smoothed >= SUCCESS_THRESH) {
      if (!holdStartRef.current) holdStartRef.current = Date.now()
      const elapsed = Date.now() - holdStartRef.current
      if (isFreq) console.log('[Scorer] holding success',
        elapsed, `ms / ${HOLD_MS}ms needed`)
      if (elapsed >= HOLD_MS && !isScoringRef.current) {
        isScoringRef.current = true
        cooldownRef.current  = true

        const rating     = getRating(smoothed)
        const is_success = true
        console.log('[Scorer] SUCCESS TRIGGERED score:', smoothed)

        onScoreReady?.({ score: smoothed, is_success, rating })

        setTimeout(() => {
          scoreWindowRef.current   = []
          holdStartRef.current     = null
          isScoringRef.current     = false
        }, 1200)
      }
    } else if (smoothed >= 35) {
      // Case B: Incomplete hold (35 - 74%) held for extended duration (2000ms)
      if (!holdStartRef.current) holdStartRef.current = Date.now()
      const elapsed = Date.now() - holdStartRef.current
      if (elapsed >= 2000 && !isScoringRef.current) {
        isScoringRef.current = true
        cooldownRef.current  = true

        const rating     = getRating(smoothed)
        const is_success = false
        console.log('[Scorer] SUB-THRESHOLD TRIGGERED score:', smoothed, '(needs 75% to pass)')

        onScoreReady?.({ score: smoothed, is_success, rating })

        setTimeout(() => {
          scoreWindowRef.current   = []
          holdStartRef.current     = null
          isScoringRef.current     = false
          cooldownRef.current      = false
        }, 1200)
      }
    } else {
      holdStartRef.current = null
    }
  }, [sign?.label, activeVariant, signType, isAlphabet, onScoreReady, onScoreUpdate, SUCCESS_THRESH, HOLD_MS])  // eslint-disable-line react-hooks/exhaustive-deps

  const resetScorer = useCallback(() => {
    scoreWindowRef.current   = []
    holdStartRef.current     = null
    isScoringRef.current     = false
    cooldownRef.current      = false
    lastInferenceRef.current = 0
  }, [])

  return { processFrame, resetScorer }
}
