'use client'

import { useState, useEffect } from 'react'
import { Page as CalculatorForm } from '@/components/app-page'
import { SiteCarousel } from '@/components/site/SiteCard'
import { SiteInfo } from '@/components/site/SiteInfo'
import type { Site, CalculationForm } from '@/types'
import { storage } from '@/lib/storage'

interface CalculatorProps {
  calculatorType?: 'personal' | 'user'
}

export default function Calculator({ calculatorType = 'user' }: CalculatorProps): React.ReactElement {
  const [sites, setSites] = useState<Site[]>([])
  const [currentSiteIndex, setCurrentSiteIndex] = useState(0)
  const [currentFormIndex, setCurrentFormIndex] = useState(0)

  useEffect(() => {
    const data = storage.loadData()
    const userId = localStorage.getItem('userId')
    
    // Filter sites based on calculator type and user
    const filteredSites = calculatorType === 'personal' 
      ? data.sites.filter(site => site.userId === userId)
      : data.sites

    setSites(filteredSites)
    setCurrentSiteIndex(0)
    setCurrentFormIndex(0)
  }, [calculatorType])

  const handleFormUpdate = (updatedForm: CalculationForm) => {
    const updatedSites = [...sites]
    updatedSites[currentSiteIndex].forms[currentFormIndex] = updatedForm
    setSites(updatedSites)
    storage.saveData({ sites: updatedSites, currentSiteIndex, currentFormIndex })
  }

  const handleFormNavigation = (formIndex: number) => {
    setCurrentFormIndex(formIndex)
  }

  const handleAddSite = (newSite: Site) => {
    setSites(prev => [...prev, newSite])
    setCurrentSiteIndex(sites.length)
    setCurrentFormIndex(0)
    storage.saveData({ sites: [...sites, newSite], currentSiteIndex: sites.length, currentFormIndex: 0 })
  }

  const handleUpdateSite = (updatedSite: Site) => {
    const updatedSites = [...sites]
    updatedSites[currentSiteIndex] = updatedSite
    setSites(updatedSites)
    storage.saveData({ sites: updatedSites, currentSiteIndex, currentFormIndex })
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Site Carousel */}
        <SiteCarousel
          sites={sites}
          currentSiteIndex={currentSiteIndex}
          onSiteChange={setCurrentSiteIndex}
          onAddSite={() => handleAddSite({
            id: `site-${Date.now()}`,
            name: `New Site ${sites.length + 1}`,
            userId: localStorage.getItem('userId') || '',
            forms: []
          })}
          onUpdateSite={handleUpdateSite}
          onDeleteSite={(index) => {
            const updatedSites = sites.filter((_, i) => i !== index)
            setSites(updatedSites)
            setCurrentSiteIndex(Math.max(0, currentSiteIndex - 1))
            setCurrentFormIndex(0)
            storage.saveData({ sites: updatedSites, currentSiteIndex: Math.max(0, currentSiteIndex - 1), currentFormIndex: 0 })
          }}
        />

        {/* Calculator Form */}
        {sites[currentSiteIndex] && (
          <>
            <CalculatorForm
              siteId={sites[currentSiteIndex].id}
              formId={sites[currentSiteIndex].forms[currentFormIndex]?.id || 'new'}
              initialData={sites[currentSiteIndex].forms[currentFormIndex] || {}}
              onFormUpdate={handleFormUpdate}
              onDeleteForm={() => {
                const updatedSites = [...sites]
                updatedSites[currentSiteIndex].forms.splice(currentFormIndex, 1)
                setSites(updatedSites)
                setCurrentFormIndex(Math.max(0, currentFormIndex - 1))
                storage.saveData({ sites: updatedSites, currentSiteIndex, currentFormIndex: Math.max(0, currentFormIndex - 1) })
              }}
            />

            {/* Form Navigation */}
            <div className="mt-4 flex justify-center gap-2">
              {sites[currentSiteIndex].forms.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleFormNavigation(index)}
                  className={`px-3 py-1 rounded ${
                    currentFormIndex === index ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                >
                  Form {index + 1}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Site Info */}
        <SiteInfo sites={sites} />
      </div>
    </div>
  )
} 