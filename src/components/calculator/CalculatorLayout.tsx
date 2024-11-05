import React from 'react'
import { HistorySlider } from './history/HistorySlider'
import { ValidationStatus } from './validation/ValidationStatus'
import { TouchButton } from '@/components/ui'
import type { CalculationForm, FormValidationType } from '@/types'
import { RotateCcw, History, Calculator } from 'lucide-react'

interface CalculatorLayoutProps {
  formHistory: CalculationForm[]
  currentIndex: number
  currentForm: CalculationForm
  onHistoryChange: (index: number) => void
  onCalculate: () => void
  onReset: () => void
  onRestore: () => void
  canRestore: boolean
  result: string
  isAgent: boolean
  onValidate?: () => void
  validation?: FormValidationType
}

export function CalculatorLayout({
  formHistory,
  currentIndex,
  currentForm,
  onHistoryChange,
  onCalculate,
  onReset,
  onRestore,
  canRestore,
  result,
  isAgent,
  onValidate,
  validation
}: CalculatorLayoutProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {/* Form Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TouchButton
            icon={RotateCcw}
            onClick={onReset}
            variant="secondary"
            label="Reset"
          />
          <TouchButton
            icon={History}
            onClick={onRestore}
            variant="secondary"
            label="Restore"
            disabled={!canRestore}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-2xl font-bold text-green-600">
            {result}
          </div>
          <TouchButton
            icon={Calculator}
            onClick={onCalculate}
            variant="primary"
            label="Calculate"
            type="submit"
          />
        </div>
      </div>

      {/* Validation Status */}
      {(isAgent || validation) && (
        <ValidationStatus
          formId={currentForm.id}
          validation={validation}
          onValidate={onValidate}
          isAgent={isAgent}
        />
      )}

      {/* History Slider */}
      {formHistory.length > 0 && (
        <HistorySlider
          formHistory={formHistory}
          currentIndex={currentIndex}
          onHistoryChange={onHistoryChange}
        />
      )}
    </div>
  )
}