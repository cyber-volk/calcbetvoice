import { cookies } from 'next/headers'

const SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

export function createSession(userId: string) {
  const sessionId = Math.random().toString(36).substring(7)
  const expires = new Date(Date.now() + SESSION_TIMEOUT)
  
  cookies().set('sessionId', sessionId, { expires })
  return sessionId
}

export function validateSession(sessionId: string) {
  // Add session validation logic
  return true
} 