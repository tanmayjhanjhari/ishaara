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
export const AUTHENTIC_ISL_I_ONE_HAND = {
  letter: 'I',
  uses_two_hands: false,
  left_hand: [
    { x: 0.50, y: 0.70, z: 0.00 }, // 0: wrist
    { x: 0.46, y: 0.65, z: -0.01 }, // 1: thumb CMC
    { x: 0.44, y: 0.60, z: -0.02 }, // 2: thumb MCP
    { x: 0.46, y: 0.56, z: -0.03 }, // 3: thumb IP
    { x: 0.49, y: 0.55, z: -0.04 }, // 4: thumb tip (curled)
    { x: 0.45, y: 0.52, z: -0.01 }, // 5: index MCP
    { x: 0.45, y: 0.44, z: -0.02 }, // 6: index PIP
    { x: 0.46, y: 0.50, z: -0.04 }, // 7: index DIP
    { x: 0.46, y: 0.55, z: -0.04 }, // 8: index tip (curled)
    { x: 0.50, y: 0.51, z: 0.00 },  // 9: middle MCP
    { x: 0.50, y: 0.43, z: -0.01 }, // 10: middle PIP
    { x: 0.50, y: 0.50, z: -0.03 }, // 11: middle DIP
    { x: 0.50, y: 0.55, z: -0.03 }, // 12: middle tip (curled)
    { x: 0.55, y: 0.52, z: 0.01 },  // 13: ring MCP
    { x: 0.55, y: 0.44, z: 0.00 },  // 14: ring PIP
    { x: 0.54, y: 0.51, z: -0.02 }, // 15: ring DIP
    { x: 0.54, y: 0.56, z: -0.02 }, // 16: ring tip (curled)
    { x: 0.60, y: 0.54, z: 0.02 },  // 17: pinky MCP
    { x: 0.61, y: 0.45, z: 0.01 },  // 18: pinky PIP
    { x: 0.62, y: 0.38, z: 0.00 },  // 19: pinky DIP
    { x: 0.63, y: 0.30, z: -0.01 }, // 20: pinky tip (EXTENDED UP)
  ],
  right_hand: null
}

/**
 * Extract 5 finger extension booleans [thumb, index, middle, ring, pinky]
 * from a 63-value normalized vector (21 landmarks x 3) starting at offset.
 */
export function getFingerStatesFromNorm(vec, offset = 0) {
  if (!vec || vec.length < offset + 63) return [false, false, false, false, false]
  
  const pDist = (idx) => {
    const x = vec[offset + idx * 3]
    const y = vec[offset + idx * 3 + 1]
    const z = vec[offset + idx * 3 + 2]
    return Math.sqrt(x*x + y*y + z*z)
  }

  // Thumb: tip (4) distance to pinky MCP (17)
  const p4x = vec[offset + 4*3], p4y = vec[offset + 4*3+1], p4z = vec[offset + 4*3+2]
  const p17x = vec[offset + 17*3], p17y = vec[offset + 17*3+1], p17z = vec[offset + 17*3+2]
  const thumbDist = Math.sqrt((p4x-p17x)**2 + (p4y-p17y)**2 + (p4z-p17z)**2)
  const thumbExt = thumbDist > 1.22

  // 4 fingers: tip distance to wrist vs PIP distance to wrist
  const indexExt  = pDist(8)  > pDist(6)  * 1.10
  const middleExt = pDist(12) > pDist(10) * 1.10
  const ringExt   = pDist(16) > pDist(14) * 1.10
  const pinkyExt  = pDist(20) > pDist(18) * 1.10

  return [thumbExt, indexExt, middleExt, ringExt, pinkyExt]
}

/**
 * Compare finger extension states between two 63-value hands.
 * Returns ratio from 0.0 (all 5 wrong) to 1.0 (all 5 match).
 */
export function computeFingerMatch(vecA, offsetA, vecB, offsetB) {
  const fA = getFingerStatesFromNorm(vecA, offsetA)
  const fB = getFingerStatesFromNorm(vecB, offsetB)
  let match = 0
  for (let i = 0; i < 5; i++) {
    if (fA[i] === fB[i]) match++
  }
  return match / 5
}

/**
 * Synthesizes reference landmarks for letters I, U, and Z based on active variant form.
 */
export function getVariantLandmarks(letter, variantType) {
  const defaultRef = REFERENCE_LANDMARKS[letter]

  if (letter === 'I') {
    if (variantType === 'one' || !variantType) {
      return AUTHENTIC_ISL_I_ONE_HAND
    }
    if (variantType === 'two') {
      const eRef = REFERENCE_LANDMARKS['E']
      if (!eRef) return AUTHENTIC_ISL_I_ONE_HAND
      
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
 * Rigorous logic:
 *   - Strict hand count enforcement: Two-handed signs REQUIRE two hands! (capped at 15% if 1 hand)
 *   - Landmark finger mapping: User fingers must match reference finger extension states.
 *   - Calibrated Euclidean distance scaling with finger consistency penalty.
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

  // 1. STRICT HAND COUNT ENFORCEMENT:
  // If the reference sign requires two hands, but user only shows 1 hand:
  // The sign is fundamentally incomplete. Maximum score is strictly capped at 15%.
  if (refHands >= 2 && userHands < 2) {
    return 15
  }

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
  let bestFingerMatch = 0

  if (userHands >= 2 && refHands >= 2) {
    // Both two-handed: test both direct (L->L, R->R) and swapped (L->R, R->L)
    const dDirect = (handDist(userVector, 0, referenceVector, 0) + handDist(userVector, 63, referenceVector, 63)) / 2
    const dSwap   = (handDist(userVector, 0, referenceVector, 63) + handDist(userVector, 63, referenceVector, 0)) / 2

    const fDirect = (computeFingerMatch(userVector, 0, referenceVector, 0) + computeFingerMatch(userVector, 63, referenceVector, 63)) / 2
    const fSwap   = (computeFingerMatch(userVector, 0, referenceVector, 63) + computeFingerMatch(userVector, 63, referenceVector, 0)) / 2

    if (dDirect <= dSwap) {
      bestDist = dDirect
      bestFingerMatch = fDirect
    } else {
      bestDist = dSwap
      bestFingerMatch = fSwap
    }
  } else if (userHands >= 2 && refHands === 1) {
    // User has 2 hands, reference has 1: find best single-hand match
    const targetRefStart = refLeftActive ? 0 : 63
    const dL = handDist(userVector, 0, referenceVector, targetRefStart)
    const dR = handDist(userVector, 63, referenceVector, targetRefStart)
    const fL = computeFingerMatch(userVector, 0, referenceVector, targetRefStart)
    const fR = computeFingerMatch(userVector, 63, referenceVector, targetRefStart)

    if (dL <= dR) {
      bestDist = dL
      bestFingerMatch = fL
    } else {
      bestDist = dR
      bestFingerMatch = fR
    }
  } else {
    // User has 1 hand: compare user active hand against reference active hand
    const userStart = userLeftActive ? 0 : (userRightActive ? 63 : null)
    if (userStart === null) return 0

    const targetRefStart = refLeftActive ? 0 : 63
    bestDist = handDist(userVector, userStart, referenceVector, targetRefStart)
    bestFingerMatch = computeFingerMatch(userVector, userStart, referenceVector, targetRefStart)
  }

  if (bestDist === Infinity) return 0

  let rawScore = Math.max(0, Math.min(100, Math.round(100 - bestDist * DISTANCE_SCALE)))

  // 2. FINGER EXTENSION & LANDMARK CONSISTENCY:
  // If fingers are in the wrong extension state (e.g. showing open palm instead of fist, or fist instead of open palm),
  // apply a severe penalty:
  //   - 4-5 fingers match (ratio >= 0.8): 100% score preserved
  //   - 3 fingers match (ratio = 0.6): 75% preserved
  //   - 2 fingers match (ratio = 0.4): 30% preserved
  //   - 0-1 fingers match (ratio <= 0.2): 15% preserved (max 15%)
  if (bestFingerMatch < 0.6) {
    const penaltyFactor = Math.max(0.12, Math.pow(bestFingerMatch, 2.0))
    rawScore = Math.round(rawScore * penaltyFactor)
  } else if (bestFingerMatch < 0.8) {
    rawScore = Math.round(rawScore * 0.78)
  }

  return rawScore
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
