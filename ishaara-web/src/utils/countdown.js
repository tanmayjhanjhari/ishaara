import { useState, useEffect } from 'react'

export function useCountdown(totalSeconds) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (remaining <= 0) return
    const interval = setInterval(() => {
      setRemaining(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [remaining])

  const days    = Math.floor(remaining / 86400)
  const hours   = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = remaining % 60

  return { days, hours, minutes, seconds, remaining }
}

export function formatCountdown(days, hours, minutes) {
  if (days > 0)  return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}
