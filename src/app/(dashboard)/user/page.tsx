'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserDashboard } from '@/components/dashboard/UserDashboard'
import type { User } from '@/types'
import type { Site } from '@/types'
import { MOCK_DATA } from '@/types/auth'
import { storage } from '@/lib/storage'

export default function UserPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'user') {
      router.push('/')
      return
    }

    // Load user data
    const userData = MOCK_DATA.users[0] // For demo, using first user
    const siteData = storage.loadData().sites.filter(site => site.userId === userData.id)

    setUser(userData)
    setSites(siteData)
    setIsLoading(false)
  }, [router])

  if (isLoading) return <div>Loading...</div>
  if (!user) return <div>Access denied</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <UserDashboard user={user} sites={sites} />
    </div>
  )
} 