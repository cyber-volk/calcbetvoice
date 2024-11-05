import { useState } from 'react'
import { CalculationForm } from '@/types/site'
import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, RotateCcw, Eye } from 'lucide-react'

interface HistorySliderProps {
  formHistory: CalculationForm[]
  currentIndex: number
  onHistoryChange: (index: number) => void
}

export function HistorySlider({ formHistory, currentIndex, onHistoryChange }: HistorySliderProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<number | null>(null)

  const handlePointClick = (index: number) => {
    setSelectedPoint(index)
    onHistoryChange(index)
    setShowDetails(true)
  }

  const returnToLatest = () => {
    onHistoryChange(formHistory.length - 1)
    setSelectedPoint(null)
    setShowDetails(false)
  }

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Form History</h3>
        <button
          onClick={returnToLatest}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
        >
          <RotateCcw size={16} />
          Return to Latest
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-300 -translate-y-1/2" />
        <div className="relative flex justify-between items-center">
          {formHistory.map((form, index) => (
            <div
              key={index}
              className="relative flex flex-col items-center"
              onClick={() => handlePointClick(index)}
            >
              <div
                className={`w-4 h-4 rounded-full cursor-pointer transition-all ${
                  index === selectedPoint
                    ? 'bg-blue-500 ring-4 ring-blue-200'
                    : 'bg-gray-400 hover:bg-blue-400'
                }`}
              />
              <span className="absolute -bottom-6 text-xs text-gray-500 whitespace-nowrap">
                {formatTime(form.timestamp)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Details Modal */}
      {showDetails && selectedPoint !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">
                Form State {formatTime(formHistory[selectedPoint].timestamp)}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Multiplier</label>
                  <p className="mt-1">{formHistory[selectedPoint].multiplier}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fond</label>
                  <p className="mt-1">{formHistory[selectedPoint].fond}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solde à l'instant</label>
                  <p className="mt-1">{formHistory[selectedPoint].soldeALinstant}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Solde de début</label>
                  <p className="mt-1">{formHistory[selectedPoint].soldeDeDebut}</p>
                </div>
              </div>

              {/* Credit Rows */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Credit</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Total Client</th>
                        <th className="px-4 py-2">Details</th>
                        <th className="px-4 py-2">Client</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formHistory[selectedPoint].creditRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{row.totalClient}</td>
                          <td className="px-4 py-2">{row.details}</td>
                          <td className="px-4 py-2">{row.client}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Credit Payee Rows */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Credit Payée</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Total Payée</th>
                        <th className="px-4 py-2">Details</th>
                        <th className="px-4 py-2">Client</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formHistory[selectedPoint].creditPayeeRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{row.totalPayee}</td>
                          <td className="px-4 py-2">{row.details}</td>
                          <td className="px-4 py-2">{row.client}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Depense Rows */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Dépense</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Total Dépense</th>
                        <th className="px-4 py-2">Details</th>
                        <th className="px-4 py-2">Client</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formHistory[selectedPoint].depenseRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{row.totalDepense}</td>
                          <td className="px-4 py-2">{row.details}</td>
                          <td className="px-4 py-2">{row.client}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Retrait Rows */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Retrait</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2">Retrait Payée</th>
                        <th className="px-4 py-2">Retrait</th>
                        <th className="px-4 py-2">Client</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formHistory[selectedPoint].retraitRows.map((row, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2">{row.retraitPayee}</td>
                          <td className="px-4 py-2">{row.retrait}</td>
                          <td className="px-4 py-2">{row.client}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result */}
              <div className="mt-4 text-center">
                <h4 className="font-medium text-gray-700">Result</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formHistory[selectedPoint].result}
                </p>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onHistoryChange(selectedPoint)
                    setShowDetails(false)
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Restore This State
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 