import { useCallback } from 'react'
import { VoiceLanguage } from '@/types/voice'
import { MESSAGES } from '@/constants/voice'
import { processVoiceInput } from '@/utils/voiceProcessor'

type SetStateCallback = (value: string) => void

export function useVoiceRecognition(
  voiceLanguage: VoiceLanguage,
  setIsListening: (value: boolean) => void
) {
  const handleVoiceInput = useCallback((callback: SetStateCallback, isNumberField: boolean = true) => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use Chrome.')
      return
    }

    // @ts-ignore - webkitSpeechRecognition is not in TypeScript types
    const recognition = new webkitSpeechRecognition()
    
    recognition.lang = voiceLanguage
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    setIsListening(true)

    recognition.onstart = () => {
      console.log('Voice recognition started')
    }

    recognition.onresult = (event: any) => {
      const results = event.results
      let finalTranscript = ''

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.isFinal) {
          finalTranscript = result[0].transcript
          const processedValue = isNumberField 
            ? processVoiceInput(finalTranscript, true)
            : finalTranscript.trim()
          callback(processedValue)
          setIsListening(false)
          recognition.stop()
          break
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      alert(MESSAGES[voiceLanguage].error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    try {
      recognition.start()
    } catch (error) {
      console.error('Recognition start error:', error)
      setIsListening(false)
      alert(MESSAGES[voiceLanguage].error)
    }
  }, [voiceLanguage, setIsListening])

  return handleVoiceInput
} 