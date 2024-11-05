import React from 'react'
import type { FormValidationType } from '@/types'

interface ValidationStatusProps {
  formId: string
  validation?: FormValidationType
  onValidate?: () => void
  isAgent: boolean
}

export function ValidationStatus({
  formId,
  validation,
  onValidate,
  isAgent
}: ValidationStatusProps): React.ReactElement {
  if (!validation) {
    return <div />
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">
        Status: {validation.status}
      </span>
      {isAgent && onValidate && (
        <button
          onClick={onValidate}
          className="px-3 py-1 bg-blue-500 text-white rounded"
        >
          Validate
        </button>
      )}
    </div>
  )
} 