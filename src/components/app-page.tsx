'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Mic, Trash, Plus, Languages, RotateCcw, History, Trash2 } from 'lucide-react'
import { VoiceFeedback } from '@/components/voice/VoiceFeedback'
import { VoiceInputButton } from '@/components/voice/VoiceInputButton'
import { LanguageSelector } from '@/components/voice/LanguageSelector'
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition'
import { VoiceLanguage } from '@/types/voice'
import { SetStateCallback, UpdateRowCallback } from '@/types/callbacks'
import { processVoiceInput } from '@/utils/voiceProcessor'
import { MESSAGES } from '@/constants/voice'
import { CalculationForm } from '@/types/site'
import { CalculatorLayout } from '@/components/calculator/CalculatorLayout'

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

interface PageProps {
  siteId: string
  formId: string
  initialData: CalculationForm
  onFormUpdate: (form: CalculationForm) => void
  onDeleteForm: () => void
}

export function Page({ siteId, formId, initialData, onFormUpdate, onDeleteForm }: PageProps) {
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
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('none')
  const [previousFormState, setPreviousFormState] = useState<CalculationForm | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize form with initialData only when formId changes
  useEffect(() => {
    if (initialData) {
      setMultiplier(initialData.multiplier)
      setFond(initialData.fond)
      setSoldeALinstant(initialData.soldeALinstant)
      setSite(initialData.site)
      setSoldeDeDebut(initialData.soldeDeDebut)
      setCreditRows(initialData.creditRows)
      setCreditPayeeRows(initialData.creditPayeeRows)
      setDepenseRows(initialData.depenseRows)
      setRetraitRows(initialData.retraitRows)
      setResult(initialData.result)
    }
  }, [formId]) // Only run when formId changes

  // Update parent component when form is calculated or reset
  const updateParentForm = useCallback(() => {
    const formData: CalculationForm = {
      id: formId,
      multiplier,
      fond,
      soldeALinstant,
      site,
      soldeDeDebut,
      creditRows,
      creditPayeeRows,
      depenseRows,
      retraitRows,
      result,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'default-user'
    }
    onFormUpdate(formData)
  }, [
    formId,
    multiplier,
    fond,
    soldeALinstant,
    site,
    soldeDeDebut,
    creditRows,
    creditPayeeRows,
    depenseRows,
    retraitRows,
    result,
    onFormUpdate
  ])

  // Move all useEffect hooks to the top, before any conditional returns
  useEffect(() => {
    const checkAuth = () => {
      try {
        const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true'
        const role = localStorage.getItem('userRole') as 'user' | 'agent' | null
        setIsAuth(isAuthenticated)
        setUserRole(role)
        setIsLoading(false)
      } catch {
        setIsAuth(false)
        setUserRole(null)
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date()
      setTimestamp(now.toLocaleString())
    }
    updateTimestamp()
    const interval = setInterval(updateTimestamp, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Here you can load site-specific data when siteId changes
    console.log('Site ID changed:', siteId)
    // TODO: Load site-specific form data
  }, [siteId])

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

  // Modify handleCalculate to update parent after calculation
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

    const resultString = `Total: ${total.toFixed(1)}`
    setResult(resultString)

    checkClientBalances()
    
    // Immediately update parent with new result
    const formData: CalculationForm = {
      id: formId,
      multiplier,
      fond,
      soldeALinstant,
      site,
      soldeDeDebut,
      creditRows,
      creditPayeeRows,
      depenseRows,
      retraitRows,
      result: resultString,  // Use the new result
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'default-user'
    }
    onFormUpdate(formData)
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

  // Modify handleReset to update parent after reset
  const handleReset = () => {
    // Store current state before resetting
    setPreviousFormState({
      id: formId,
      multiplier,
      fond,
      soldeALinstant,
      site,
      soldeDeDebut,
      creditRows: [...creditRows],
      creditPayeeRows: [...creditPayeeRows],
      depenseRows: [...depenseRows],
      retraitRows: [...retraitRows],
      result,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || 'default-user'
    })

    // Reset form
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
    setVoiceLanguage('none')
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

  const handleRestore = () => {
    if (!previousFormState) {
      alert("No previous state to restore")
      return
    }

    // Restore previous state
    setMultiplier(previousFormState.multiplier)
    setFond(previousFormState.fond)
    setSoldeALinstant(previousFormState.soldeALinstant)
    setSite(previousFormState.site)
    setSoldeDeDebut(previousFormState.soldeDeDebut)
    setCreditRows(previousFormState.creditRows)
    setCreditPayeeRows(previousFormState.creditPayeeRows)
    setDepenseRows(previousFormState.depenseRows)
    setRetraitRows(previousFormState.retraitRows)
    setResult(previousFormState.result)

    // Clear previous state after restore
    setPreviousFormState(null)
  }

  // Add loading check
  if (isLoading) {
    return <div>Loading...</div>
  }

  // Add auth check
  if (!isAuth || !userRole) {
    return (
      <div className="text-center">
        <p className="text-xl text-red-600">
          Please log in to access the calculator.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto bg-white rounded-3xl shadow-lg p-4 md:p-8 mt-6 md:mt-12">
      <VoiceFeedback isListening={isListening} language={voiceLanguage} />
      
      {/* Mobile-friendly header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div id="timestamp" className="text-center text-lg md:text-xl text-gray-600">
          {timestamp}
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <LanguageSelector
            selectedLanguage={voiceLanguage}
            onLanguageChange={setVoiceLanguage}
          />
          <select
            id="multiplierSelect"
            value={multiplier}
            onChange={(e) => setMultiplier(e.target.value)}
            className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1</option>
            <option value="1.1">1.1</option>
            <option value="1.2">1.2</option>
            <option value="1.3">1.3</option>
          </select>
        </div>
      </div>

      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Mobile-friendly input grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="number"
              id="fond"
              value={fond}
              onChange={(e) => setFond(e.target.value)}
              placeholder="Fond"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <VoiceInputButton 
              onVoiceInput={() => handleVoiceInputWithFeedback(setFond)}
              showButton={voiceLanguage !== 'none'}
              voiceLanguage={voiceLanguage}
            />
            {errors.fond && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.fond}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              id="solde_a_linstant"
              value={soldeALinstant}
              onChange={(e) => setSoldeALinstant(e.target.value)}
              placeholder="Solde à l'instant"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <VoiceInputButton 
              onVoiceInput={() => handleVoiceInputWithFeedback(setSoldeALinstant)}
              showButton={voiceLanguage !== 'none'}
              voiceLanguage={voiceLanguage}
            />
            {errors.soldeALinstant && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.soldeALinstant}
              </span>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={site}
              readOnly
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
              placeholder="Site"
            />
            <VoiceInputButton 
              onVoiceInput={() => handleVoiceInputWithFeedback(setSite, false)}
              showButton={voiceLanguage !== 'none'}
              voiceLanguage={voiceLanguage}
            />
          </div>

          <div className="relative">
            <input
              type="text"
              id="solde_de_debut"
              value={soldeDeDebut}
              onChange={(e) => setSoldeDeDebut(e.target.value)}
              placeholder="Solde de début"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <VoiceInputButton 
              onVoiceInput={() => handleVoiceInputWithFeedback(setSoldeDeDebut)}
              showButton={voiceLanguage !== 'none'}
              voiceLanguage={voiceLanguage}
            />
            {errors.soldeDeDebut && (
              <span className="text-red-500 text-sm mt-1 block">
                {errors.soldeDeDebut}
              </span>
            )}
          </div>
        </div>

        {/* Mobile-friendly tables */}
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="min-w-[768px] p-4">
            {/* Credit Table */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Crédit
              </label>
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
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
              {errors.credit && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.credit}
                </span>
              )}
            </div>

            {/* Credit Payée Table */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Crédit Payée
              </label>
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
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
              {errors.creditPayee && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.creditPayee}
                </span>
              )}
            </div>

            {/* Dpense Table */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Dpense
              </label>
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
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
              {errors.depense && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.depense}
                </span>
              )}
            </div>

            {/* Retrait Table */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Retrait
              </label>
              <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
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
              {errors.retrait && (
                <span className="text-red-500 text-sm mt-1 block">
                  {errors.retrait}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Mobile-friendly action buttons */}
        <div className="fixed bottom-0 left-0 right-0 md:relative bg-white border-t md:border-t-0 p-4 md:p-0">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="p-3 text-red-500 hover:text-red-700"
            >
              <Trash2 size={24} />
            </button>

            <button
              type="submit"
              className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 font-medium"
            >
              Calcule
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="p-3 text-gray-500 hover:text-gray-700"
              >
                <RotateCcw size={24} />
              </button>
              <button
                type="button"
                onClick={handleRestore}
                className={`p-3 ${
                  previousFormState 
                    ? 'text-blue-500 hover:text-blue-700' 
                    : 'text-gray-300'
                }`}
                disabled={!previousFormState}
              >
                <History size={24} />
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Mobile-friendly delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-auto">
            <h3 className="text-lg font-bold mb-4">Delete Form</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this form? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDeleteForm()
                }}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}