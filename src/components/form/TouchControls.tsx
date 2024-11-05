import { Plus, Trash2, Mic } from 'lucide-react'

interface TouchControlsProps {
  onAdd: () => void
  onRemove: () => void
  onVoiceInput?: () => void
  showVoice?: boolean
  disabled?: boolean
}

export function TouchControls({
  onAdd,
  onRemove,
  onVoiceInput,
  showVoice = false,
  disabled = false
}: TouchControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onRemove}
        className="p-3 text-red-500 hover:text-red-700 touch-manipulation"
        disabled={disabled}
      >
        <Trash2 size={20} />
      </button>
      <button
        type="button"
        onClick={onAdd}
        className="p-3 text-green-500 hover:text-green-700 touch-manipulation"
      >
        <Plus size={20} />
      </button>
      {showVoice && onVoiceInput && (
        <button
          type="button"
          onClick={onVoiceInput}
          className="p-3 text-blue-500 hover:text-blue-700 touch-manipulation"
        >
          <Mic size={20} />
        </button>
      )}
    </div>
  )
} 