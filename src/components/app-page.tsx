'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Mic, Trash, Plus, Languages } from 'lucide-react'

type ErrorKeys = 'fond' | 'soldeALinstant' | 'soldeDeDebut' | 'credit' | 'creditPayee' | 'depense' | 'retrait'

type Errors = Record<ErrorKeys, string>

interface CreditRow {
  totalClient: string
  details: string
  client: string
}

interface CreditPayeeRow {
  totalPayee: string
  details: string
  client: string
}

interface DepenseRow {
  totalDepense: string
  details: string
  client: string
}

interface RetraitRow {
  retraitPayee: string
  retrait: string
  client: string
}

type RowField = {
  credit: keyof CreditRow
  creditPayee: keyof CreditPayeeRow
  depense: keyof DepenseRow
  retrait: keyof RetraitRow
}

// Move these functions outside the Page component
const processVoiceInput = (transcript: string, isNumberField: boolean = true): string => {
  if (!isNumberField) {
    // For non-number fields (client names, site), return the raw transcript
    return transcript.trim()
  }

  // Convert both Arabic and French number words to digits
  const numberWords: { [key: string]: string } = {
    // French numbers
    'zéro': '0', 'un': '1', 'deux': '2', 'trois': '3', 'quatre': '4',
    'cinq': '5', 'six': '6', 'sept': '7', 'huit': '8', 'neuf': '9',
    'dix': '10', 'onze': '11', 'douze': '12', 'treize': '13', 'quatorze': '14',
    'quinze': '15', 'seize': '16', 'vingt': '20', 'trente': '30',
    'quarante': '40', 'cinquante': '50', 'soixante': '60',
    'soixante-dix': '70', 'quatre-vingt': '80', 'quatre-vingt-dix': '90',
    'cent': '100', 'cents': '100', 'mille': '1000',
    
    // Modern Arabic numbers as words
    'صفر': '0', 'واحد': '1', 'اثنين': '2', 'ثلاثة': '3', 'اربعة': '4',
    'خمسة': '5', 'ستة': '6', 'سبعة': '7', 'ثمانية': '8', 'تسعة': '9',
    'عشرة': '10', 'عشرين': '20', 'ثلاثين': '30', 'اربعين': '40',
    'خمسين': '50', 'ستين': '60', 'سبعين': '70', 'ثمانين': '80',
    'تسعين': '90', 'مية': '100', 'الف': '1000'
  }

  // Clean up the transcript
  let processed = transcript.toLowerCase().trim()

  // Replace common speech recognition errors in both languages
  const corrections: { [key: string]: string } = {
    // French corrections
    'virgule': '.',
    'point': '.',
    'plus': '+',
    'et': '+',
    'euro': '',
    'euros': '',
    'zéros': 'zéro',
    'OK': 'ok',
    
    // Arabic corrections
    'فاصلة': '.',
    'نقطة': '.',
    'زائد': '+',
    'و': '+',
    'دينار': '',
    'دنانير': '',
    'موافق': 'ok',
    'نعم': 'ok'
  }

  // Convert Eastern Arabic numerals to Western Arabic numerals
  const arabicToEnglishNumbers: { [key: string]: string } = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  }

  // Handle French compound numbers (e.g., "cinq cents" = 500)
  const matches = processed.match(/(\w+)\s+cents?/g)
  if (matches) {
    matches.forEach(match => {
      const [number] = match.split(/\s+/)
      if (numberWords[number]) {
        const value = parseInt(numberWords[number]) * 100
        processed = processed.replace(match, value.toString())
      }
    })
  }

  // Convert Arabic numbers to English numbers
  Object.entries(arabicToEnglishNumbers).forEach(([arabic, english]) => {
    processed = processed.replace(new RegExp(arabic, 'g'), english)
  })

  // Apply corrections
  Object.entries(corrections).forEach(([key, value]) => {
    processed = processed.replace(new RegExp(key, 'g'), value)
  })

  // Convert number words to digits
  Object.entries(numberWords).forEach(([word, digit]) => {
    processed = processed.replace(new RegExp(`\\b${word}\\b`, 'g'), digit)
  })

  // Handle decimal numbers (both . and ,)
  processed = processed.replace(/(\d+)[.,](\d+)/g, '$1.$2')

  // Handle additions
  processed = processed.replace(/(\d+)\s*\+\s*(\d+)/g, '$1+$2')

  // For details field, preserve existing value
  if (processed.includes('+')) {
    return processed
  }

  // Clean up any remaining non-numeric characters except . and +
  processed = processed.replace(/[^\d.+]/g, '')

  return processed
}

// Add language-specific messages
const MESSAGES = {
  'none': {
    listening: 'Listening...',
    speak: 'Please speak clearly',
    error: 'Voice recognition error. Please try again.'
  },
  'ar-SA': {
    listening: 'جاري الاستماع...',
    speak: 'تحدث بوضوح من فضلك',
    error: 'خطأ في التعرف على الصوت. حاول مرة أخرى'
  },
  'fr-FR': {
    listening: 'Écoute en cours...',
    speak: 'Parlez clairement s\'il vous plaît',
    error: 'Erreur de reconnaissance vocale. Veuillez réessayer.'
  },
  'en-US': {
    listening: 'Listening...',
    speak: 'Please speak clearly',
    error: 'Voice recognition error. Please try again.'
  }
}

// Update the VoiceFeedback component
function VoiceFeedback({ 
  isListening, 
  language 
}: { 
  isListening: boolean
  language: VoiceLanguage 
}) {
  if (!isListening) return null

  const messages = MESSAGES[language]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <p className="text-lg mb-3">{messages.listening}</p>
        <p className="text-sm text-gray-600 mb-3">
          {messages.speak}
        </p>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full" />
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full delay-75" />
          <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full delay-150" />
        </div>
      </div>
    </div>
  )
}

// Update the VoiceInputButton component
function VoiceInputButton({ 
  onVoiceInput,
  showButton,
  voiceLanguage
}: { 
  onVoiceInput: () => void
  showButton: boolean
  voiceLanguage: VoiceLanguage
}) {
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

// Update the type definitions at the top
type SetStateCallback = (value: string) => void
type UpdateRowCallback = (value: string) => void

// Add this type after your existing types
type VoiceLanguage = 'none' | 'ar-SA' | 'fr-FR' | 'en-US'

// Add this interface
interface LanguageOption {
  code: VoiceLanguage
  label: string
  flag: string
}

// Add this constant outside the component
const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'none', label: 'No Voice Input', flag: '🔇' },
  { code: 'ar-SA', label: 'العربية', flag: '🇸🇦' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'en-US', label: 'English', flag: '🇺🇸' }
]

// Add this component outside the Page component
function LanguageSelector({ 
  selectedLanguage, 
  onLanguageChange 
}: { 
  selectedLanguage: VoiceLanguage
  onLanguageChange: (lang: VoiceLanguage) => void 
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Languages size={20} />
        <span>{LANGUAGE_OPTIONS.find(lang => lang.code === selectedLanguage)?.flag}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onLanguageChange(lang.code)
                setIsOpen(false)
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 ${
                selectedLanguage === lang.code ? 'bg-gray-50' : ''
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Add this at the top with other constants
const DUMMY_CREDENTIALS = {
  user: { username: 'user', password: 'user123' },
  agent: { username: 'agent', password: 'agent123' }
}

export function Page() {
  // Authentication state
  const [isAuth, setIsAuth] = useState(false)
  const [userRole, setUserRole] = useState<'user' | 'agent' | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculator state
  const [timestamp, setTimestamp] = useState('')
  const [multiplier, setMultiplier] = useState('1.1')
  const [fond, setFond] = useState('')
  const [soldeALinstant, setSoldeALinstant] = useState('')
  const [site, setSite] = useState('')
  const [soldeDeDebut, setSoldeDeDebut] = useState('')
  const [creditRows, setCreditRows] = useState<CreditRow[]>([{ totalClient: '', details: '', client: '' }])
  const [creditPayeeRows, setCreditPayeeRows] = useState<CreditPayeeRow[]>([{ totalPayee: '', details: '', client: '' }])
  const [depenseRows, setDepenseRows] = useState<DepenseRow[]>([{ totalDepense: '', details: '', client: '' }])
  const [retraitRows, setRetraitRows] = useState<RetraitRow[]>([{ retraitPayee: '', retrait: '', client: '' }])
  const [result, setResult] = useState('')
  const [errors, setErrors] = useState<Errors>({
    fond: '',
    soldeALinstant: '',
    soldeDeDebut: '',
    credit: '',
    creditPayee: '',
    depense: '',
    retrait: ''
  })
  const [isListening, setIsListening] = useState(false)

  // Add this state for language selection
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('none')

  // Update handleVoiceInput to use the selected language
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
  }, [voiceLanguage])

  // Update the handleVoiceInputWithFeedback function
  const handleVoiceInputWithFeedback = useCallback((
    callback: SetStateCallback | UpdateRowCallback,
    isNumberField: boolean = true
  ) => {
    setIsListening(true)
    handleVoiceInput((value: string) => {
      if (isNumberField) {
        // For number fields, we need to handle the value directly
        callback(value)
      } else {
        // For text fields, just pass the value
        callback(value)
      }
      setIsListening(false)
    }, isNumberField)
  }, [handleVoiceInput])

  const validateInput = (value: string, errorKey: ErrorKeys, isMandatory = false) => {
    let parsedValue: number | null = null
    const newErrors = { ...errors }

    if (errorKey === 'soldeALinstant' || errorKey === 'soldeDeDebut') {
      const numbers = value.split('+').map(num => parseFloat(num.trim())).filter(num => !isNaN(num))
      parsedValue = numbers.reduce((acc, num) => acc + num, 0)
    } else {
      parsedValue = parseFloat(value)
    }

    if (value === '' && !isMandatory) {
      newErrors[errorKey] = ''
      setErrors(newErrors)
      return 0
    } else if (isMandatory && (value === '' || parsedValue === 0 || isNaN(parsedValue))) {
      newErrors[errorKey] = 'svp insérer un solde de début'
      setErrors(newErrors)
      return null
    } else if (isNaN(parsedValue)) {
      newErrors[errorKey] = 'Please enter a valid number'
      setErrors(newErrors)
      return null
    }

    newErrors[errorKey] = ''
    setErrors(newErrors)
    return parsedValue
  }

  const calculateRowTotal = (strInput: string) => {
    const numbers = strInput.split('+').map(num => parseFloat(num.trim())).filter(num => !isNaN(num))
    return numbers.reduce((acc, num) => acc + num, 0)
  }

  const addRow = (tableType: 'credit' | 'creditPayee' | 'depense' | 'retrait') => {
    switch (tableType) {
      case 'credit':
        setCreditRows([...creditRows, { totalClient: '', details: '', client: '' }])
        break
      case 'creditPayee':
        setCreditPayeeRows([...creditPayeeRows, { totalPayee: '', details: '', client: '' }])
        break
      case 'depense':
        setDepenseRows([...depenseRows, { totalDepense: '', details: '', client: '' }])
        break
      case 'retrait':
        setRetraitRows([...retraitRows, { retraitPayee: '', retrait: '', client: '' }])
        break
    }
  }

  const removeRow = (tableType: 'credit' | 'creditPayee' | 'depense' | 'retrait', index: number) => {
    switch (tableType) {
      case 'credit':
        if (creditRows.length > 1) {
          const newRows = [...creditRows]
          newRows.splice(index, 1)
          setCreditRows(newRows)
        }
        break
      case 'creditPayee':
        if (creditPayeeRows.length > 1) {
          const newRows = [...creditPayeeRows]
          newRows.splice(index, 1)
          setCreditPayeeRows(newRows)
        }
        break
      case 'depense':
        if (depenseRows.length > 1) {
          const newRows = [...depenseRows]
          newRows.splice(index, 1)
          setDepenseRows(newRows)
        }
        break
      case 'retrait':
        if (retraitRows.length > 1) {
          const newRows = [...retraitRows]
          newRows.splice(index, 1)
          setRetraitRows(newRows)
        }
        break
    }
  }

  const updateRow = (
    tableType: keyof RowField,
    index: number,
    field: RowField[typeof tableType],
    value: string
  ) => {
    switch (tableType) {
      case 'credit':
        const newCreditRows = [...creditRows]
        ;(newCreditRows[index] as any)[field] = value
        if (field === 'details') {
          newCreditRows[index].totalClient = calculateRowTotal(value).toFixed(1)
        }
        setCreditRows(newCreditRows)
        break
      case 'creditPayee':
        const newCreditPayeeRows = [...creditPayeeRows]
        ;(newCreditPayeeRows[index] as any)[field] = value
        if (field === 'details') {
          newCreditPayeeRows[index].totalPayee = calculateRowTotal(value).toFixed(1)
        }
        setCreditPayeeRows(newCreditPayeeRows)
        break
      case 'depense':
        const newDepenseRows = [...depenseRows]
        ;(newDepenseRows[index] as any)[field] = value
        if (field === 'details') {
          newDepenseRows[index].totalDepense = calculateRowTotal(value).toFixed(1)
        }
        setDepenseRows(newDepenseRows)
        break
      case 'retrait':
        const newRetraitRows = [...retraitRows]
        ;(newRetraitRows[index] as any)[field] = value
        setRetraitRows(newRetraitRows)
        break
    }
  }

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault()

    const validatedSoldeALinstant = validateInput(soldeALinstant, 'soldeALinstant') || 0
    const validatedFond = validateInput(fond, 'fond') || 0
    const validatedSoldeDeDebut = validateInput(soldeDeDebut, 'soldeDeDebut', true)

    if (validatedSoldeDeDebut === null) return

    const totalRetrait = retraitRows.reduce((total, row) => total + parseFloat(row.retrait || '0'), 0)
    const totalRetraitPayee = retraitRows.reduce((total, row) => {
      if (row.retraitPayee === 'OK') {
        return total + parseFloat(row.retrait || '0')
      }
      return total + parseFloat(row.retraitPayee || '0')
    }, 0)

    const totalCredit = creditRows.reduce((total, row) => total + parseFloat(row.totalClient || '0'), 0)
    const totalCreditPayee = creditPayeeRows.reduce((total, row) => total + parseFloat(row.totalPayee || '0'), 0)
    const totalDepense = depenseRows.reduce((total, row) => total + parseFloat(row.totalDepense || '0'), 0)

    const selectedMultiplier = parseFloat(multiplier)

    const total = ((validatedSoldeDeDebut + totalRetrait) - validatedSoldeALinstant) * selectedMultiplier - totalRetraitPayee - totalDepense - totalCredit + totalCreditPayee + validatedFond

    setResult(`Total: ${total.toFixed(1)}`)

    checkClientBalances()
  }

  const checkClientBalances = () => {
    const newCreditRows = [...creditRows]
    const retraitMap = new Map()

    retraitRows.forEach(row => {
      const clientName = row.client.trim()
      if (clientName) {
        retraitMap.set(clientName, (retraitMap.get(clientName) || 0) + parseFloat(row.retrait || '0'))
      }
    })

    newCreditRows.forEach((row, index) => {
      const clientName = row.client.trim()
      if (!clientName) return

      const creditTotal = parseFloat(row.totalClient) || 0
      const retraitTotal = retraitMap.get(clientName) || 0

      const details = row.details.split('+').map(d => d.trim())

      if (creditTotal === retraitTotal) {
        newCreditRows[index].details = `<span class="line-through">${row.details}</span>`
        newCreditRows[index].totalClient = '0'
      } else if (creditTotal < retraitTotal) {
        newCreditRows[index].details = `<span class="line-through">${row.details}</span>`
        const rest = retraitTotal - creditTotal
        if (confirm(`Le crédit est inférieur au retrait pour ${clientName}. Voulez-vous ajouter le reste (${rest.toFixed(1)}) au crédit payé?`)) {
          setCreditPayeeRows([...creditPayeeRows, { totalPayee: rest.toFixed(1), details: rest.toFixed(1), client: clientName }])
        }
        newCreditRows[index].totalClient = '0'
      } else {
        let remainingRetrait = retraitTotal
        const sortedDetails = details.map(d => parseFloat(d)).sort((a, b) => a - b)
        const newDetails = sortedDetails.map(detail => {
          if (remainingRetrait >= detail) {
            remainingRetrait -= detail
            return `<span class="line-through">${detail.toFixed(1)}</span>`
          } else if (remainingRetrait > 0) {
            const strikethrough = remainingRetrait.toFixed(1)
            const remaining = (detail - remainingRetrait).toFixed(1)
            remainingRetrait = 0
            return `<span class="line-through">${strikethrough}</span> + ${remaining}`
          } else {
            return detail.toFixed(1)
          }
        })
        newCreditRows[index].details = newDetails.join(' + ')
        newCreditRows[index].totalClient = (creditTotal - retraitTotal).toFixed(1)
      }
    })

    setCreditRows(newCreditRows)
  }

  const handleReset = () => {
    setMultiplier('1.1')
    setFond('')
    setSoldeALinstant('')
    setSite('')
    setSoldeDeDebut('')
    setCreditRows([{ totalClient: '', details: '', client: '' }])
    setCreditPayeeRows([{ totalPayee: '', details: '', client: '' }])
    setDepenseRows([{ totalDepense: '', details: '', client: '' }])
    setRetraitRows([{ retraitPayee: '', retrait: '', client: '' }])
    setResult('')
    setVoiceLanguage('none') // Reset voice language
    setErrors({
      fond: '',
      soldeALinstant: '',
      soldeDeDebut: '',
      credit: '',
      creditPayee: '',
      depense: '',
      retrait: ''
    })
  }

  // Update the useEffect for authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Simple localStorage check without error handling
        const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true'
        const role = localStorage.getItem('userRole') as 'user' | 'agent' | null
        setIsAuth(isAuthenticated)
        setUserRole(role)
        setIsLoading(false)
      } catch {
        // If anything fails, just set to not authenticated
        setIsAuth(false)
        setUserRole(null)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="container mx-auto bg-white rounded-3xl shadow-lg p-8 mt-12">
      <VoiceFeedback isListening={isListening} language={voiceLanguage} />
      <div id="timestamp" className="text-center mb-4 text-xl text-gray-600">{timestamp}</div>
      <form onSubmit={handleCalculate}>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div>
            <LanguageSelector
              selectedLanguage={voiceLanguage}
              onLanguageChange={setVoiceLanguage}
            />
          </div>
          <div>
            <select
              id="multiplierSelect"
              value={multiplier}
              onChange={(e) => setMultiplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1</option>
              <option value="1.1">1.1</option>
              <option value="1.2">1.2</option>
              <option value="1.3">1.3</option>
            </select>
          </div>
          <div>
            <div className="relative">
              <input
                type="number"
                id="fond"
                value={fond}
                onChange={(e) => setFond(e.target.value)}
                placeholder="Fond"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <VoiceInputButton 
                onVoiceInput={() => handleVoiceInputWithFeedback(setFond)}
                showButton={voiceLanguage !== 'none'}
                voiceLanguage={voiceLanguage}
              />
            </div>
            {errors.fond && <span className="text-red-500 text-sm">{errors.fond}</span>}
          </div>
          <div>
            <label htmlFor="solde_a_linstant" className="block text-sm font-medium text-gray-700 mb-1">Solde à l'instant</label>
            <div className="relative">
              <input
                type="text"
                id="solde_a_linstant"
                value={soldeALinstant}
                onChange={(e) => setSoldeALinstant(e.target.value)}
                placeholder="Solde à l'instant"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <VoiceInputButton 
                onVoiceInput={() => handleVoiceInputWithFeedback(setSoldeALinstant)}
                showButton={voiceLanguage !== 'none'}
                voiceLanguage={voiceLanguage}
              />
            </div>
            {errors.soldeALinstant && <span className="text-red-500 text-sm">{errors.soldeALinstant}</span>}
          </div>
          <div>
            <div className="relative">
              <input
                
                type="text"
                id="site"
                value={site}
                onChange={(e) => setSite(e.target.value)}
                placeholder="Site"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <VoiceInputButton 
                onVoiceInput={() => handleVoiceInputWithFeedback(setSite, false)}
                showButton={voiceLanguage !== 'none'}
                voiceLanguage={voiceLanguage}
              />
            </div>
          </div>
          <div>
            <label htmlFor="solde_de_debut" className="block text-sm font-medium text-gray-700 mb-1">Solde de début</label>
            <div className="relative">
              <input
                type="text"
                id="solde_de_debut"
                value={soldeDeDebut}
                onChange={(e) => setSoldeDeDebut(e.target.value)}
                placeholder="Solde de début"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <VoiceInputButton 
                onVoiceInput={() => handleVoiceInputWithFeedback(setSoldeDeDebut)}
                showButton={voiceLanguage !== 'none'}
                voiceLanguage={voiceLanguage}
              />
            </div>
            {errors.soldeDeDebut && <span className="text-red-500 text-sm">{errors.soldeDeDebut}</span>}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Crédit</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">Total Client</th>
                <th className="border border-gray-300 px-4 py-2">Détailles</th>
                <th className="border border-gray-300 px-4 py-2">Client</th>
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {creditRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => removeRow('credit', index)} className="text-red-500 hover:text-red-700">
                      <Trash size={20} />
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={row.totalClient}
                      readOnly
                      className="w-full px-2 py-1 border-none bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.details}
                        onChange={(e) => updateRow('credit', index, 'details', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('credit', index, 'details', value),
                          true
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.client}
                        onChange={(e) => updateRow('credit', index, 'client', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('credit', index, 'client', value),
                          false
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => addRow('credit')} className="text-green-500 hover:text-green-700">
                      <Plus size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.credit && <span className="text-red-500 text-sm">{errors.credit}</span>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Crédit Payée</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">Total Payée</th>
                <th className="border border-gray-300 px-4 py-2">Détailles</th>
                <th className="border border-gray-300 px-4 py-2">Client</th>
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {creditPayeeRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => removeRow('creditPayee', index)} className="text-red-500 hover:text-red-700">
                      <Trash size={20} />
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={row.totalPayee}
                      readOnly
                      className="w-full px-2 py-1 border-none bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.details}
                        onChange={(e) => updateRow('creditPayee', index, 'details', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('creditPayee', index, 'details', value),
                          true
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.client}
                        onChange={(e) => updateRow('creditPayee', index, 'client', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('creditPayee', index, 'client', value),
                          false
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => addRow('creditPayee')} className="text-green-500 hover:text-green-700">
                      <Plus size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.creditPayee && <span className="text-red-500 text-sm">{errors.creditPayee}</span>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Dépense</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">Total Dépense</th>
                <th className="border border-gray-300 px-4 py-2">Détailles</th>
                <th className="border border-gray-300 px-4 py-2">Client</th>
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {depenseRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => removeRow('depense', index)} className="text-red-500 hover:text-red-700">
                      <Trash size={20} />
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      value={row.totalDepense}
                      readOnly
                      className="w-full px-2 py-1 border-none bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.details}
                        onChange={(e) => updateRow('depense', index, 'details', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('depense', index, 'details', value),
                          true
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.client}
                        onChange={(e) => updateRow('depense', index, 'client', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('depense', index, 'client', value),
                          false
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => addRow('depense')} className="text-green-500 hover:text-green-700">
                      <Plus size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {errors.depense && <span className="text-red-500 text-sm">{errors.depense}</span>}
        </div>

        <div className="mb-6">
          <label className="block text-lg font-medium text-gray-700 mb-2">Retrait</label>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">Retrait Payée</th>
                <th className="border border-gray-300 px-4 py-2">Retrait</th>
                <th className="border border-gray-300 px-4 py-2">Client</th>
                <th className="border border-gray-300 px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {retraitRows.map((row, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => removeRow('retrait', index)} className="text-red-500 hover:text-red-700">
                      <Trash size={20} />
                    </button>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.retraitPayee}
                        onChange={(e) => updateRow('retrait', index, 'retraitPayee', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('retrait', index, 'retraitPayee', value),
                          true
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.retrait}
                        onChange={(e) => updateRow('retrait', index, 'retrait', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('retrait', index, 'retrait', value),
                          true
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={row.client}
                        onChange={(e) => updateRow('retrait', index, 'client', e.target.value)}
                        className="w-full px-2 py-1 pr-8 border-none"
                      />
                      <VoiceInputButton 
                        onVoiceInput={() => handleVoiceInputWithFeedback(
                          (value: string) => updateRow('retrait', index, 'client', value),
                          false
                        )}
                        showButton={voiceLanguage !== 'none'}
                        voiceLanguage={voiceLanguage}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <button type="button" onClick={() => addRow('retrait')} className="text-green-500 hover:text-green-700">
                      <Plus size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-2">
            <div>
              <strong>Total Retrait: </strong>
              <span id="totalRetrait">
                {retraitRows.reduce((total, row) => total + parseFloat(row.retrait || '0'), 0).toFixed(1)}
              </span>
            </div>
            <div>
              <strong>Total Retrait Payée: </strong>
              <span id="totalRetraitPayee">
                {retraitRows.reduce((total, row) => {
                  if (row.retraitPayee === 'OK') {
                    return total + parseFloat(row.retrait || '0')
                  }
                  return total + parseFloat(row.retraitPayee || '0')
                }, 0).toFixed(1)}
              </span>
            </div>
          </div>
          {errors.retrait && <span className="text-red-500 text-sm">{errors.retrait}</span>}
        </div>

        <div className="flex items-center mt-6">
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Calcule
          </button>
          <div className="flex-grow">
            <h2 id="res" className="text-center text-3xl font-bold text-green-600">{result}</h2>
          </div>
          <button type="button" onClick={handleReset} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}