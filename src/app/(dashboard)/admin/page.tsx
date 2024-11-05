'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminDashboard } from '@/components/dashboard/admin/AdminDashboard'
import { Admin, Agent, MOCK_DATA } from '@/types/auth'

export default function AdminPage() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is admin
    const userRole = localStorage.getItem('userRole')
    if (userRole !== 'admin') {
      router.push('/')
      return
    }

    // Load admin data
    setAdmin(MOCK_DATA.admin)
    setAgents(MOCK_DATA.agents)
    setIsLoading(false)
  }, [router])

  const handleAddAgent = (newAgent: Omit<Agent, 'id'>) => {
    const agentWithId: Agent = {
      ...newAgent,
      id: `agent-${Date.now()}`
    }
    setAgents(prev => [...prev, agentWithId])
  }

  const handleUpdateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(prev => prev.map(agent =>
      agent.id === id ? { ...agent, ...updates } : agent
    ))
  }

  const handleDeleteAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id))
  }

  if (isLoading) return <div>Loading...</div>
  if (!admin) return <div>Access denied</div>

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <AdminDashboard
        admin={admin}
        agents={agents}
        onAddAgent={handleAddAgent}
        onUpdateAgent={handleUpdateAgent}
        onDeleteAgent={handleDeleteAgent}
      />
    </div>
  )
} 