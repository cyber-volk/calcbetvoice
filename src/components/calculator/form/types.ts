export interface CalculatorFormProps {
  siteId: string
  formId: string
  initialData: any // Replace with proper type
  onFormUpdate: (form: any) => void // Replace with proper type
  onDeleteForm: () => void
} 