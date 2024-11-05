import type { Site } from '@/types'

interface StorageData {
  sites: Site[]
  currentSiteIndex: number
  currentFormIndex: number
}

const STORAGE_KEY = 'calculatorData'

export const storage = {
  loadData: (): StorageData => {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : {
        sites: [],
        currentSiteIndex: 0,
        currentFormIndex: 0
      }
    } catch (error) {
      console.error('Error loading data:', error)
      return {
        sites: [],
        currentSiteIndex: 0,
        currentFormIndex: 0
      }
    }
  },

  saveData: (data: StorageData): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving data:', error)
    }
  },

  clearData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing data:', error)
    }
  }
}

export type { StorageData } 