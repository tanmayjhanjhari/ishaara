import { CameraOff, AlertCircle } from 'lucide-react'
import { Button } from '../ui'

export default function WebcamPermission({ error, onRetry }) {
  let Icon = AlertCircle
  let iconColor = 'text-amber-400'
  let title = 'Camera Unavailable'
  let description = 'Your camera may be in use by another application. Close other apps and retry.'
  let showRetry = true
  let showInstructions = false

  if (error === 'permission_denied') {
    Icon = CameraOff
    iconColor = 'text-red-400'
    title = 'Camera Access Blocked'
    description = 'Allow camera access in your browser settings to practice signs.'
    showInstructions = true
  } else if (error === 'no_camera') {
    Icon = CameraOff
    iconColor = 'text-gray-400'
    title = 'No Camera Found'
    description = 'No camera was detected. Please connect a camera and try again.'
  } else if (error === 'browser_not_supported') {
    Icon = AlertCircle
    iconColor = 'text-red-400'
    title = 'Browser Not Supported'
    description = "Your browser doesn't support camera access. Please use Chrome or Firefox."
    showRetry = false
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center p-8">
      <Icon className={`w-12 h-12 ${iconColor}`} />
      <h3 className="text-lg font-semibold mt-4 text-white">{title}</h3>
      <p className="text-sm text-gray-400 mt-2 max-w-xs">{description}</p>
      
      {showInstructions && (
        <div className="bg-gray-800 rounded-lg p-3 mt-4 text-left border border-gray-700">
          <p className="text-xs font-semibold text-gray-300">How to fix:</p>
          <div className="text-xs text-gray-400 mt-1 flex flex-col gap-1">
            <p>1. Click the camera icon in your browser address bar</p>
            <p>2. Select "Allow" for camera access</p>
            <p>3. Refresh the page</p>
          </div>
        </div>
      )}

      {showRetry && (
        <div className="mt-6">
          <Button variant="primary" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  )
}
