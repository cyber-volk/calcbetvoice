export type UserRole = 'user' | 'agent' | null

export interface AuthState {
  isLoggedIn: boolean
  userRole: UserRole
  username: string
}

export interface Credentials {
  username: string
  password: string
}

// Mock credentials - in a real app, this would be in your backend
export const MOCK_CREDENTIALS = {
  user: { username: 'user1', password: 'userpass' },
  agent: { username: 'agent1', password: 'agentpass' }
} 