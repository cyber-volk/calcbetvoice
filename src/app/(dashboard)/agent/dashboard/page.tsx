'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AgentDashboard } from '@/components/dashboard/agent/AgentDashboard'
import type { Agent, User } from '@/types'
import type { Site } from '@/types'
import { MOCK_DATA } from '@/types/auth'
import { storage } from '@/lib/storage'

export default function AgentDashboardPage() {
  const router = useRouter()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is agent
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'agent') {
      router.push('/')
      return
    }

    // Load agent data
    const agentData = MOCK_DATA.agents[0]
    const userData = MOCK_DATA.users
    const siteData = storage.loadData().sites

    setAgent(agentData)
    setUsers(userData)
    setSites(siteData)
    setIsLoading(false)
  }, [router])

  if (isLoading) return <div>Loading...</div>
  if (!agent) return <div>Access denied</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <AgentDashboard
        agent={agent}
        users={users}
        sites={sites}
        onAddUser={() => {}}
        onDeleteUser={() => {}}
        onValidateForm={() => {}}
      />
    </div>
  )
} 