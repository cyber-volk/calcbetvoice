'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserRole, Credentials } from '@/types/auth'
import { Menu, X } from 'lucide-react'
import { setCookie, deleteCookie } from '@/lib/cookies'

const DUMMY_CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123' },
  user: { username: 'user', password: 'user123' },
  agent: { username: 'agent', password: 'agent123' }
}

export function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [credentials, setCredentials] = useState<Credentials>({
    username: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [username, setUsername] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole') as UserRole
    const username = localStorage.getItem('username') || ''
    setIsLoggedIn(isAuth)
    setUserRole(role)
    setUsername(username)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check credentials and redirect
    if (
      credentials.username === DUMMY_CREDENTIALS.admin.username &&
      credentials.password === DUMMY_CREDENTIALS.admin.password
    ) {
      loginSuccess('admin')
      return
    }

    if (
      credentials.username === DUMMY_CREDENTIALS.user.username &&
      credentials.password === DUMMY_CREDENTIALS.user.password
    ) {
      loginSuccess('user')
      return
    }

    if (
      credentials.username === DUMMY_CREDENTIALS.agent.username &&
      credentials.password === DUMMY_CREDENTIALS.agent.password
    ) {
      loginSuccess('agent')
      return
    }

    setError('Invalid username or password')
  }

  const loginSuccess = (role: 'admin' | 'user' | 'agent') => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', role)
    localStorage.setItem('username', credentials.username)
    
    setCookie('isLoggedIn', 'true', 7)
    setCookie('userRole', role, 7)
    setCookie('username', credentials.username, 7)
    
    setIsLoggedIn(true)
    setUserRole(role)
    
    // Redirect based on role
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

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    
    // Clear cookies
    deleteCookie('isLoggedIn')
    deleteCookie('userRole')
    deleteCookie('username')
    
    setIsLoggedIn(false)
    setUserRole(null)
    setCredentials({ username: '', password: '' })
    router.push('/')
  }

  return (
    <nav className="bg-gray-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold">
              Calculator App
            </Link>
            {isLoggedIn && (
              <span className="text-sm text-gray-300">
                Welcome, {username || 'User'}
              </span>
            )}
            {/* Navigation Links */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center gap-4">
                {userRole === 'admin' && (
                  <>
                    <Link 
                      href="/calculator/personal" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      My Calculator
                    </Link>
                    <Link 
                      href="/admin" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                {userRole === 'agent' && (
                  <>
                    <Link 
                      href="/calculator/personal" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Calculator
                    </Link>
                    <Link 
                      href="/agent/dashboard" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                {userRole === 'user' && (
                  <>
                    <Link 
                      href="/calculator" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Calculator
                    </Link>
                    <Link 
                      href="/user/dashboard" 
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium px-2 py-1 bg-gray-700 rounded">
                  {userRole?.toUpperCase()}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded touch-manipulation"
                >
                  Logout
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="px-3 py-2 rounded text-black min-w-[120px]"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="px-3 py-2 rounded text-black min-w-[120px]"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded touch-manipulation"
                >
                  Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4 space-y-4">
            {/* Role-based navigation - Mobile */}
            {isLoggedIn && (
              <div className="space-y-2 pb-4 border-b border-gray-700">
                {userRole === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="block px-4 py-2 text-base font-medium hover:bg-gray-700 rounded-md touch-manipulation"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {userRole === 'agent' && (
                  <>
                    <Link 
                      href="/calculator/personal" 
                      className="block px-4 py-2 text-base font-medium hover:bg-gray-700 rounded-md touch-manipulation"
                    >
                      My Calculator
                    </Link>
                    <Link 
                      href="/agent/dashboard" 
                      className="block px-4 py-2 text-base font-medium hover:bg-gray-700 rounded-md touch-manipulation"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                {userRole === 'user' && (
                  <>
                    <Link 
                      href="/calculator" 
                      className="block px-4 py-2 text-base font-medium hover:bg-gray-700 rounded-md touch-manipulation"
                    >
                      Calculator
                    </Link>
                    <Link 
                      href="/user/dashboard" 
                      className="block px-4 py-2 text-base font-medium hover:bg-gray-700 rounded-md touch-manipulation"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Authentication */}
            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="space-y-4 px-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 rounded text-black touch-manipulation"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full px-4 py-3 rounded text-black touch-manipulation"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded text-lg touch-manipulation"
                >
                  Login
                </button>
              </form>
            ) : (
              <div className="px-4 space-y-4">
                <p className="text-sm text-gray-300">
                  Logged in as {userRole} ({username})
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 hover:bg-red-600 px-6 py-3 rounded text-lg touch-manipulation"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500 text-white text-center py-2 px-4">
          {error}
        </div>
      )}
    </nav>
  )
} 