import type { Site, CalculationForm } from '@/types'

interface StorageData {
  sites: Site[]
  currentSiteIndex: number
  currentFormIndex: number
}

export const DEFAULT_FORM: CalculationForm = {
  id: `form-${Date.now()}`,
  multiplier: '1.1',
  fond: '',
  soldeALinstant: '',
  site: '',
  soldeDeDebut: '',
  creditRows: [{ totalClient: '', details: '', client: '' }],
  creditPayeeRows: [{ totalPayee: '', details: '', client: '' }],
  depenseRows: [{ totalDepense: '', details: '', client: '' }],
  retraitRows: [{ retraitPayee: '', retrait: '', client: '' }],
  result: '',
  timestamp: new Date().toISOString(),
  userId: 'default-user'
}

export function updateSiteStatistics(site: Site): Site {
  const totalForms = site.forms.length
  const totalResults = site.forms.reduce((sum, form) => {
    const result = parseFloat(form.result.replace('Total: ', ''))
    return sum + (isNaN(result) ? 0 : result)
  }, 0)

  return {
    ...site,
    statistics: {
      totalForms,
      averageResult: totalForms > 0 ? totalResults / totalForms : 0,
      lastUpdated: new Date().toISOString()
    }
  }
}

export const storage = {
  loadData: (): StorageData => {
    try {
      const data = localStorage.getItem('calculatorData')
      return data ? JSON.parse(data) : {
        sites: [],
        currentSiteIndex: 0,
        currentFormIndex: 0
      }
    } catch (error) {
      console.error('Error loading data:', error)
      return {
        sites: [],
        currentSiteIndex: 0,
        currentFormIndex: 0
      }
    }
  },

  saveData: (data: StorageData): void => {
    try {
      localStorage.setItem('calculatorData', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  }
}

export type { StorageData } 