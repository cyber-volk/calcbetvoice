'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<'user' | 'agent' | null>(null)

  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole') as 'user' | 'agent' | null
    setIsLoggedIn(isAuth)
    setUserRole(role)

    if (isAuth && role) {
      router.push('/calculator')
    }
  }, [router])

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to Calculator App</h1>
      {!isLoggedIn ? (
        <p className="text-xl text-gray-600">
          Please log in as a {userRole || 'user or agent'} to access the calculator.
        </p>
      ) : (
        <p className="text-xl text-gray-600">
          Redirecting to calculator...
        </p>
      )}
    </div>
  )
}
