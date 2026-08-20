import React from 'react'

export function updateHint(hintRef, hint) {
  if (!hintRef || !hintRef.current || !hint) return
  const { text, color, pulse } = hint
  
  const textEl = hintRef.current.querySelector('.hint-text')
  if (textEl) {
    textEl.textContent = text
  }

  hintRef.current.className = [
    'hint-container',
    `hint-${color}`,
    pulse ? 'hint-pulse' : ''
  ].join(' ')
}

export default function LiveHint({ hintRef }) {
  return (
    <div 
      ref={hintRef} 
      className="hint-container hint-amber"
    >
      <span className="hint-icon" />
      <span className="hint-text">Show your hand to the camera</span>
    </div>
  )
}
