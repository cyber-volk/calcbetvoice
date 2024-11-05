import { LucideIcon } from 'lucide-react'

interface TouchButtonProps {
  onClick: () => void
  icon?: LucideIcon
  label?: string
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
}

export function TouchButton({
  onClick,
  icon: Icon,
  label,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button'
}: TouchButtonProps) {
  const baseStyles = 'flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors touch-manipulation'
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {Icon && <Icon size={20} />}
      {label && <span>{label}</span>}
    </button>
  )
} 