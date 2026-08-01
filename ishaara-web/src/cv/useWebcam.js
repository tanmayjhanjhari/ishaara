import { useRef, useState, useEffect, useCallback } from 'react'

const CONSTRAINTS = {
  video: {
    width:      { ideal: 640 },
    height:     { ideal: 480 },
    facingMode: 'user'
  }
}

export function useWebcam() {
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)
  const [isReady,   setIsReady]   = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error,     setError]     = useState(null)
  const [deviceList,       setDeviceList]       = useState([])
  const [activeDeviceId,   setActiveDeviceId]   = useState(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setIsReady(false)
  }, [])

  const startCamera = useCallback(async (deviceId = null) => {
    stopCamera()
    setIsLoading(true)
    setError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('browser_not_supported')
      setIsLoading(false)
      return
    }

    const constraints = { ...CONSTRAINTS }
    if (deviceId) {
      constraints.video = {
        ...constraints.video,
        deviceId: { exact: deviceId }
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      // Enumerate devices after stream starts (labels available now)
      const devices = await navigator.mediaDevices.enumerateDevices()
      const cameras = devices.filter(d => d.kind === 'videoinput')
      setDeviceList(cameras)

      const activeTrack = stream.getVideoTracks()[0]
      const settings    = activeTrack.getSettings()
      setActiveDeviceId(settings.deviceId || deviceId)

      setIsReady(true)
    } catch (err) {
      if (err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError') {
        setError('permission_denied')
      } else if (err.name === 'NotFoundError' ||
                 err.name === 'DevicesNotFoundError') {
        setError('no_camera')
      } else if (err.name === 'OverconstrainedError') {
        // Retry without deviceId constraint
        setError('device_error')
      } else {
        setError('device_error')
      }
    } finally {
      setIsLoading(false)
    }
  }, [stopCamera])

  // Start camera on mount, stop on unmount
  useEffect(() => {
    const savedDeviceId = localStorage.getItem('ishaara_camera_device')
    startCamera(savedDeviceId)
    return () => { stopCamera() }
  }, [startCamera, stopCamera])

  return {
    videoRef,
    isReady,
    isLoading,
    error,
    deviceList,
    activeDeviceId,
    startCamera,
    stopCamera
  }
}
