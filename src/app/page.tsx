'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserRole } from '@/types/auth'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)

  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole') as UserRole
    setIsLoggedIn(isAuth)
    setUserRole(role)

    if (isAuth && role) {
      router.push('/calculator')
    }
  }, [router])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Calculator App</h1>
        {!isLoggedIn ? (
          <p className="text-xl text-gray-600">
            Please log in as a user or agent to access the calculator.
          </p>
        ) : (
          <p className="text-xl text-gray-600">
            Redirecting to calculator...
          </p>
        )}
      </div>
    </div>
  )
}
