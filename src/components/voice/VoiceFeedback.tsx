import { VoiceLanguage } from '@/types/voice'
import { MESSAGES } from '@/constants/voice'

interface VoiceFeedbackProps {
  isListening: boolean
  language: VoiceLanguage
}

export function VoiceFeedback({ isListening, language }: VoiceFeedbackProps) {
  if (!isListening) return null

  const messages = MESSAGES[language]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-lg mb-3">{messages.listening}</p>
        <p className="text-sm text-gray-600 mb-3">{messages.speak}</p>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full delay-75" />
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full delay-150" />
        </div>
      </div>
    </div>
  )
} 