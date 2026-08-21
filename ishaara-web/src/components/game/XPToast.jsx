import { useEffect } from 'react'
import { Zap } from 'lucide-react'

export default function XPToast({ amount = 0, visible = false, onDone }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        if (onDone) onDone()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [visible, onDone])

  if (!visible) return null

  return (
    <div
      className="fixed z-50 pointer-events-none flex items-center gap-2 bg-indigo-950/95 border border-indigo-500/30 text-amber-400 font-black text-xl rounded-full px-5 py-2.5 shadow-[0_10px_30px_rgba(79,70,229,0.3)] whitespace-nowrap"
      style={{
        bottom: '120px',
        left: '50%',
        animation: 'xpToastAnim 1.2s cubic-bezier(0.25, 1, 0.5, 1) forwards',
      }}
    >
      <style>{`
        @keyframes xpToastAnim {
          0% { transform: translate(-50%, 20px); opacity: 0; }
          20% { transform: translate(-50%, 0); opacity: 1; }
          80% { transform: translate(-50%, -5px); opacity: 1; }
          100% { transform: translate(-50%, -40px); opacity: 0; }
        }
      `}</style>
      <Zap size={20} className="fill-amber-400 stroke-amber-500 animate-pulse" />
      <span>+{amount} XP</span>
    </div>
  )
}
