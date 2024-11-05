import { CalculationForm } from '@/types'

export function saveFormVersion(form: CalculationForm) {
  const history = getFormHistory(form.id)
  history.push({
    ...form,
    versionId: Date.now(),
    timestamp: new Date().toISOString()
  })
  localStorage.setItem(`form_history_${form.id}`, JSON.stringify(history))
}

export function getFormHistory(formId: string): CalculationForm[] {
  const history = localStorage.getItem(`form_history_${formId}`)
  return history ? JSON.parse(history) : []
}

export function compareVersions(v1: CalculationForm, v2: CalculationForm) {
  // Add version comparison logic
  return {
    changes: [],
    additions: [],
    deletions: []
  }
} 