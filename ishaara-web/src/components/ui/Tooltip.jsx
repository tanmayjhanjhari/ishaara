import { useState, useRef } from 'react'

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrows = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-2 border-l-transparent border-r-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-2 border-l-transparent border-r-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-2 border-t-transparent border-b-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-2 border-t-transparent border-b-transparent border-l-transparent',
}

export default function Tooltip({
  children,
  content,
  position = 'top',
}) {
  const [show, setShow] = useState(false)
  const timeoutRef = useRef(null)

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setShow(true), 300)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setShow(false)
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {show && content && (
        <div 
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-text-primary bg-surface-2 rounded-lg whitespace-nowrap shadow-card ${positions[position]}`}
          role="tooltip"
        >
          {content}
          <div 
            className={`absolute border-4 w-0 h-0 ${arrows[position]}`} 
          />
        </div>
      )}
    </div>
  )
}
