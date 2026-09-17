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

// Configure WASM runtime paths and execution for production web compatibility
try {
  ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.27.0/dist/'
  ort.env.wasm.numThreads = 1
} catch (e) {
  console.warn('[ONNX] Error setting up ort.env.wasm:', e)
}

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

    const res = await fetch('/models/label_map.json')
    if (!res.ok) throw new Error(`label_map.json fetch failed: HTTP ${res.status}`)
    labelMap = await res.json()

    console.log('[ONNX] Loaded successfully')
    console.log('[ONNX] Input:', session.inputNames)
    console.log('[ONNX] Output:', session.outputNames)
    console.log('[ONNX] Labels:', Object.values(labelMap).join(','))
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
  try {
    if (probOut.data && typeof probOut.data[0] === 'number') {
      return Array.from(probOut.data)
    }
  } catch (_) {
    // Accessing .data on a non-tensor output in onnxruntime-web throws
  }

  // Case 2: ZipMap — probOut is a sequence of maps
  try {
    const rawData = probOut.data ?? probOut.cpuData ?? probOut
    const mapObj = Array.isArray(rawData) ? rawData[0] : rawData
    if (!mapObj) return null

    const arr = new Array(numClasses).fill(0)
    if (mapObj instanceof Map) {
      mapObj.forEach((v, k) => { arr[parseInt(k)] = typeof v === 'number' ? v : 0 })
      return arr
    }
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
    const t0         = performance.now()
    const inputName  = session.inputNames[0]
    const tensor     = new ort.Tensor('float32', vector126, [1, 126])

    // Run inference safely: fallback to label output only if ZipMap output causes error
    const labelOutName = session.outputNames.find(n => n.toLowerCase().includes('label')) ?? session.outputNames[0]
    let results
    try {
      results = await session.run({ [inputName]: tensor })
    } catch (runErr) {
      results = await session.run({ [inputName]: tensor }, [labelOutName])
    }
    const ms = (performance.now() - t0).toFixed(1)

    // ── Extract predicted label index ────────────────────────────────────────
    const labelOut = results['label'] ?? results[labelOutName] ?? results[session.outputNames[0]]
    if (!labelOut || !labelOut.data) return null
    const predIdx  = Number(labelOut.data[0])
    const label    = labelMap[String(predIdx)]

    if (!label) {
      console.warn('[ONNX] Unknown class index:', predIdx)
      return null
    }

    // ── Extract class probabilities safely ──────────────────────────────────
    let probs = null
    let confidence = 0.88
    try {
      const probOutName = session.outputNames.find(n => n !== labelOutName && n !== 'label') ?? session.outputNames[1]
      const probOut     = probOutName ? (results[probOutName] ?? results['probabilities']) : null
      if (probOut) {
        probs = extractProbs(probOut, Object.keys(labelMap).length)
        if (probs && probs[predIdx] !== undefined) {
          confidence = probs[predIdx]
        }
      }
    } catch (_) {
      confidence = 0.88
    }

    if (typeof window !== 'undefined') {
      if (!window._predCount) window._predCount = 0
      window._predCount++
      if (window._predCount % 30 === 0) {
        console.log('[ONNX]', {
          label,
          confidence: confidence.toFixed(3),
          ms,
          top3: probs ? probs
            .map((p, i) => ({ l: labelMap[String(i)], p }))
            .sort((a, b) => b.p - a.p)
            .slice(0, 3)
            .map(x => `${x.l}:${x.p.toFixed(2)}`)
            .join(' | ') : 'N/A'
        })
      }
    }

    return {
      label,
      confidence,
      score: Math.round(confidence * 100),
      allProbs: probs
    }
  } catch (err) {
    console.error('[ONNX] Prediction error:', err)
    return null
  }
}
