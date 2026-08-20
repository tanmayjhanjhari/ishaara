import { useState, useEffect, useRef, useCallback } from 'react'
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'
import { normalizeLandmarks } from './normalize'
import { drawLandmarks, clearCanvas } from './drawing'

// Module-level singleton — shared across all hook instances
let handLandmarker = null
let initPromise    = null

async function initHandLandmarker() {
  if (handLandmarker) return handLandmarker
  if (initPromise)    return initPromise

  initPromise = (async () => {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
    )
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/' +
          'hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
        delegate: 'GPU'  // falls back to CPU automatically
      },
      numHands:                   2,
      runningMode:                'VIDEO',
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence:  0.5,
      minTrackingConfidence:      0.5
    })
    return handLandmarker
  })()

  return initPromise
}

export function useMediaPipe({
  videoRef,
  canvasRef,
  onLandmarks,
  enabled = true
}) {
  const rafRef        = useRef(null)
  const isRunningRef  = useRef(false)
  const [isLoading,   setIsLoading]   = useState(true)
  const [isDetecting, setIsDetecting] = useState(false)

  const stopDetection = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    isRunningRef.current = false
    setIsDetecting(false)
  }, [])

  const startDetection = useCallback(async () => {
    if (isRunningRef.current) return
    if (!videoRef.current)    return

    setIsLoading(true)

    try {
      await initHandLandmarker()
      setIsLoading(false)
      isRunningRef.current = true

      const detect = () => {
        if (!isRunningRef.current)    return
        if (!videoRef.current)        return
        if (videoRef.current.readyState < 2) {
          // Video not ready yet — wait
          rafRef.current = requestAnimationFrame(detect)
          return
        }

        const canvas = canvasRef?.current
        const ctx    = canvas
          ? canvas.getContext('2d')
          : null
        const W = canvas?.width  || 640
        const H = canvas?.height || 480

        const timestamp = performance.now()
        const results   = handLandmarker.detectForVideo(
          videoRef.current, timestamp)

        const hands = results?.landmarks || []
        const handednessList = results?.handedness || []

        if (ctx) {
          clearCanvas(ctx, W, H)
        }

        if (hands.length > 0) {
          if (ctx) {
            hands.forEach(handLandmarks => {
              drawLandmarks(ctx, handLandmarks, W, H)
            })
          }

          let leftScreenHand = null
          let rightScreenHand = null

          if (hands.length === 1) {
            // Single hand: always map to left_hand (first 63 values) for 1-handed signs
            leftScreenHand = hands[0]
          } else if (hands.length >= 2) {
            // Two hands: sort by screen x-coordinate of the wrist (index 0)
            const handA = hands[0]
            const handB = hands[1]
            const xA = handA[0]?.x ?? 0.5
            const xB = handB[0]?.x ?? 0.5
            if (xA < xB) {
              leftScreenHand = handA
              rightScreenHand = handB
            } else {
              leftScreenHand = handB
              rightScreenHand = handA
            }
          }

          if (leftScreenHand || rightScreenHand) {
            const leftVector = leftScreenHand && leftScreenHand.length === 21
              ? normalizeLandmarks(leftScreenHand)
              : new Float32Array(63)
            const rightVector = rightScreenHand && rightScreenHand.length === 21
              ? normalizeLandmarks(rightScreenHand)
              : new Float32Array(63)

            const combinedVector = new Float32Array(126)
            combinedVector.set(leftVector, 0)
            combinedVector.set(rightVector, 63)

            onLandmarks?.(combinedVector, leftScreenHand, rightScreenHand)
            setIsDetecting(true)
          } else {
            onLandmarks?.(null, null, null)
            setIsDetecting(false)
          }
        } else {
          onLandmarks?.(null, null, null)
          setIsDetecting(false)
        }

        rafRef.current = requestAnimationFrame(detect)
      }

      detect()
    } catch (err) {
      console.error('MediaPipe init error:', err)
      setIsLoading(false)
    }
  }, [videoRef, canvasRef, onLandmarks])

  // Start when enabled and video is ready
  useEffect(() => {
    if (!enabled) { stopDetection(); return }
    startDetection()
    return () => stopDetection()
  }, [enabled, startDetection, stopDetection])

  return { isLoading, isDetecting }
}
