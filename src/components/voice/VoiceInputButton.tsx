import { Mic } from 'lucide-react'
import { VoiceLanguage } from '@/types/voice'

interface VoiceInputButtonProps {
  onVoiceInput: () => void
  showButton: boolean
  voiceLanguage: VoiceLanguage
}

export function VoiceInputButton({ onVoiceInput, showButton, voiceLanguage }: VoiceInputButtonProps) {
  if (!showButton || voiceLanguage === 'none') return null

  return (
    <button
      type="button"
      onClick={onVoiceInput}
      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      title="Click to use voice input"
    >
      <Mic size={20} />
    </button>
  )
} 