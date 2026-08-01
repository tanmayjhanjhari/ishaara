import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  name,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  helperText,
  required = false,
  icon: Icon,
  className = '',
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const baseInput = 'w-full rounded-lg bg-surface-2/40 backdrop-blur-sm text-text-primary placeholder-text-dim/70 transition-colors duration-200 focus:outline-none focus:ring-1'
  const sizeInput = `py-2 pr-4 ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : ''}`
  
  let stateClasses = 'border border-white/5 focus:border-primary/50 focus:ring-primary/30 focus:bg-surface-2/60'
  if (error) {
    stateClasses = 'border border-error/40 focus:border-error focus:ring-error/30'
  }
  if (disabled) {
    stateClasses = 'opacity-50 cursor-not-allowed border-transparent'
  }

  const actualId = id || name

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={actualId} className="text-sm font-medium text-text-muted">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none z-10">
            <Icon size={16} />
          </div>
        )}
        <input
          id={actualId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInput} border ${stateClasses} ${sizeInput}`}
        />
        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary focus:outline-none z-10"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error ? (
        <p className="text-sm text-error">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-text-dim">{helperText}</p>
      ) : null}
    </div>
  )
}
