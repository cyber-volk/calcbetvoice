import { useState } from 'react'
import { Site } from '@/types/site'
import { ChevronRight, ChevronLeft, Plus, Edit2, Check, X, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface SiteCardProps {
  site: Site
  isDefault?: boolean
  onSelect: (siteId: string) => void
  onUpdateSite: (updatedSite: Site) => void
  onDeleteSite: () => void
}

export function SiteCard({ 
  site, 
  isDefault = false, 
  onSelect, 
  onUpdateSite,
  onDeleteSite 
}: SiteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState(site.name)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    if (editedName.trim()) {
      onUpdateSite({ ...site, name: editedName.trim() })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditedName(site.name)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (isDefault) {
      alert("Cannot delete the default site")
      return
    }
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    onDeleteSite()
    setShowDeleteConfirm(false)
  }

  const getTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true })
  }

  const calculateTotalForSite = () => {
    return site.forms.reduce((sum, form) => {
      const resultString = form.result.replace('Total: ', '').trim()
      const formTotal = parseFloat(resultString)
      
      if (!isNaN(formTotal)) {
        return sum + formTotal
      }
      return sum
    }, 0).toFixed(1)
  }

  return (
    <div 
      className={`
        relative min-w-[300px] p-6 rounded-lg shadow-lg
        transition-all duration-300 hover:shadow-xl
        ${isDefault ? 'bg-blue-50' : 'bg-white'}
      `}
    >
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="px-2 py-1 border rounded"
              autoFocus
            />
            <button onClick={handleSave} className="text-green-500 hover:text-green-700">
              <Check size={20} />
            </button>
            <button onClick={handleCancel} className="text-red-500 hover:text-red-700">
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold">{site.name}</h3>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit2 size={16} />
            </button>
          </div>
        )}
        
        {!isEditing && !isDefault && (
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 transition-colors"
            title="Delete site"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div 
        className="space-y-2 cursor-pointer"
        onClick={() => !isEditing && !showDeleteConfirm && onSelect(site.id)}
      >
        <p>Forms: {site.forms.length}</p>
        <p className="font-semibold">Total: {calculateTotalForSite()}</p>
        <p className="text-sm text-gray-500">
          Updated {getTimeAgo(site.statistics.lastUpdated)}
        </p>
      </div>

      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-lg p-4">
          <p className="text-center mb-4">Are you sure you want to delete this site?</p>
          <div className="flex gap-2">
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface SiteCarouselProps {
  sites: Site[]
  currentSiteIndex: number
  onSiteChange: (index: number) => void
  onAddSite: () => void
  onUpdateSite: (siteIndex: number, updatedSite: Site) => void
  onDeleteSite: (siteIndex: number) => void
}

export function SiteCarousel({ 
  sites, 
  currentSiteIndex, 
  onSiteChange, 
  onAddSite,
  onUpdateSite,
  onDeleteSite
}: SiteCarouselProps) {
  const calculateTotalAllSites = () => {
    return sites.reduce((total, site) => {
      const siteTotal = site.forms.reduce((formTotal, form) => {
        const resultString = form.result.replace('Total: ', '').trim()
        const formValue = parseFloat(resultString)
        return formTotal + (isNaN(formValue) ? 0 : formValue)
      }, 0)
      return total + siteTotal
    }, 0).toFixed(1)
  }

  return (
    <div className="relative w-full overflow-hidden">
      <div className="text-center mb-4">
        <span className="text-lg font-semibold">
          Total Sites: {calculateTotalAllSites()}
        </span>
      </div>

      <div className="flex items-center space-x-4 p-4 overflow-x-auto">
        {sites.map((site, index) => (
          <SiteCard
            key={site.id}
            site={site}
            isDefault={index === 0}
            onSelect={() => onSiteChange(index)}
            onUpdateSite={(updatedSite) => onUpdateSite(index, updatedSite)}
            onDeleteSite={() => onDeleteSite(index)}
          />
        ))}
        <div
          onClick={onAddSite}
          className="min-w-[300px] h-[200px] bg-white rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center p-6"
        >
          <div className="text-lg font-semibold text-gray-500 mb-2">Total Sites:</div>
          <div className="text-2xl font-bold text-gray-600 mb-4">
            {calculateTotalAllSites()}
          </div>
          <Plus size={24} className="text-gray-400 mt-auto" />
        </div>
      </div>
    </div>
  )
} 