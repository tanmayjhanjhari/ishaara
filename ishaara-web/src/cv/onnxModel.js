/**
 * onnxModel.js — ONNX inference singleton for ISL sign recognition
 *
 * Usage:
 *   await initModel()           — call once (e.g. on Lessons page mount)
 *   isModelReady()              — check before running inference
 *   predictSign(vector63)       — returns { label, confidence, score }
 *
 * Input:  Float32Array of 63 values (normalized hand landmarks from normalize.js)
 * Output: { label: 'A', confidence: 0.91, score: 91 }
 */

import * as ort from 'onnxruntime-web'

let session        = null
let labelMap       = null
let isInitializing = false

export async function initModel() {
  if (session && labelMap) return   // already loaded
  if (isInitializing)      return   // already in progress

  isInitializing = true

  try {
    // Load ONNX session — WASM backend (runs in browser, no server needed)
    session = await ort.InferenceSession.create(
      '/models/ishaara_sign_classifier.onnx',
      { executionProviders: ['wasm'] }
    )

    // Load label map: { "0": "A", "1": "B", ..., "25": "Z" }
    const res = await fetch('/models/label_map.json')
    labelMap  = await res.json()

    console.log('[ONNX] Model ready. Classes:', Object.values(labelMap).join(', '))
  } catch (err) {
    console.error('[ONNX] Load failed:', err)
    session        = null
    isInitializing = false
    throw err
  }
}

/**
 * Returns true once the model session and label map are both loaded.
 */
export function isModelReady() {
  return session !== null && labelMap !== null
}

/**
 * Run a single inference pass.
 * @param {Float32Array} vector126 — 126 normalized landmark values
 * @returns {{ label: string, confidence: number, score: number } | null}
 */
export async function predictSign(vector126) {
  if (!session || !labelMap) return null

  try {
    // Build input tensor — shape [1, 126]
    const tensor    = new ort.Tensor('float32', vector126, [1, 126])
    const inputName = session.inputNames[0]
    const results   = await session.run({ [inputName]: tensor })

    // Last output is the probability vector (LightGBM ONNX convention)
    const outputName = session.outputNames[session.outputNames.length - 1]
    const probs      = Array.from(results[outputName].data)
    const maxIdx     = probs.indexOf(Math.max(...probs))
    const label      = labelMap[String(maxIdx)]
    const confidence = probs[maxIdx]

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
