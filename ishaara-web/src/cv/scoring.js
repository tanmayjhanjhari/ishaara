import { normalizeLandmarks } from './normalize.js'
import { REFERENCE_LANDMARKS } from '../data/referenceLandmarks.js'

// Tunable constants (used by useSignScorer for backwards compat)
export const SCORE_THRESHOLD  = 30   // minimum score to count as holding
export const SUCCESS_THRESHOLD = 75  // minimum 75% required to move to next sign across all lessons
export const HOLD_DURATION_MS  = 300 // ms to hold sign before trigger
export const SMOOTH_WINDOW     = 6   // frames to smooth over (responsive, low latency)
export const DISTANCE_SCALE    = 42  // calibrated for real webcam hand positions (75%+ achievable on correct poses)

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
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(eRef.left_hand))
      const right = JSON.parse(JSON.stringify(eRef.right_hand))
      
      const offset = {
        x: left[12].x - left[8].x,
        y: left[12].y - left[8].y,
        z: left[12].z - left[8].z
      }
      right.forEach(p => {
        p.x += offset.x
        p.y += offset.y
        p.z += offset.z
      })
      return { letter: 'I', uses_two_hands: true, left_hand: left, right_hand: right }
    }
  }

  if (letter === 'U') {
    if (variantType === 'one') {
      return defaultRef
    }
    if (variantType === 'two') {
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(eRef.left_hand))
      const right = JSON.parse(JSON.stringify(eRef.right_hand))
      
      const offset = {
        x: left[20].x - left[8].x,
        y: left[20].y - left[8].y,
        z: left[20].z - left[8].z
      }
      right.forEach(p => {
        p.x += offset.x
        p.y += offset.y
        p.z += offset.z
      })
      return { letter: 'U', uses_two_hands: true, left_hand: left, right_hand: right }
    }
  }

  if (letter === 'Z') {
    if (variantType === 'two') {
      return defaultRef
    }
    if (variantType === 'one') {
      const vRef = REFERENCE_LANDMARKS['V']
      if (!vRef) return defaultRef
      
      const left = JSON.parse(JSON.stringify(vRef.left_hand))
      const right = JSON.parse(JSON.stringify(vRef.right_hand))
      return { letter: 'Z', uses_two_hands: false, left_hand: left, right_hand: right }
    }
  }

  return defaultRef
}

/**
 * Compute geometric similarity score between user vector and reference vector.
 * Both are Float32Array[126] (left63 + right63, normalized).
 *
 * Smart logic:
 *   - Supports mirrored / swapped hand orientations (matches whichever hand mapping is closer).
 *   - If user has one hand visible, compares against the closest active reference hand.
 *   - Calibrated distance scaling so natural webcam angles produce responsive 50–90+ scores.
 *
 * Returns: 0–100
 */
export function computeScore(userVector, referenceVector) {
  if (!userVector || !referenceVector) return 0
  if (userVector.length !== 126 || referenceVector.length !== 126) return 0

  // Detect which hands are active in user vector
  let userLeftActive = false, userRightActive = false
  for (let i = 0; i < 63; i++)  if (userVector[i] !== 0) { userLeftActive  = true; break }
  for (let i = 63; i < 126; i++) if (userVector[i] !== 0) { userRightActive = true; break }

  // Detect which hands are active in reference vector
  let refLeftActive = false, refRightActive = false
  for (let i = 0; i < 63; i++)  if (referenceVector[i] !== 0) { refLeftActive  = true; break }
  for (let i = 63; i < 126; i++) if (referenceVector[i] !== 0) { refRightActive = true; break }

  const userHands = (userLeftActive ? 1 : 0) + (userRightActive ? 1 : 0)
  const refHands  = (refLeftActive  ? 1 : 0) + (refRightActive  ? 1 : 0)

  // Helper: mean Euclidean distance between two 63-value half-vectors (21 landmarks × 3)
  function handDist(a, aStart, b, bStart) {
    let total = 0
    for (let i = 0; i < 21; i++) {
      const ai = aStart + i * 3
      const bi = bStart + i * 3
      const dx = a[ai] - b[bi]
      const dy = a[ai+1] - b[bi+1]
      const dz = a[ai+2] - b[bi+2]
      total += Math.sqrt(dx*dx + dy*dy + dz*dz)
    }
    return total / 21
  }

  let bestDist = Infinity

  if (userHands >= 2 && refHands >= 2) {
    // Both two-handed: test both direct (L->L, R->R) and swapped (L->R, R->L)
    const dDirect = (handDist(userVector, 0, referenceVector, 0) + handDist(userVector, 63, referenceVector, 63)) / 2
    const dSwap   = (handDist(userVector, 0, referenceVector, 63) + handDist(userVector, 63, referenceVector, 0)) / 2
    const twoHandMatch = Math.min(dDirect, dSwap)

    // Also test best single-hand match (in case one hand in dataset or user is resting on desk)
    const dL0 = handDist(userVector, 0, referenceVector, 0)
    const dL1 = handDist(userVector, 0, referenceVector, 63)
    const dR0 = handDist(userVector, 63, referenceVector, 0)
    const dR1 = handDist(userVector, 63, referenceVector, 63)
    const bestSingle = Math.min(dL0, dL1, dR0, dR1)

    // Allow single hand match with minor margin if one hand is resting
    bestDist = Math.min(twoHandMatch, bestSingle + 0.12)
  } else if (userHands >= 2 && refHands === 1) {
    // User has 2 hands, reference has 1: find best single-hand match
    const targetRefStart = refLeftActive ? 0 : 63
    const dL = handDist(userVector, 0, referenceVector, targetRefStart)
    const dR = handDist(userVector, 63, referenceVector, targetRefStart)
    bestDist = Math.min(dL, dR)
  } else {
    // User has 1 hand: compare user active hand against both reference hands
    const userStart = userLeftActive ? 0 : (userRightActive ? 63 : null)
    if (userStart === null) return 0

    if (refLeftActive) {
      const d = handDist(userVector, userStart, referenceVector, 0)
      if (d < bestDist) bestDist = d
    }
    if (refRightActive) {
      const d = handDist(userVector, userStart, referenceVector, 63)
      if (d < bestDist) bestDist = d
    }
  }

  if (bestDist === Infinity) return 0

  const score = Math.max(0, Math.min(100, Math.round(100 - bestDist * DISTANCE_SCALE)))
  return score
}


export function getRating(score) {
  if (score >= 90) return { label: 'Perfect! ✦',            color: '#818cf8', key: 'perfect' }
  if (score >= 75) return { label: 'Great!',                color: '#10b981', key: 'great'   }
  if (score >= 60) return { label: 'Almost! (75% needed)',  color: '#f59e0b', key: 'almost'  }
  return                  { label: 'Try Again',              color: '#ef4444', key: 'fail'    }
}

export function computeXP(score, baseXP) {
  if (score < SUCCESS_THRESHOLD) return 0
  return Math.round(baseXP * (score / 100))
}

export function smoothScores(window) {
  if (!window.length) return 0
  return Math.round(window.reduce((a, b) => a + b, 0) / window.length)
}

/**
 * Convert a stored reference_landmarks value (from DB/API) to a Float32Array[126].
 *
 * Handles all formats:
 *   - { left_hand: [{x,y,z}×21], right_hand: [{x,y,z}×21] }  ← alphabet + word signs
 *   - [ {x,y,z} × 21 ]                                         ← legacy single-hand
 *   - [ [x,y,z] × 21 ]                                         ← array-of-arrays (word v2)
 */
export function normalizeReference(referenceLandmarks) {
  if (!referenceLandmarks) return null

  // Helper: convert one hand (21 landmarks) to a normalized Float32Array[63]
  // Accepts both [{x,y,z}] and [[x,y,z]] formats
  function toVector(hand21) {
    if (!hand21 || hand21.length !== 21) return new Float32Array(63)

    // Normalise format: [{x,y,z}] or [[x,y,z]]
    const lms = hand21.map(lm => {
      if (Array.isArray(lm)) return { x: lm[0] ?? 0, y: lm[1] ?? 0, z: lm[2] ?? 0 }
      return { x: lm.x ?? 0, y: lm.y ?? 0, z: lm.z ?? 0 }
    })

    // Check wrist is non-zero (if all landmarks all-zero, skip)
    if (lms.every(l => l.x === 0 && l.y === 0)) return new Float32Array(63)

    return normalizeLandmarks(lms) || new Float32Array(63)
  }

  // Format: { left_hand, right_hand }
  if (referenceLandmarks.left_hand !== undefined || referenceLandmarks.right_hand !== undefined) {
    let lh = referenceLandmarks.left_hand
    let rh = referenceLandmarks.right_hand

    // Detect and discard resting lap hand from dataset (wrist y > 0.38 while signing hand wrist y < 0.30)
    if (Array.isArray(lh) && Array.isArray(rh) && lh.length === 21 && rh.length === 21) {
      const ly = (Array.isArray(lh[0]) ? lh[0][1] : lh[0]?.y) ?? 0
      const ry = (Array.isArray(rh[0]) ? rh[0][1] : rh[0]?.y) ?? 0
      if (ly > 0.38 && ry < 0.30) {
        lh = null  // Left hand was resting in lap
      } else if (ry > 0.38 && ly < 0.30) {
        rh = null  // Right hand was resting in lap
      }
    }

    const leftVector  = toVector(lh)
    const rightVector = toVector(rh)
    const combined = new Float32Array(126)
    combined.set(leftVector,  0)
    combined.set(rightVector, 63)
    return combined
  }

  // Format: flat array of 21 landmarks (legacy single-hand or array-of-arrays)
  if (Array.isArray(referenceLandmarks)) {
    if (referenceLandmarks.length === 21) {
      // Put single hand in left slot (matches useMediaPipe single-hand mapping)
      const vec     = toVector(referenceLandmarks)
      const combined = new Float32Array(126)
      combined.set(vec, 0)
      return combined
    }
    return null
  }

  return null
}
