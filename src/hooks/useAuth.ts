import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { UserRole } from '@/types'

export function useAuth(requiredRole?: UserRole) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isLoggedIn') === 'true'
      const role = localStorage.getItem('userRole') as UserRole

      setIsAuthenticated(isAuth)
      setUserRole(role)
      setIsLoading(false)

      if (!isAuth) {
        router.push('/login')
        return
      }

      if (requiredRole && role !== requiredRole) {
        router.push('/')
      }
    }

    checkAuth()
  }, [router, requiredRole])

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/login')
  }

  return {
    isLoading,
    isAuthenticated,
    userRole,
    logout
  }
} 