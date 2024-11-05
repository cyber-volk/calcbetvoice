'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'user' | 'agent' | 'admin' | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const isAuth = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole') as 'user' | 'agent' | 'admin' | null
    setIsLoggedIn(isAuth)
    setUserRole(role)

    if (isAuth && role) {
      switch (role) {
        case 'admin':
          router.push('/admin')
          break
        case 'agent':
          router.push('/agent/dashboard')
          break
        case 'user':
          router.push('/calculator')
          break
      }
    }
  }, [router])

  // Prevent hydration errors by not rendering until client-side
  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Calculator App</h1>
        {!isLoggedIn ? (
          <p className="text-xl text-gray-600">
            Please log in to access the calculator.
          </p>
        ) : (
          <p className="text-xl text-gray-600">
            Redirecting to dashboard...
          </p>
        )}
      </div>
    </div>
  )
}
