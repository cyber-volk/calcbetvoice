import React from 'react'
import type { Agent } from '@/types'

interface AnalyticsProps {
  agents: Agent[]
}

export function Analytics({ agents }: AnalyticsProps): React.ReactElement {
  const totalUsers = agents.reduce((sum, agent) => sum + agent.currentUsers, 0)
  const totalAvailableSlots = agents.reduce((sum, agent) => sum + (agent.maxUsers - agent.currentUsers), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Total Agents</h3>
        <p className="text-3xl font-bold">{agents.length}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Total Users</h3>
        <p className="text-3xl font-bold">{totalUsers}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-2">Available Slots</h3>
        <p className="text-3xl font-bold">{totalAvailableSlots}</p>
      </div>
    </div>
  )
} 