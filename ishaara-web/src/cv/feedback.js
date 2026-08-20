export function getLiveHint(smoothedScore, isHandDetected) {
  if (!isHandDetected || smoothedScore === 0) {
    return {
      text:  'Show your hand to the camera',
      color: 'amber',
      pulse: false
    }
  }
  if (smoothedScore < 30) {
    return {
      text:  'Try matching the reference sign',
      color: 'red',
      pulse: false
    }
  }
  if (smoothedScore < 50) {
    return {
      text:  'Almost — adjust your finger positions',
      color: 'amber',
      pulse: false
    }
  }
  return {
    text:  'Hold steady...',
    color: 'green',
    pulse: true
  }
}

export function getPostAttemptTip(score) {
  if (score >= 70) return null  // success — no tip needed

  const tips = {
    low: [
      'Make sure your hand is clearly visible to the camera',
      'Try forming the sign more deliberately',
      'Check your lighting — a brighter room helps',
    ],
    mid: [
      'Check your finger positions against the reference sign',
      'Try adjusting your hand angle slightly',
      'You\'re close — look at where your fingers are curled',
    ],
    close: [
      'Good shape! Hold the sign more steadily',
      'Almost there — your wrist position may be slightly off',
      'Try holding the sign for just a moment longer',
    ]
  }

  const band = score < 30 ? 'low' : score < 50 ? 'mid' : 'close'
  const list = tips[band]
  // Return a deterministic tip based on score (not random — reproducible)
  return list[Math.floor(score / 10) % list.length]
}

export function getLessonInsight(signResults) {
  // signResults: array of { sign, score, attempts }
  if (!signResults.length) return null

  const successful = signResults.filter(r => r.score >= 70)
  const sorted     = [...signResults].sort((a, b) => b.score - a.score)

  return {
    bestSign:     sorted[0],
    weakestSign:  sorted[sorted.length - 1],
    successCount: successful.length,
    totalCount:   signResults.length,
    successRate:  Math.round((successful.length / signResults.length) * 100)
  }
}
