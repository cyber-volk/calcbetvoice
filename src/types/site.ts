import { FormValidation } from '@/types/auth'
import { CreditRow, CreditPayeeRow, DepenseRow, RetraitRow } from '@/types/rows'

export interface CalculationForm {
  id: string
  multiplier: string
  fond: string
  soldeALinstant: string
  site: string
  soldeDeDebut: string
  creditRows: CreditRow[]
  creditPayeeRows: CreditPayeeRow[]
  depenseRows: DepenseRow[]
  retraitRows: RetraitRow[]
  result: string
  timestamp: string
  userId: string
  versionId?: number
  validation?: FormValidation
}

export interface Site {
  id: string
  name: string
  userId: string
  forms: CalculationForm[]
  statistics: {
    totalForms: number
    averageResult: number
    lastUpdated: string
  }
} 