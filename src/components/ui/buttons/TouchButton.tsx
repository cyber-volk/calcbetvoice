import React from 'react'
import { LucideIcon } from 'lucide-react'

interface TouchButtonProps {
  icon: LucideIcon
  onClick: () => void
  variant: 'primary' | 'secondary'
  label: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function TouchButton({
  icon: Icon,
  onClick,
  variant,
  label,
  disabled = false,
  type = 'button'
}: TouchButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        p-3 rounded-full touch-manipulation
        ${variant === 'primary' 
          ? 'bg-blue-500 text-white hover:bg-blue-600' 
          : 'text-gray-500 hover:text-gray-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      title={label}
    >
      <Icon size={24} />
    </button>
  )
} 