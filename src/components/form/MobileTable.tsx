import { TouchControls } from './TouchControls'
import { Plus, Mic } from 'lucide-react'

interface Column {
  key: string
  label: string
  readOnly?: boolean
  type?: 'text' | 'number'
  voiceEnabled?: boolean
}

interface MobileTableProps {
  title: string
  columns: Column[]
  rows: any[]
  onAddRow: () => void
  onRemoveRow: (index: number) => void
  onUpdateRow: (index: number, field: string, value: string) => void
  onVoiceInput?: (index: number, field: string) => void
  showTotals?: boolean
  totals?: {
    label: string
    value: string
  }[]
}

export function MobileTable({
  title,
  columns,
  rows,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onVoiceInput,
  showTotals,
  totals
}: MobileTableProps) {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-lg font-medium text-gray-700">
          {title}
        </label>
        <TouchControls
          onAdd={onAddRow}
          onRemove={() => onRemoveRow(rows.length - 1)}
          disabled={rows.length <= 1}
        />
      </div>

      {/* Mobile View */}
      <div className="block md:hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="bg-white rounded-lg shadow mb-4 p-4">
            {columns.map(column => (
              <div key={column.key} className="mb-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {column.label}
                </label>
                <div className="relative">
                  <input
                    type={column.type || 'text'}
                    value={row[column.key]}
                    onChange={(e) => onUpdateRow(rowIndex, column.key, e.target.value)}
                    readOnly={column.readOnly}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      column.readOnly ? 'bg-gray-50' : ''
                    }`}
                  />
                  {column.voiceEnabled && onVoiceInput && (
                    <button
                      type="button"
                      onClick={() => onVoiceInput(rowIndex, column.key)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-500"
                    >
                      <Mic size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2"></th>
              {columns.map(column => (
                <th key={column.key} className="border border-gray-300 px-4 py-2">
                  {column.label}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="border border-gray-300 px-4 py-2">
                  <TouchControls
                    onAdd={onAddRow}
                    onRemove={() => onRemoveRow(rowIndex)}
                    disabled={rows.length <= 1}
                  />
                </td>
                {columns.map(column => (
                  <td key={column.key} className="border border-gray-300 px-4 py-2">
                    <div className="relative">
                      <input
                        type={column.type || 'text'}
                        value={row[column.key]}
                        onChange={(e) => onUpdateRow(rowIndex, column.key, e.target.value)}
                        readOnly={column.readOnly}
                        className={`w-full px-2 py-1 ${
                          column.readOnly ? 'bg-gray-50' : ''
                        }`}
                      />
                      {column.voiceEnabled && onVoiceInput && (
                        <button
                          type="button"
                          onClick={() => onVoiceInput(rowIndex, column.key)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          <Mic size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2">
                  {rowIndex === rows.length - 1 && (
                    <button
                      type="button"
                      onClick={onAddRow}
                      className="text-green-500 hover:text-green-700"
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      {showTotals && totals && (
        <div className="flex flex-col md:flex-row justify-end gap-4 mt-4">
          {totals.map((total, index) => (
            <div key={index} className="flex items-center gap-2">
              <strong>{total.label}:</strong>
              <span>{total.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 