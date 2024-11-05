import type { CalculationForm } from '@/types'

export interface CalculatorFormProps {
  siteId: string
  formId: string
  initialData: CalculationForm
  onFormUpdate: (form: CalculationForm) => void
  onDeleteForm: () => void
} 