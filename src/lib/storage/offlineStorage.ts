import { openDB } from 'idb'
import type { CalculationForm } from '@/types'

const DB_NAME = 'calculator_app'
const STORE_NAME = 'forms'

export async function initDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' })
    }
  })
}

export async function saveFormOffline(form: CalculationForm) {
  const db = await initDB()
  await db.put(STORE_NAME, form)
}

export async function getOfflineForms() {
  const db = await initDB()
  return db.getAll(STORE_NAME)
} 