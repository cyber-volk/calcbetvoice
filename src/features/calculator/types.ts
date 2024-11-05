import type { Site, CalculationForm } from '@/types'

export interface CalculatorState {
  sites: Site[]
  currentSiteIndex: number
  currentFormIndex: number
  formHistory: CalculationForm[]
}

export interface CalculatorActions {
  addSite: (site: Site) => void
  updateSite: (index: number, site: Site) => void
  deleteSite: (index: number) => void
  addForm: () => void
  updateForm: (form: CalculationForm) => void
  deleteForm: (index: number) => void
} 