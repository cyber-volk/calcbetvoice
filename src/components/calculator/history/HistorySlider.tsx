import React from 'react'
import type { CalculationForm } from '@/types'

interface HistorySliderProps {
  formHistory: CalculationForm[]
  currentIndex: number
  onHistoryChange: (index: number) => void
}

export function HistorySlider({
  formHistory,
  currentIndex,
  onHistoryChange
}: HistorySliderProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <input
        type="range"
        min={0}
        max={formHistory.length - 1}
        value={currentIndex}
        onChange={(e) => onHistoryChange(parseInt(e.target.value))}
        className="w-full"
      />
    </div>
  )
} 