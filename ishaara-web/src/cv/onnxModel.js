/**
 * onnxModel.js — ONNX inference singleton for ISL sign recognition
 *
 * Model: sklearn RandomForest/MLP exported via skl2onnx (zipmap=False)
 * Input:  Float32Array[126] — 63 left-hand + 63 right-hand normalized landmarks
 * Outputs:
 *   "label"         — int64[batch]       predicted class index
 *   "probabilities" — float32[batch, 26] class probability scores
 */

import * as ort from 'onnxruntime-web'

let session        = null
let labelMap       = null
let isInitializing = false
let initError      = null

export async function initModel() {
  if (session && labelMap) return { success: true }

  if (isInitializing) {
    // Another call already started — wait up to 30s for it to finish
    let waited = 0
    while (isInitializing && waited < 30000) {
      await new Promise(r => setTimeout(r, 200))
      waited += 200
    }
    return session && labelMap
      ? { success: true }
      : { success: false, error: initError || 'Init timed out' }
  }

  isInitializing = true
  initError      = null

  try {
    console.log('[ONNX] Loading model (this may take 10–30s for large models)...')

    session = await ort.InferenceSession.create(
      '/models/ishaara_sign_classifier.onnx',
      { executionProviders: ['wasm'] }
    )

    console.log('[ONNX] Input names :', session.inputNames)
    console.log('[ONNX] Output names:', session.outputNames)

    const res = await fetch('/models/label_map.json')
    if (!res.ok) throw new Error(`label_map.json fetch failed: HTTP ${res.status}`)
    labelMap = await res.json()

    console.log('[ONNX] ✅ Ready —', Object.keys(labelMap).length, 'classes:', Object.values(labelMap).join(','))
    isInitializing = false
    return { success: true }
  } catch (err) {
    console.error('[ONNX] ❌ Failed to load model:', err)
    initError      = err.message
    session        = null
    labelMap       = null
    isInitializing = false
    return { success: false, error: err.message }
  }
}

export function isModelReady() {
  return session !== null && labelMap !== null
}

export function getLabelMap() {
  return labelMap
}

/**
 * Extract probabilities from an ONNX output tensor OR ZipMap.
 * Handles all formats produced by skl2onnx / onnxmltools:
 *   - Float32 tensor [1, 26]           (zipmap=False)
 *   - Sequence<Map<int64, float>>      (ZipMap — onnxmltools LightGBM default)
 *     where each Map is either a plain object OR a native JS Map
 */
function extractProbs(probOut, numClasses) {
  if (!probOut) return null

  // Case 1: Float32 tensor (zipmap=False) — .data is a typed array of numbers
  if (probOut.data && typeof probOut.data[0] === 'number') {
    return Array.from(probOut.data)
  }

  // Case 2: ZipMap — probOut.data is an array with one element (the map for batch[0])
  try {
    // onnxruntime-web returns probOut as an object with a .cpuData or .data property
    // For sequence outputs, the value is typically accessible directly
    const rawData = probOut.data ?? probOut.cpuData ?? probOut

    // The first element of the sequence corresponds to the first (only) sample
    const mapObj = Array.isArray(rawData) ? rawData[0] : rawData

    if (!mapObj) return null

    const arr = new Array(numClasses).fill(0)

    // Sub-case 2a: native JS Map (Map.prototype.forEach)
    if (mapObj instanceof Map) {
      mapObj.forEach((v, k) => { arr[parseInt(k)] = typeof v === 'number' ? v : 0 })
      return arr
    }

    // Sub-case 2b: plain object { "0": 0.01, "1": 0.95, ... }
    if (typeof mapObj === 'object') {
      for (const [k, v] of Object.entries(mapObj)) {
        arr[parseInt(k)] = typeof v === 'number' ? v : 0
      }
      return arr
    }
  } catch (_) { /* fall through */ }

  return null
}


/**
 * Run inference on one frame of hand landmarks.
 * @param {Float32Array} vector126 — 126 values (left[63] + right[63])
 * @returns {{ label: string, confidence: number, score: number } | null}
 */
export async function predictSign(vector126) {
  if (!session || !labelMap) return null

  if (!vector126 || vector126.length !== 126) {
    console.warn('[ONNX] Bad vector length:', vector126?.length)
    return null
  }

  // Skip all-zero frames (no hand detected)
  let hasNonZero = false
  for (let i = 0; i < 126; i++) {
    if (vector126[i] !== 0) { hasNonZero = true; break }
  }
  if (!hasNonZero) return null

  try {
    const inputName  = session.inputNames[0]
    const tensor     = new ort.Tensor('float32', vector126, [1, 126])
    const results    = await session.run({ [inputName]: tensor })

    // ── Extract predicted label index ────────────────────────────────────────
    const labelOut = results['label'] ?? results[session.outputNames[0]]
    const predIdx  = Number(labelOut.data[0])
    const label    = labelMap[String(predIdx)]

    if (!label) {
      console.warn('[ONNX] Unknown class index:', predIdx)
      return null
    }

    // ── Extract class probabilities ──────────────────────────────────────────
    const probOutName = session.outputNames.find(n => n !== 'label') ?? session.outputNames[session.outputNames.length - 1]
    const probOut     = results[probOutName] ?? results['probabilities']

    const numClasses = Object.keys(labelMap).length
    const probs      = extractProbs(probOut, numClasses)

    const confidence = probs ? (probs[predIdx] ?? 0) : 0.5  // default 50% if probs unavailable

    return {
      label,
      confidence,
      score: Math.round(confidence * 100),
    }
  } catch (err) {
    console.error('[ONNX] Prediction error:', err)
    return null
  }
}
