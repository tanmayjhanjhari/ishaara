export default function Divider({ label, orientation = 'horizontal', className = '' }) {
  if (orientation === 'vertical') {
    return <div className={`h-full border-l border-border inline-block ${className}`} />
  }

  if (label) {
    return (
      <div className={`flex items-center w-full ${className}`}>
        <div className="flex-grow border-t border-border" />
        <span className="px-4 text-sm text-text-muted font-medium">{label}</span>
        <div className="flex-grow border-t border-border" />
      </div>
    )
  }

  return <hr className={`border-t border-border w-full ${className}`} />
}
