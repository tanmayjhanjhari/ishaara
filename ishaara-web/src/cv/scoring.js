import { normalizeLandmarks } from './normalize'

// Tunable constants
export const SCORE_THRESHOLD  = 50   // minimum score to count as holding
export const SUCCESS_THRESHOLD = 70  // minimum score to count as success
export const HOLD_DURATION_MS  = 500 // ms to hold sign before trigger
export const SMOOTH_WINDOW     = 10  // frames to smooth over
export const DISTANCE_SCALE    = 200 // maps distance to score

export function computeScore(userVector, referenceVector) {
  // Both inputs: Float32Array of 126 values (normalized)
  // Returns: number 0-100

  if (!userVector || !referenceVector) return 0
  if (userVector.length !== 126 || referenceVector.length !== 126) return 0

  let totalDistance = 0
  const numLandmarks = 42

  for (let i = 0; i < numLandmarks; i++) {
    const idx = i * 3
    const dx  = userVector[idx]     - referenceVector[idx]
    const dy  = userVector[idx + 1] - referenceVector[idx + 1]
    const dz  = userVector[idx + 2] - referenceVector[idx + 2]
    totalDistance += Math.sqrt(dx*dx + dy*dy + dz*dz)
  }

  const meanDistance = totalDistance / numLandmarks
  const score = Math.max(0, 100 - (meanDistance * DISTANCE_SCALE))
  return Math.round(score)
}

export function getRating(score) {
  if (score >= 90) return { label: 'Perfect! ✦', color: '#4f46e5', key: 'perfect' }
  if (score >= 70) return { label: 'Great!',     color: '#10b981', key: 'great'   }
  if (score >= 50) return { label: 'Good',        color: '#f59e0b', key: 'good'    }
  return                  { label: 'Try Again',   color: '#ef4444', key: 'fail'    }
}

export function computeXP(score, baseXP) {
  if (score < SUCCESS_THRESHOLD) return 0
  return Math.round(baseXP * (score / 100))
}

export function smoothScores(window) {
  if (!window.length) return 0
  return Math.round(window.reduce((a, b) => a + b, 0) / window.length)
}

export function normalizeReference(referenceLandmarks) {
  if (!referenceLandmarks) return null

  // Legacy single hand array of 21 landmarks
  if (Array.isArray(referenceLandmarks)) {
    if (referenceLandmarks.length === 21) {
      const leftVector = new Float32Array(63)
      const rightVector = normalizeLandmarks(referenceLandmarks)
      
      const combined = new Float32Array(126)
      combined.set(leftVector, 0)
      combined.set(rightVector, 63)
      return combined
    }
    return null
  }

  // Two hands object { left_hand, right_hand }
  const leftHand = referenceLandmarks.left_hand || null
  const rightHand = referenceLandmarks.right_hand || null

  const leftVector = leftHand && leftHand.length === 21
    ? normalizeLandmarks(leftHand)
    : new Float32Array(63)

  const rightVector = rightHand && rightHand.length === 21
    ? normalizeLandmarks(rightHand)
    : new Float32Array(63)

  const combined = new Float32Array(126)
  combined.set(leftVector, 0)
  combined.set(rightVector, 63)
  return combined
}
