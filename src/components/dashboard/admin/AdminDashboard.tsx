import React from 'react'
import type { Admin, Agent } from '@/types'
import { Analytics } from './Analytics'

interface AdminDashboardProps {
  admin: Admin
  agents: Agent[]
  onAddAgent: (agent: Omit<Agent, 'id'>) => void
  onUpdateAgent: (id: string, updates: Partial<Agent>) => void
  onDeleteAgent: (id: string) => void
}

export function AdminDashboard({
  admin,
  agents,
  onAddAgent,
  onUpdateAgent,
  onDeleteAgent
}: AdminDashboardProps): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Analytics Section */}
      <Analytics agents={agents} />

      {/* Agent Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Agent Management</h2>
          <button
            onClick={() => onAddAgent({
              username: `agent-${agents.length + 1}`,
              password: 'agent123',
              role: 'agent',
              adminId: admin.id,
              maxUsers: 5,
              currentUsers: 0
            })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Agent
          </button>
        </div>
        <div className="space-y-4">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{agent.username}</p>
                <p className="text-sm text-gray-500">Users: {agent.currentUsers}/{agent.maxUsers}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateAgent(agent.id, { maxUsers: agent.maxUsers + 1 })}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Increase Limit
                </button>
                <button
                  onClick={() => onDeleteAgent(agent.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 