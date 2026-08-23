import { memo } from 'react'
import { Card } from '../ui'

const SignCard = memo(function SignCard({ sign, size = 'lg' }) {
  if (!sign) return null

  const isLg = size === 'lg'

  return (
    <Card className={isLg ? 'p-6' : 'p-3'}>
      {/* Visual area */}
      <div
        className={`relative rounded-xl overflow-hidden flex items-center justify-center ${
          isLg ? 'aspect-square' : 'aspect-square'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.06))',
          border: '1px solid rgba(167,139,250,0.15)',
        }}
      >
        {sign.video_url ? (
          <video
            src={sign.video_url}
            muted
            loop
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="font-outfit font-black text-primary-light select-none"
            style={{ fontSize: isLg ? '6rem' : '2.5rem', lineHeight: 1, textShadow: '0 0 40px rgba(167,139,250,0.4)' }}
          >
            {sign.label}
          </span>
        )}

        {/* Corner brackets */}
        {isLg && ['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(pos => {
          const isTop  = pos.includes('top')
          const isLeft = pos.includes('left')
          return (
            <div key={pos} className="absolute w-5 h-5" style={{
              top:    isTop    ? 10 : 'auto',
              bottom: !isTop   ? 10 : 'auto',
              left:   isLeft   ? 10 : 'auto',
              right:  !isLeft  ? 10 : 'auto',
              borderTop:    isTop    ? '2px solid rgba(167,139,250,0.4)' : 'none',
              borderBottom: !isTop   ? '2px solid rgba(167,139,250,0.4)' : 'none',
              borderLeft:   isLeft   ? '2px solid rgba(167,139,250,0.4)' : 'none',
              borderRight:  !isLeft  ? '2px solid rgba(167,139,250,0.4)' : 'none',
            }} />
          )
        })}
      </div>

      {/* Label */}
      <div className={`text-center mt-3 ${isLg ? 'text-xl font-bold text-text-primary' : 'text-sm font-semibold text-text-muted'}`}>
        {sign.label}
      </div>
      {isLg && (
        <div className="text-center text-xs text-text-dim mt-1 capitalize">{sign.category}</div>
      )}
    </Card>
  )
})

export default SignCard
