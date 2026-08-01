import { Camera } from 'lucide-react'

export default function WebcamLoader({ message = "Starting camera..." }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Camera className="w-12 h-12 text-indigo-400 animate-pulse" />
      <p className="text-sm text-gray-400 mt-3">{message}</p>
    </div>
  )
}
