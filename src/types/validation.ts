export type ValidationStatus = 'pending' | 'approved' | 'rejected'

export interface ValidationRule {
  id: string
  name: string
  description: string
  validate?: (form: any) => boolean
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface FormValidation {
  formId: string
  status: ValidationStatus
  validatedBy?: string
  validatedAt?: string
  comments?: string[]
  rules: ValidationRule[]
}

// Helper function to migrate old validation format to new format
export function migrateValidation(validation: any): FormValidation | undefined {
  if (!validation) return undefined

  if ('isValidated' in validation) {
    return {
      formId: validation.formId || '',
      status: validation.isValidated ? 'approved' : 'pending',
      validatedBy: validation.validatedBy,
      validatedAt: validation.validatedAt,
      comments: [],
      rules: []
    }
  }

  return validation
}

// Helper function to create a new validation
export function createValidation(
  formId: string,
  status: ValidationStatus = 'pending',
  validatedBy?: string,
  comments: string[] = []
): FormValidation {
  return {
    formId,
    status,
    validatedBy,
    validatedAt: validatedBy ? new Date().toISOString() : undefined,
    comments,
    rules: []
  }
}

// Helper function to check if a form needs validation
export function needsValidation(validation?: FormValidation): boolean {
  return !validation || validation.status === 'pending'
}

// Helper function to check if a form is validated
export function isValidated(validation?: FormValidation): boolean {
  return validation?.status === 'approved'
} 