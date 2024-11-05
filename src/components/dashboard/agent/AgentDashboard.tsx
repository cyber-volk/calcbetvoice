import React from 'react'
import type { Agent, User } from '@/types'
import type { Site } from '@/types'
import { AgentStats } from './AgentStats'
import { FormValidation } from './FormValidation'
import { ActivityTimeline } from './ActivityTimeline'

interface AgentDashboardProps {
  agent: Agent
  users: User[]
  sites: Site[]
  onAddUser: () => void
  onDeleteUser: (userId: string) => void
  onValidateForm: (siteId: string, formId: string) => void
}

export function AgentDashboard({
  agent,
  users,
  sites,
  onAddUser,
  onDeleteUser,
  onValidateForm
}: AgentDashboardProps): React.ReactElement {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Agent Dashboard</h1>
      
      {/* Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">{users.length}</p>
          <p className="text-sm text-gray-500">of {agent.maxUsers} allowed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Sites</h3>
          <p className="text-3xl font-bold">{sites.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Forms</h3>
          <p className="text-3xl font-bold">
            {sites.reduce((total, site) => total + site.forms.length, 0)}
          </p>
        </div>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          <button
            onClick={onAddUser}
            disabled={users.length >= agent.maxUsers}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Add User
          </button>
        </div>
        <div className="space-y-4">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">Sites: {sites.filter(s => s.userId === user.id).length}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDeleteUser(user.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forms Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Forms Overview</h2>
        <div className="space-y-4">
          {sites.map(site => (
            <div key={site.id} className="p-4 border rounded">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{site.name}</h3>
                <span className="text-sm text-gray-500">
                  {site.forms.length} forms
                </span>
              </div>
              <div className="space-y-2">
                {site.forms.slice(-3).map(form => (
                  <div key={form.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm">
                      {new Date(form.timestamp).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-medium">{form.result}</span>
                    <button
                      onClick={() => onValidateForm(site.id, form.id)}
                      className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Validate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      <ActivityTimeline activities={[]} />
    </div>
  )
}