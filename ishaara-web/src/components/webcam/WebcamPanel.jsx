import { useEffect, useRef } from 'react'
import { useWebcam } from '../../cv/useWebcam'
import WebcamLoader from './WebcamLoader'
import WebcamPermission from './WebcamPermission'

export default function WebcamPanel({ onVideoReady, className = '', preferredDeviceId = null }) {
  const {
    videoRef,
    isReady,
    isLoading,
    error,
    activeDeviceId,
    startCamera
  } = useWebcam()

  const canvasRef = useRef(null)

  useEffect(() => {
    if (preferredDeviceId) {
      startCamera(preferredDeviceId)
    }
  }, [preferredDeviceId, startCamera])

  useEffect(() => {
    if (activeDeviceId) {
      localStorage.setItem('ishaara_camera_device', activeDeviceId)
    }
  }, [activeDeviceId])

  useEffect(() => {
    if (isReady && onVideoReady && videoRef.current) {
      onVideoReady(videoRef)
    }
  }, [isReady, onVideoReady, videoRef])

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-900 aspect-video ${className}`}>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: 'scaleX(-1)' }}
      />
      
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isLoading && !isReady && (
          <div className="pointer-events-auto w-full h-full bg-gray-900/80 backdrop-blur-sm">
            <WebcamLoader />
          </div>
        )}
        
        {error && (
          <div className="pointer-events-auto w-full h-full bg-gray-900">
            <WebcamPermission error={error} onRetry={() => startCamera(preferredDeviceId || null)} />
          </div>
        )}
      </div>

      {isReady && !error && (
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs rounded-full px-2 py-1 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          Camera Active
        </div>
      )}
    </div>
  )
}
