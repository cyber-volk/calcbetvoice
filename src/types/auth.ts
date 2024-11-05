import { ValidationRule } from '@/types/validation'

export type UserRole = 'admin' | 'agent' | 'user' | null

export interface User {
  id: string
  username: string
  password: string
  role: 'user'
  agentId: string  // ID of the agent who created this user
  maxUsers?: never  // Users can't create other users
}

export interface Agent {
  id: string
  username: string
  password: string
  role: 'agent'
  adminId: string  // ID of the admin who created this agent
  maxUsers: number  // Maximum number of users this agent can create
  currentUsers: number  // Current number of users created
}

export interface Admin {
  id: string
  username: string
  password: string
  role: 'admin'
  maxUsers?: never  // Admins don't have a user limit
}

export type UserType = User | Agent | Admin

export interface Credentials {
  username: string
  password: string
}

// Update form validation types
export interface FormValidation {
  formId: string
  status: 'pending' | 'approved' | 'rejected'
  validatedBy?: string  // Agent's username
  validatedAt?: string  // Timestamp
  comments?: string[]
  rules: ValidationRule[]
}

// Mock data structure
export const MOCK_DATA = {
  admin: {
    id: 'admin1',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const
  },
  agents: [
    {
      id: 'agent1',
      username: 'agent1',
      password: 'agent123',
      role: 'agent' as const,
      adminId: 'admin1',
      maxUsers: 5,
      currentUsers: 2
    },
    {
      id: 'agent2',
      username: 'agent2',
      password: 'agent123',
      role: 'agent' as const,
      adminId: 'admin1',
      maxUsers: 3,
      currentUsers: 1
    }
  ],
  users: [
    {
      id: 'user1',
      username: 'user1',
      password: 'user123',
      role: 'user' as const,
      agentId: 'agent1'
    },
    {
      id: 'user2',
      username: 'user2',
      password: 'user123',
      role: 'user' as const,
      agentId: 'agent1'
    },
    {
      id: 'user3',
      username: 'user3',
      password: 'user123',
      role: 'user' as const,
      agentId: 'agent2'
    }
  ]
} 