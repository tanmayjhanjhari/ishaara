const WRIST_INDEX = 0
const PALM_INDEX  = 9  // middle finger MCP

/**
 * Normalize 21 MediaPipe hand landmarks to a scale-invariant, position-invariant
 * Float32Array[63]. Returns Float32Array(63) of zeros if input is invalid.
 *
 * Never returns null — callers (useMediaPipe) depend on always getting a Float32Array.
 */
export function normalizeLandmarks(landmarks21) {
  // landmarks21: array of 21 {x, y, z} objects from MediaPipe
  // Returns: Float32Array of 63 values (zeros on invalid input)
  // Layout: x0,y0,z0, x1,y1,z1, ..., x20,y20,z20 (interleaved per landmark)

  if (!landmarks21 || landmarks21.length < 21) {
    return new Float32Array(63)
  }

  const wrist   = landmarks21[WRIST_INDEX]
  const palmRef = landmarks21[PALM_INDEX]

  if (!wrist || !palmRef) return new Float32Array(63)

  const dx       = palmRef.x - wrist.x
  const dy       = palmRef.y - wrist.y
  const dz       = (palmRef.z ?? 0) - (wrist.z ?? 0)
  const palmSize = Math.sqrt(dx*dx + dy*dy + dz*dz)

  if (palmSize < 1e-6) {
    return new Float32Array(63)
  }

  const vector = new Float32Array(63)
  landmarks21.forEach((lm, i) => {
    vector[i * 3]     = (lm.x - wrist.x) / palmSize
    vector[i * 3 + 1] = (lm.y - wrist.y) / palmSize
    vector[i * 3 + 2] = ((lm.z ?? 0) - (wrist.z ?? 0)) / palmSize
  })

  return vector
}

export function landmarksToArray(landmarks21) {
  // Convert MediaPipe landmarks to plain array for storage
  return landmarks21.map(lm => ({ x: lm.x, y: lm.y, z: lm.z ?? 0 }))
}

export function arrayToFloat32(landmarksArray) {
  // Convert stored reference array back to Float32Array
  return normalizeLandmarks(landmarksArray)
}
