/**
 * HandConstellation
 * Reusable animated SVG of a hand rendered as MediaPipe landmark constellation.
 * Points are connected with glowing gradient lines; fingertips glow cyan.
 *
 * Props:
 *   size: px width/height of the SVG (default 280)
 *   animate: whether to run entrance animation (default true)
 *   glowColor: primary glow color (default violet)
 *   style: additional inline styles
 */

// 21 MediaPipe hand landmarks mapped to a 100×100 coordinate space
const PTS = [
  { x: 50, y: 88 },  // 0  wrist
  { x: 38, y: 78 },  // 1  thumb_cmc
  { x: 30, y: 67 },  // 2  thumb_mcp
  { x: 24, y: 57 },  // 3  thumb_ip
  { x: 18, y: 47 },  // 4  thumb_tip  ← fingertip
  { x: 43, y: 65 },  // 5  index_mcp
  { x: 40, y: 50 },  // 6  index_pip
  { x: 38, y: 37 },  // 7  index_dip
  { x: 36, y: 24 },  // 8  index_tip  ← fingertip
  { x: 50, y: 63 },  // 9  middle_mcp
  { x: 50, y: 47 },  // 10 middle_pip
  { x: 50, y: 33 },  // 11 middle_dip
  { x: 50, y: 19 },  // 12 middle_tip ← fingertip
  { x: 58, y: 65 },  // 13 ring_mcp
  { x: 60, y: 50 },  // 14 ring_pip
  { x: 61, y: 37 },  // 15 ring_dip
  { x: 61, y: 24 },  // 16 ring_tip   ← fingertip
  { x: 65, y: 70 },  // 17 pinky_mcp
  { x: 69, y: 58 },  // 18 pinky_pip
  { x: 72, y: 49 },  // 19 pinky_dip
  { x: 74, y: 41 },  // 20 pinky_tip  ← fingertip
]

const FINGERTIPS = new Set([4, 8, 12, 16, 20])

const CONNECTIONS = [
  // Thumb
  [0,1],[1,2],[2,3],[3,4],
  // Index
  [0,5],[5,6],[6,7],[7,8],
  // Middle
  [0,9],[9,10],[10,11],[11,12],
  // Ring
  [0,13],[13,14],[14,15],[15,16],
  // Pinky
  [0,17],[17,18],[18,19],[19,20],
  // Palm cross-connections
  [5,9],[9,13],[13,17],
]

export default function HandConstellation({
  size = 280,
  animate = true,
  className = '',
  style = {},
}) {
  const id = `hc-${Math.random().toString(36).slice(2,7)}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      style={style}
      aria-label="Hand constellation"
    >
      <defs>
        <linearGradient id={`${id}-lg1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}-lg2`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#67E8F9" stopOpacity="0.4" />
        </linearGradient>
        <filter id={`${id}-glow`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`${id}-glow-strong`}>
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Connection lines */}
      {CONNECTIONS.map(([a, b], i) => {
        const pa = PTS[a], pb = PTS[b]
        const len = Math.hypot(pb.x - pa.x, pb.y - pa.y)
        const isPalm = (a === 5 && b === 9) || (a === 9 && b === 13) || (a === 13 && b === 17)
        return (
          <line
            key={i}
            x1={pa.x} y1={pa.y}
            x2={pb.x} y2={pb.y}
            stroke={`url(#${id}-lg1)`}
            strokeWidth={isPalm ? '0.4' : '0.6'}
            strokeOpacity={isPalm ? '0.35' : '0.65'}
            filter={`url(#${id}-glow)`}
            style={animate ? {
              strokeDasharray: len * 1.5,
              strokeDashoffset: len * 1.5,
              animation: `drawPath 1.2s ease-out ${i * 0.06}s forwards`,
            } : {}}
          />
        )
      })}

      {/* Landmark dots */}
      {PTS.map((p, i) => {
        const isTip = FINGERTIPS.has(i)
        const isWrist = i === 0
        return (
          <g key={i}>
            {/* Outer ring pulse on tips */}
            {isTip && (
              <circle
                cx={p.x} cy={p.y}
                r="3.5"
                fill="none"
                stroke={`url(#${id}-lg1)`}
                strokeWidth="0.5"
                strokeOpacity="0.4"
                style={{ animation: `ringPulse 2.4s ease-in-out ${i * 0.12}s infinite` }}
              />
            )}
            {/* Main dot */}
            <circle
              cx={p.x} cy={p.y}
              r={isTip ? 2 : isWrist ? 2.2 : 1.3}
              fill={isTip ? '#67E8F9' : '#A78BFA'}
              filter={`url(#${isTip ? `${id}-glow-strong` : `${id}-glow`})`}
              style={animate ? {
                opacity: 0,
                animation: `fadeIn 0.4s ease-out ${0.7 + i * 0.04}s forwards`,
              } : {}}
            />
          </g>
        )
      })}
    </svg>
  )
}
