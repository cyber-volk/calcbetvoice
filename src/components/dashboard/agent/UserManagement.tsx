import React from 'react'
import type { User } from '@/types'

interface UserManagementProps {
  users: User[]
  onAddUser: (user: Omit<User, 'id'>) => void
  onDeleteUser: (userId: string) => void
}

export function UserManagement({ users, onAddUser, onDeleteUser }: UserManagementProps) {
  return (
    <div>
      {/* Implement user management */}
    </div>
  )
}

export default UserManagement 