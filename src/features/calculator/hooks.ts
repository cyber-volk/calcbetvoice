import { useState, useEffect } from 'react'
import type { CalculatorState } from './types'
import { storage } from '@/lib/storage'

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>({
    sites: [],
    currentSiteIndex: 0,
    currentFormIndex: 0,
    formHistory: []
  })

  useEffect(() => {
    const data = storage.loadData()
    setState(prev => ({
      ...prev,
      sites: data.sites,
      currentSiteIndex: data.currentSiteIndex,
      currentFormIndex: data.currentFormIndex
    }))
  }, [])

  return state
} 