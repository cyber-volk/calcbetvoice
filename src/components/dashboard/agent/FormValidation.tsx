import React from 'react'
import type { FormValidationType } from '@/types'

interface FormValidationProps {
  formId: string
  validation?: FormValidationType
  onValidate: () => void
}

export function FormValidation({ formId, validation, onValidate }: FormValidationProps) {
  return (
    <div>
      {/* Implement form validation */}
    </div>
  )
}

export default FormValidation 