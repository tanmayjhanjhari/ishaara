import { normalizeLandmarks } from './normalize'
import { REFERENCE_LANDMARKS } from '../data/referenceLandmarks'

// Tunable constants
export const SCORE_THRESHOLD  = 35   // minimum score to count as holding
export const SUCCESS_THRESHOLD = 55  // minimum score to count as success
export const HOLD_DURATION_MS  = 350 // ms to hold sign before trigger
export const SMOOTH_WINDOW     = 8   // frames to smooth over
export const DISTANCE_SCALE    = 200 // maps distance to score

/**
 * Synthesizes reference landmarks for letters I, U, and Z based on active variant form.
 */
export function getVariantLandmarks(letter, variantType) {
  const defaultRef = REFERENCE_LANDMARKS[letter]
  if (!defaultRef) return null

  if (letter === 'I') {
    if (variantType === 'one') {
      return defaultRef
    }
    if (variantType === 'two') {
      // Synthesize from E (which is two-handed: left hand flat, right hand pointing index)
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(eRef.left_hand))
      const right = JSON.parse(JSON.stringify(eRef.right_hand))
      
      // Calculate offset: middle finger tip (index 12) - index finger tip (index 8)
      const offset = {
        x: left[12].x - left[8].x,
        y: left[12].y - left[8].y,
        z: left[12].z - left[8].z
      }
      
      // Translate right hand (pointing finger) to touch the middle finger tip
      right.forEach(p => {
        p.x += offset.x
        p.y += offset.y
        p.z += offset.z
      })
      
      return {
        letter: 'I',
        uses_two_hands: true,
        left_hand: left,
        right_hand: right
      }
    }
  }

  if (letter === 'U') {
    if (variantType === 'one') {
      return defaultRef
    }
    if (variantType === 'two') {
      // Synthesize from E (which is two-handed)
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(eRef.left_hand))
      const right = JSON.parse(JSON.stringify(eRef.right_hand))
      
      // Calculate offset: pinky finger tip (index 20) - index finger tip (index 8)
      const offset = {
        x: left[20].x - left[8].x,
        y: left[20].y - left[8].y,
        z: left[20].z - left[8].z
      }
      
      // Translate right hand to touch the pinky finger tip
      right.forEach(p => {
        p.x += offset.x
        p.y += offset.y
        p.z += offset.z
      })
      
      return {
        letter: 'U',
        uses_two_hands: true,
        left_hand: left,
        right_hand: right
      }
    }
  }

  if (letter === 'Z') {
    if (variantType === 'two') {
      return defaultRef
    }
    if (variantType === 'one') {
      // Synthesize from E's dominant hand (right_hand) copied to left_hand (one-handed pointing)
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(eRef.right_hand))
      return {
        letter: 'Z',
        uses_two_hands: false,
        left_hand: left,
        right_hand: null
      }
    }
  }

  return defaultRef
}

export function computeScore(userVector, referenceVector) {
  // Both inputs: Float32Array of 126 values (normalized)
  // Returns: number 0-100

  if (!userVector || !referenceVector) return 0
  if (userVector.length !== 126 || referenceVector.length !== 126) return 0

  // Check if reference is two-handed (i.e. has any non-zero values in right hand landmarks)
  let isTwoHanded = false
  for (let i = 63; i < 126; i++) {
    if (referenceVector[i] !== 0) {
      isTwoHanded = true
      break
    }
  }

  let totalDistance = 0
  const numLandmarks = isTwoHanded ? 42 : 21

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
