import { CameraOff, Loader2 } from 'lucide-react'

export default function HandIndicator({ isDetecting, isLoading }) {
  let content = null

  if (isLoading) {
    content = (
      <div className="bg-black/50 text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm transition-all duration-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
        <span>Initializing...</span>
      </div>
    )
  } else if (isDetecting) {
    content = (
      <div className="bg-green-500/80 text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm transition-all duration-200">
        <span role="img" aria-label="hand">✋</span>
        <span>Hand detected</span>
      </div>
    )
  } else {
    content = (
      <div className="bg-amber-500/80 text-white text-xs rounded-full px-2.5 py-1 flex items-center gap-1.5 backdrop-blur-sm transition-all duration-200">
        <CameraOff className="w-3.5 h-3.5 text-white/90" />
        <span>No hand detected</span>
      </div>
    )
  }

  return (
    <div className="absolute bottom-3 right-3 z-10 transition-all duration-200">
      {content}
    </div>
  )
}
