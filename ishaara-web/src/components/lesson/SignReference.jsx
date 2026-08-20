import React, { useState } from 'react'
import { Hand, Info, HelpCircle, Lightbulb, AlertTriangle } from 'lucide-react'
import { getSignData } from '../../data/islAlphabet'

// Accent color per letter
const LETTER_COLORS = [
  '#A78BFA', '#67E8F9', '#6EE7B7', '#FCD34D', '#F9A8D4',
  '#C4B5FD', '#7DD3FC', '#86EFAC', '#FDE68A', '#FDA4AF',
]
function getLetterColor(letter) {
  const idx = (letter?.toUpperCase()?.charCodeAt(0) || 65) - 65
  return LETTER_COLORS[idx % LETTER_COLORS.length]
}

// Holographic hand wireframe canvas
function ReferenceHandCanvas({ leftHand, rightHand, color }) {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const size = canvas.width

    ctx.clearRect(0, 0, size, size)

    const allLandmarks = []
    if (leftHand  && leftHand.length  === 21) allLandmarks.push(...leftHand)
    if (rightHand && rightHand.length === 21) allLandmarks.push(...rightHand)
    if (allLandmarks.length === 0) return

    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    allLandmarks.forEach(p => {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    })

    const w      = maxX - minX
    const h      = maxY - minY
    const maxDim = Math.max(w, h) || 1
    const pad    = 14
    const scale  = (size - pad * 2) / maxDim

    const cx = (minX + maxX) / 2
    const cy = (minY + maxY) / 2

    const toCanvas = (p) => ({
      x: ((1 - p.x) - (1 - cx)) * scale + size / 2,
      y: (p.y - cy) * scale + size / 2,
    })

    const drawHand = (landmarks, handColor) => {
      const connections = [
        [0,1],[1,2],[2,3],[3,4],
        [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],
        [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],
        [5,9],[9,13],[13,17],
      ]
      ctx.lineWidth   = 2.5
      ctx.strokeStyle = handColor
      ctx.lineCap     = 'round'
      ctx.lineJoin    = 'round'
      ctx.shadowBlur  = 6
      ctx.shadowColor = handColor
      ctx.globalAlpha = 0.85
      connections.forEach(([a, b]) => {
        const s = toCanvas(landmarks[a])
        const e = toCanvas(landmarks[b])
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(e.x, e.y)
        ctx.stroke()
      })
      ctx.shadowBlur  = 0
      ctx.globalAlpha = 1.0
      const tips = [4, 8, 12, 16, 20]
      landmarks.forEach((p, i) => {
        const pos    = toCanvas(p)
        const isTip  = tips.includes(i)
        const radius = isTip ? 5 : 3.5
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = i === 0 ? '#f43f5e' : isTip ? '#10b981' : '#ffffff'
        ctx.fill()
        if (isTip) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, radius + 2, 0, 2 * Math.PI)
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth   = 1.2
          ctx.stroke()
        }
      })
    }

    if (leftHand  && leftHand.length  === 21) drawHand(leftHand,  color)
    if (rightHand && rightHand.length === 21) drawHand(rightHand, color)
  }, [leftHand, rightHand, color])

  return (
    <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner w-36 h-36">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      <canvas ref={canvasRef} width={136} height={136} className="relative block z-10" />
    </div>
  )
}

export default function SignReference({ sign, isPulsing, mode = 'practice' }) {
  const [activeTab, setActiveTab] = useState('practice')

  if (!sign) return null

  const letter   = sign.label?.toUpperCase() || 'A'
  const signData = getSignData(letter)
  const color    = getLetterColor(letter)

  const instruction   = signData?.instruction   || `Make the ISL sign for "${letter}"`
  const tip           = signData?.tip           || 'Follow the reference shape carefully'
  const handShape     = signData?.handShape     || ''
  const commonMistake = signData?.commonMistake || ''

  // Extract reference hand data
  let leftHand  = null
  let rightHand = null
  const ref = sign.reference_landmarks
  if (ref) {
    if (Array.isArray(ref) && ref.length === 21) {
      rightHand = ref
    } else if (ref && typeof ref === 'object') {
      leftHand  = ref.left_hand  || null
      rightHand = ref.right_hand || null
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Pulsing attention label */}
      {isPulsing && (
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 animate-bounce">
          <Info size={13} />
          Study the reference carefully →
        </div>
      )}

      {/* Main reference card */}
      <div
        className={`w-full rounded-2xl border overflow-hidden transition-all duration-300 ${
          isPulsing ? 'pulse-ring border-amber-500/40' : 'border-white/8'
        }`}
        style={{ background: 'linear-gradient(145deg, rgba(12,12,32,0.95) 0%, rgba(20,8,40,0.9) 100%)' }}
      >
        {/* Visual area */}
        <div
          className="relative flex items-center justify-center"
          style={{
            minHeight: 180,
            background: `radial-gradient(ellipse at center, ${color}15 0%, transparent 70%)`,
            borderBottom: `1px solid ${color}20`,
          }}
        >
          {activeTab === 'practice' ? (
            sign.video_url ? (
              <video
                src={sign.video_url}
                muted loop autoPlay playsInline
                className="w-full h-full object-cover"
                style={{ maxHeight: 220 }}
              />
            ) : (
              <div className="flex items-center justify-around py-4 px-6 w-full gap-4">
                {/* Giant letter */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="font-outfit font-black select-none leading-none mb-1"
                    style={{
                      fontSize: '5.5rem',
                      color,
                      textShadow: `0 0 60px ${color}60, 0 0 20px ${color}40`,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {sign.label}
                  </div>
                  {handShape && (
                    <span className="text-[10px] text-gray-500 text-center max-w-[100px] leading-tight mt-1">
                      {handShape}
                    </span>
                  )}
                </div>

                {/* Hand wireframe or placeholder */}
                {leftHand || rightHand ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                      Target Shape
                    </span>
                    <ReferenceHandCanvas leftHand={leftHand} rightHand={rightHand} color={color} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-600 opacity-60 py-4">
                    <Hand size={32} style={{ color }} />
                    <span className="text-[10px] font-semibold">No reference yet</span>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Tutorial tab content */
            <div className="p-5 w-full flex flex-col gap-3">
              <h4 className="font-bold text-sm flex items-center gap-1.5" style={{ color }}>
                <HelpCircle size={14} /> How to form sign "{letter}"
              </h4>

              {/* Instruction */}
              <div
                className="flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed"
                style={{ background: `${color}10`, border: `1px solid ${color}20`, color: '#ccc8e8' }}
              >
                <Hand size={12} className="shrink-0 mt-0.5" style={{ color }} />
                {instruction}
              </div>

              {/* Tip */}
              <div className="flex items-start gap-2 rounded-lg p-2.5 text-xs leading-relaxed"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', color: '#fde68a' }}>
                <Lightbulb size={11} className="shrink-0 mt-0.5 text-amber-400" />
                {tip}
              </div>

              {/* Common mistake */}
              {commonMistake && (
                <div className="flex items-start gap-2 rounded-lg p-2.5 text-xs leading-relaxed"
                  style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}>
                  <AlertTriangle size={11} className="shrink-0 mt-0.5 text-red-400" />
                  {commonMistake}
                </div>
              )}
            </div>
          )}

          {/* Corner brackets */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
            const isTop  = pos.includes('top')
            const isLeft = pos.includes('left')
            return (
              <div key={pos} className="absolute w-5 h-5 pointer-events-none" style={{
                top:    isTop    ? 10 : 'auto',
                bottom: !isTop   ? 10 : 'auto',
                left:   isLeft   ? 10 : 'auto',
                right:  !isLeft  ? 10 : 'auto',
                borderTop:    isTop    ? `2px solid ${color}50` : 'none',
                borderBottom: !isTop   ? `2px solid ${color}50` : 'none',
                borderLeft:   isLeft   ? `2px solid ${color}50` : 'none',
                borderRight:  !isLeft  ? `2px solid ${color}50` : 'none',
              }} />
            )
          })}
        </div>

        {/* Footer: label + tabs + cue */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-outfit font-black text-lg" style={{ color }}>
                {sign.label}
              </span>
              <span className="ml-2 text-xs text-gray-500 capitalize">{sign.category}</span>
            </div>
            {/* Practice / Tutorial tab toggle */}
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab('practice')}
                className={`text-[10px] px-2 py-1 rounded-md transition-all font-semibold ${
                  activeTab === 'practice' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`text-[10px] px-2 py-1 rounded-md transition-all font-semibold ${
                  activeTab === 'tutorial' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Tutorial
              </button>
            </div>
          </div>

          {/* Quick instruction hint */}
          <div
            className="flex items-start gap-2 text-xs leading-relaxed rounded-xl p-2.5"
            style={{ background: `${color}10`, border: `1px solid ${color}20`, color: '#d4d0e8' }}
          >
            <Info size={12} className="shrink-0 mt-0.5" style={{ color }} />
            <span>{instruction}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
