import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Site } from '@/types/site'

interface SiteInfoProps {
  sites: Site[]
}

export function SiteInfo({ sites }: SiteInfoProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-4 top-2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl z-50 p-4">
          <h3 className="text-lg font-bold mb-4">Sites Overview</h3>
          <div className="space-y-4">
            {sites.map(site => (
              <div key={site.id} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{site.name}</h4>
                <div className="text-sm text-gray-600 mt-2">
                  <p>Forms: {site.statistics.totalForms}</p>
                  <p>Average Result: {site.statistics.averageResult.toFixed(2)}</p>
                  <p>Last Updated: {new Date(site.statistics.lastUpdated).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 