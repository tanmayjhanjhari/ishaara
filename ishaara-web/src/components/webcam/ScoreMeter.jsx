import React from 'react'

export function updateMeter(meterRef, score) {
  const color = score >= 90 ? '#4f46e5'
              : score >= 70 ? '#10b981'
              : score >= 50 ? '#f59e0b'
              : '#e5e7eb'
  
  if (meterRef.current) {
    meterRef.current.style.width = `${score}%`
    meterRef.current.style.backgroundColor = color
  }

  const scoreText = document.getElementById('score-meter-value')
  if (scoreText) {
    scoreText.textContent = `${score}%`
    scoreText.style.color = score >= 50 ? color : '#9ca3af'
  }
}

export default function ScoreMeter({ meterRef }) {
  return (
    <div className="mt-3 w-full">
      <div className="flex justify-between mb-1">
        <span className="text-xs text-gray-400 font-medium">Confidence</span>
        <span id="score-meter-value" className="text-xs text-gray-400 font-bold">
          0%
        </span>
      </div>
      <div className="bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden w-full">
        <div
          ref={meterRef}
          className="h-full rounded-full transition-colors duration-200"
          style={{ width: '0%', backgroundColor: '#e5e7eb' }}
        />
      </div>
    </div>
  )
}
