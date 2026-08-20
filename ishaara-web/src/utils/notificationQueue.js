import { useState, useEffect } from 'react'

export function useNotificationQueue() {
  const [queue, setQueue]   = useState([])
  const [current, setCurrent] = useState(null)

  const enqueue = (notification) => {
    setQueue(prev => [...prev, notification])
  }

  useEffect(() => {
    if (!current && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrent(next)
      setQueue(rest)
    }
  }, [current, queue])

  const dismiss = () => {
    setCurrent(null)  // triggers next item in queue
  }

  return { current, enqueue, dismiss }
}
