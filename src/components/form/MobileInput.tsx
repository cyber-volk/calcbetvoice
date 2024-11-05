import { VoiceInputButton } from '@/components/voice/VoiceInputButton'
import { VoiceLanguage } from '@/types/voice'

interface MobileInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number'
  placeholder?: string
  required?: boolean
  readOnly?: boolean
  error?: string
  voiceEnabled?: boolean
  voiceLanguage?: VoiceLanguage
  onVoiceInput?: () => void
}

export function MobileInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  readOnly = false,
  error,
  voiceEnabled = false,
  voiceLanguage = 'none',
  onVoiceInput
}: MobileInputProps) {
  return (
    <div className="relative space-y-1">
      <label 
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          className={`
            w-full px-4 py-3 
            border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${readOnly ? 'bg-gray-50' : ''}
            ${error ? 'border-red-500' : 'border-gray-300'}
            touch-manipulation
          `}
        />
        {voiceEnabled && onVoiceInput && (
          <VoiceInputButton
            onVoiceInput={onVoiceInput}
            showButton={voiceLanguage !== 'none'}
            voiceLanguage={voiceLanguage}
          />
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  )
} 