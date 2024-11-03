'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserRole, Credentials, MOCK_CREDENTIALS } from '@/types/auth'

const DUMMY_CREDENTIALS = {
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

  useEffect(() => {
    const isAuth = localStorage.getItem('isLoggedIn') === 'true'
    const role = localStorage.getItem('userRole') as UserRole
    const username = localStorage.getItem('username') || ''
    setIsLoggedIn(isAuth)
    setUserRole(role)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Check user credentials
    if (
      credentials.username === DUMMY_CREDENTIALS.user.username &&
      credentials.password === DUMMY_CREDENTIALS.user.password
    ) {
      loginSuccess('user')
      return
    }

    // Check agent credentials
    if (
      credentials.username === DUMMY_CREDENTIALS.agent.username &&
      credentials.password === DUMMY_CREDENTIALS.agent.password
    ) {
      loginSuccess('agent')
      return
    }

    setError('Invalid username or password')
  }

  const loginSuccess = (role: 'user' | 'agent') => {
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userRole', role)
    setIsLoggedIn(true)
    setUserRole(role)
    window.location.href = '/calculator'
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userRole')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    setUserRole(null)
    setCredentials({ username: '', password: '' })
    router.push('/')
  }

  return (
    <nav className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Calculator App
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {!isLoggedIn ? (
              <form onSubmit={handleLogin} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="px-3 py-1 rounded text-black"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="px-3 py-1 rounded text-black"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded"
                >
                  Login
                </button>
                {error && <span className="text-red-500">{error}</span>}
              </form>
            ) : (
              <>
                <span>Logged in as {userRole}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 