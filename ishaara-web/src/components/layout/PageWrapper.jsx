import Navbar from './Navbar'

/**
 * PageWrapper: dark space base with fixed Navbar clearance.
 * Renders a star-field SVG behind all page content.
 */

// Star positions: percentage-based cx/cy, but r in viewBox units (0 0 1000 1000)
// so r=2 = 0.2% of the viewport, which makes proper tiny dots
const STARS = [
  { cx: 80,  cy: 120, r: 2, delay: 0 },
  { cx: 230, cy: 50,  r: 1.5, delay: 0.8 },
  { cx: 370, cy: 180, r: 2, delay: 1.5 },
  { cx: 520, cy: 80,  r: 1.8, delay: 0.3 },
  { cx: 680, cy: 220, r: 1.5, delay: 2.1 },
  { cx: 780, cy: 60,  r: 2, delay: 0.6 },
  { cx: 910, cy: 150, r: 1.5, delay: 1.2 },
  { cx: 150, cy: 350, r: 2, delay: 1.8 },
  { cx: 440, cy: 420, r: 1.5, delay: 0.4 },
  { cx: 630, cy: 380, r: 2, delay: 2.4 },
  { cx: 820, cy: 450, r: 1.8, delay: 0.9 },
  { cx: 290, cy: 580, r: 2, delay: 1.6 },
  { cx: 560, cy: 620, r: 1.5, delay: 0.2 },
  { cx: 740, cy: 700, r: 2, delay: 3.0 },
  { cx: 930, cy: 550, r: 1.5, delay: 1.3 },
  { cx: 60,  cy: 750, r: 2, delay: 0.7 },
  { cx: 420, cy: 800, r: 1.5, delay: 2.2 },
  { cx: 880, cy: 820, r: 1.8, delay: 1.0 },
  { cx: 190, cy: 900, r: 2, delay: 0.5 },
  { cx: 610, cy: 880, r: 1.5, delay: 1.7 },
]

function StarField() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0, opacity: 0.55,
      }}
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="blob1" cx="20%" cy="20%" r="40%">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="blob2" cx="80%" cy="75%" r="40%">
          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="1000" fill="url(#blob1)" />
      <rect width="1000" height="1000" fill="url(#blob2)" />
      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.cx} cy={s.cy} r={s.r}
          fill="#A78BFA"
          style={{
            animationDelay: `${s.delay}s`,
            animation: 'pulseDot 3s ease-in-out infinite',
          }}
        />
      ))}
    </svg>
  )
}

export default function PageWrapper({ children, noStars = false }) {
  return (
    <div style={{ minHeight: '100vh', background: '#070714', position: 'relative' }}>
      {!noStars && <StarField />}
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, paddingTop: '64px' }}>
        <div className="page-container py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
