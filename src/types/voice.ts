export type VoiceLanguage = 'none' | 'ar-SA' | 'fr-FR' | 'en-US'

export interface LanguageOption {
  code: VoiceLanguage
  label: string
  flag: string
}

export interface VoiceMessages {
  listening: string
  speak: string
  error: string
}

export type VoiceMessagesMap = Record<VoiceLanguage, VoiceMessages> 