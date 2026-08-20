import React, { useState } from 'react'
import { Hand, Info, HelpCircle, CheckCircle2, ShieldAlert } from 'lucide-react'

// ISL fingerspelling cue hints per letter (simplified descriptions for user guidance)
const ISL_CUES = {
  A: 'Close your fist with thumb resting beside the index finger',
  B: 'Hold four fingers straight up together, thumb tucked in front of palm',
  C: 'Curve your hand into a "C" shape with all fingers bent',
  D: 'Point index finger up, other fingers and thumb form a circle',
  E: 'Curl all fingers down, thumb tucked under',
  F: 'Touch index finger and thumb tip together, other fingers extended',
  G: 'Point index finger sideways, thumb extended parallel',
  H: 'Extend index and middle fingers horizontally together',
  I: 'Raise pinky finger only, fist closed',
  J: 'Raise pinky and trace a "J" motion in the air',
  K: 'Extend index and middle fingers in a V shape, thumb between',
  L: 'Extend index finger up, thumb out — L shape',
  M: 'Fold three fingers over the thumb',
  N: 'Fold two fingers over the thumb',
  O: 'Form an "O" with all finger tips touching the thumb',
  P: 'Point index finger downward with thumb out',
  Q: 'Point index finger and thumb downward',
  R: 'Cross index and middle fingers',
  S: 'Close fist with thumb over fingers',
  T: 'Thumb tucked between index and middle finger',
  U: 'Extend index and middle fingers straight up together',
  V: 'Extend index and middle fingers in a V (peace sign)',
  W: 'Extend index, middle, and ring fingers upward',
  X: 'Hook your index finger like a crochet hook',
  Y: 'Extend pinky and thumb, fold other fingers',
  Z: 'Trace a "Z" in the air with your index finger',
}

// Color accent for the letter badge
const LETTER_COLORS = [
  '#A78BFA', '#67E8F9', '#6EE7B7', '#FCD34D', '#F9A8D4',
  '#C4B5FD', '#7DD3FC', '#86EFAC', '#FDE68A', '#FDA4AF',
]
function getLetterColor(letter) {
  const idx = letter.charCodeAt(0) - 65
  return LETTER_COLORS[idx % LETTER_COLORS.length]
}

function ReferenceHandCanvas({ leftHand, rightHand, color }) {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width

    // Clear background
    ctx.clearRect(0, 0, size, size)

    // Collect all points to fit both hands in the canvas
    const allLandmarks = []
    if (leftHand && leftHand.length === 21) allLandmarks.push(...leftHand)
    if (rightHand && rightHand.length === 21) allLandmarks.push(...rightHand)

    if (allLandmarks.length === 0) return

    // Calculate bounds to auto-fit hand to canvas
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    allLandmarks.forEach(p => {
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    })

    const w = maxX - minX
    const h = maxY - minY
    const maxDim = Math.max(w, h) || 1
    const padding = 12
    const scale = (size - padding * 2) / maxDim

    const centerX = (minX + maxX) / 2
    const centerY = (minY + maxY) / 2

    const toCanvas = (p) => {
      // Mirror horizontally to match mirrored camera
      const mirroredX = 1 - p.x
      const mirroredCenterX = 1 - centerX
      return {
        x: (mirroredX - mirroredCenterX) * scale + (size / 2),
        y: (p.y - centerY) * scale + (size / 2)
      }
    }

    const drawHand = (landmarks, handColor) => {
      // Draw connections
      ctx.lineWidth = 2.5
      ctx.strokeStyle = handColor
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowBlur = 6
      ctx.shadowColor = handColor
      ctx.globalAlpha = 0.85

      const connections = [
        [0,1],[1,2],[2,3],[3,4],
        [0,5],[5,6],[6,7],[7,8],
        [0,9],[9,10],[10,11],[11,12],
        [0,13],[13,14],[14,15],[15,16],
        [0,17],[17,18],[18,19],[19,20],
        [5,9],[9,13],[13,17]
      ]

      connections.forEach(([startIdx, endIdx]) => {
        const start = toCanvas(landmarks[startIdx])
        const end = toCanvas(landmarks[endIdx])
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(end.x, end.y)
        ctx.stroke()
      })

      // Draw joints
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1.0
      const fingertips = [4, 8, 12, 16, 20]

      landmarks.forEach((p, i) => {
        const pos = toCanvas(p)
        const isTip = fingertips.includes(i)
        const radius = isTip ? 5 : 3.5
        
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI)
        ctx.fillStyle = i === 0 ? '#f43f5e' : isTip ? '#10b981' : '#ffffff'
        ctx.fill()

        if (isTip) {
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, radius + 2, 0, 2 * Math.PI)
          ctx.strokeStyle = '#10b981'
          ctx.lineWidth = 1.2
          ctx.stroke()
        }
      })
    }

    if (leftHand && leftHand.length === 21) {
      drawHand(leftHand, color)
    }
    if (rightHand && rightHand.length === 21) {
      drawHand(rightHand, color)
    }
  }, [leftHand, rightHand, color])

  return (
    <div className="relative p-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-inner w-36 h-36">
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
      <canvas ref={canvasRef} width={136} height={136} className="relative block z-10" />
    </div>
  )
}

export default function SignReference({ sign, isPulsing }) {
  const [activeTab, setActiveTab] = useState('practice')

  if (!sign) return null

  const letter = sign.label?.toUpperCase() || 'A'
  const cue = ISL_CUES[letter] || `Make the ISL sign for "${sign.label}"`
  const accentColor = getLetterColor(letter)

  const reference = sign.reference_landmarks
  let leftHand = null
  let rightHand = null

  if (reference) {
    if (Array.isArray(reference)) {
      if (reference.length === 21) {
        rightHand = reference
      }
    } else {
      leftHand = reference.left_hand || null
      rightHand = reference.right_hand || null
    }
  }

  return (
    <div className="flex flex-col items-center w-full gap-3">
      {/* Amber attention label when pulsing on fail */}
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
        style={{
          background: 'linear-gradient(145deg, rgba(12,12,32,0.95) 0%, rgba(20,8,40,0.9) 100%)',
        }}
      >
        {/* Visual area — sign illustration or letter display */}
        <div
          className="relative flex items-center justify-center"
          style={{
            minHeight: 180,
            background: `radial-gradient(ellipse at center, ${accentColor}15 0%, transparent 70%)`,
            borderBottom: `1px solid ${accentColor}20`,
          }}
        >
          {activeTab === 'practice' ? (
            sign.video_url ? (
              /* If a video reference exists, show it */
              <video
                src={sign.video_url}
                muted loop autoPlay playsInline
                className="w-full h-full object-cover"
                style={{ maxHeight: 220 }}
              />
            ) : (
              /* No media — show stylised letter + hand wireframe preview side-by-side */
              <div className="flex items-center justify-around py-4 px-6 w-full gap-4">
                {/* Giant letter display */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    className="font-outfit font-black select-none leading-none mb-2"
                    style={{
                      fontSize: '5.5rem',
                      color: accentColor,
                      textShadow: `0 0 60px ${accentColor}60, 0 0 20px ${accentColor}40`,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {sign.label}
                  </div>
                  {/* Hand icon row */}
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Hand size={14} style={{ color: accentColor }} />
                    <Hand size={14} style={{ color: accentColor, transform: 'scaleX(-1)' }} />
                  </div>
                </div>

                {/* Holographic hand wireframe skeleton */}
                {leftHand || rightHand ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                      Target Shape
                    </span>
                    <ReferenceHandCanvas leftHand={leftHand} rightHand={rightHand} color={accentColor} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-text-muted opacity-50 py-4">
                    <Hand size={32} style={{ color: accentColor }} />
                    <span className="text-[10px] font-semibold">Shape Loading...</span>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Training/Tutorial tab */
            <div className="p-5 w-full flex flex-col gap-3 text-xs text-text-muted">
              <h4 className="font-bold text-text-primary flex items-center gap-1.5" style={{ color: accentColor }}>
                <HelpCircle size={14} /> Training Guide & Setup
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>
                  <strong className="text-text-primary">Camera Distance:</strong> Place your hands <span className="text-primary-light">30–50 cm</span> away from the camera.
                </li>
                <li>
                  <strong className="text-text-primary">Two-Hand Tracking:</strong> Indian Sign Language (ISL) utilizes two hands. MediaPipe tracks both left and right hands.
                </li>
                <li>
                  <strong className="text-text-primary">Score validation:</strong> The AI scorer compares both hand poses in real-time. Ensure both are visible.
                </li>
                <li>
                  <strong className="text-text-primary">Hold Pose:</strong> Once your score is above 50, keep steady for <span className="text-success-light">0.5 seconds</span> to unlock the sign.
                </li>
              </ul>
            </div>
          )}

          {/* Corner brackets */}
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
            const isTop  = pos.includes('top')
            const isLeft = pos.includes('left')
            return (
              <div key={pos} className="absolute w-5 h-5" style={{
                top:    isTop    ? 10 : 'auto',
                bottom: !isTop   ? 10 : 'auto',
                left:   isLeft   ? 10 : 'auto',
                right:  !isLeft  ? 10 : 'auto',
                borderTop:    isTop    ? `2px solid ${accentColor}50` : 'none',
                borderBottom: !isTop   ? `2px solid ${accentColor}50` : 'none',
                borderLeft:   isLeft   ? `2px solid ${accentColor}50` : 'none',
                borderRight:  !isLeft  ? `2px solid ${accentColor}50` : 'none',
              }} />
            )
          })}
        </div>

        {/* Info footer */}
        <div className="px-4 py-3">
          {/* Sign name row */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <span
                className="font-outfit font-black text-lg"
                style={{ color: accentColor }}
              >
                {sign.label}
              </span>
              <span className="ml-2 text-xs text-text-muted capitalize">{sign.category}</span>
            </div>
            {/* Tab buttons */}
            <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab('practice')}
                className={`text-[10px] px-2 py-1 rounded-md transition-all font-semibold ${
                  activeTab === 'practice' ? 'bg-primary text-text-primary' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Practice
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`text-[10px] px-2 py-1 rounded-md transition-all font-semibold ${
                  activeTab === 'tutorial' ? 'bg-primary text-text-primary' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                Tutorial
              </button>
            </div>
          </div>

          {/* Instruction hint */}
          <div
            className="flex items-start gap-2 text-xs leading-relaxed rounded-xl p-2.5"
            style={{
              background: `${accentColor}10`,
              border: `1px solid ${accentColor}20`,
              color: '#d4d0e8',
            }}
          >
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: accentColor }} />
            <span>{cue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
