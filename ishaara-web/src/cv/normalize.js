const WRIST_INDEX  = 0
const PALM_INDEX   = 9  // middle finger MCP

export function normalizeLandmarks(landmarks21) {
  // landmarks21: array of 21 {x, y, z} objects
  // Returns: Float32Array of 63 values
  // Position-invariant, scale-invariant

  const wrist    = landmarks21[WRIST_INDEX]
  const palmRef  = landmarks21[PALM_INDEX]

  // Palm size = euclidean distance wrist → middle MCP
  const dx       = palmRef.x - wrist.x
  const dy       = palmRef.y - wrist.y
  const dz       = palmRef.z - wrist.z
  const palmSize = Math.sqrt(dx*dx + dy*dy + dz*dz)

  // Guard against zero palm size (edge case: flat hand parallel to camera)
  if (palmSize < 0.001) {
    return new Float32Array(63)
  }

  const vector = new Float32Array(63)
  landmarks21.forEach((lm, i) => {
    vector[i * 3]     = (lm.x - wrist.x) / palmSize
    vector[i * 3 + 1] = (lm.y - wrist.y) / palmSize
    vector[i * 3 + 2] = (lm.z - wrist.z) / palmSize
  })

  return vector
}

export function landmarksToArray(landmarks21) {
  // Convert MediaPipe landmarks to plain array
  // Used for storing reference signs
  return landmarks21.map(lm => ({ x: lm.x, y: lm.y, z: lm.z }))
}

export function arrayToFloat32(landmarksArray) {
  // Convert stored reference array back to Float32Array
  // Used when comparing reference to user landmarks
  return normalizeLandmarks(landmarksArray)
}
