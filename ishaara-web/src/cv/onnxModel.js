/**
 * onnxModel.js — ONNX inference singleton for ISL sign recognition
 *
 * Model: MLP exported with skl2onnx (zipmap=False)
 * Input:  Float32Array[126]  — 63 left-hand + 63 right-hand normalized landmarks
 * Outputs:
 *   "label"         — int64[batch]       predicted class index
 *   "probabilities" — float32[batch, 26] class probability scores
 */

import * as ort from 'onnxruntime-web'

let session        = null
let labelMap       = null
let isInitializing = false

export async function initModel() {
  if (session && labelMap) return   // already loaded
  if (isInitializing)      return   // already in progress

  isInitializing = true
  console.log('[ONNX] Loading model...')

  try {
    session = await ort.InferenceSession.create(
      '/models/ishaara_sign_classifier.onnx',
      { executionProviders: ['wasm'] }
    )

    const res = await fetch('/models/label_map.json')
    labelMap  = await res.json()

    console.log('[ONNX] ✅ Model ready')
    console.log('[ONNX] Inputs:', session.inputNames)
    console.log('[ONNX] Outputs:', session.outputNames)
  } catch (err) {
    console.error('[ONNX] ❌ Load failed:', err)
    session        = null
    isInitializing = false
    throw err
  }
}

export function isModelReady() {
  return session !== null && labelMap !== null
}

/**
 * Run inference on one frame of hand landmarks.
 * @param {Float32Array} vector126 — 126 values (left[63] + right[63])
 * @returns {{ label: string, confidence: number, score: number } | null}
 */
export async function predictSign(vector126) {
  if (!session || !labelMap) return null

  // Guard against bad input
  if (!vector126 || vector126.length !== 126) return null
  const allZero = vector126.every(v => v === 0)
  if (allZero) return null

  try {
    const tensor    = new ort.Tensor('float32', vector126, [1, 126])
    const inputName = session.inputNames[0]
    const results   = await session.run({ [inputName]: tensor })

    // "label" → int64 tensor, shape [1]
    const labelOut = results['label'] ?? results[session.outputNames[0]]
    const predIdx  = Number(labelOut.data[0])
    const label    = labelMap[String(predIdx)]

    // "probabilities" → float32 tensor, shape [1, 26]
    const probOut    = results['probabilities'] ?? results[session.outputNames[1]]
    const probs      = Array.from(probOut.data)          // 26 values
    const confidence = probs[predIdx] ?? 0               // probability of predicted class

    return {
      label,
      confidence,
      score: Math.round(confidence * 100)
    }
  } catch (err) {
    console.error('[ONNX] Prediction error:', err)
    return null
  }
}
