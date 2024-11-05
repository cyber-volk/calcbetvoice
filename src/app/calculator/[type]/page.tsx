'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Calculator from '../page'

interface CalculatorPageProps {
  params: {
    type: string
  }
}

export default function CalculatorPage({ params }: CalculatorPageProps): React.ReactElement {
  const router = useRouter()
  const userRole = localStorage.getItem('userRole')

  useEffect(() => {
    // Check permissions based on calculator type and role
    if (params.type === 'personal') {
      if (!['admin', 'agent'].includes(userRole || '')) {
        router.push('/')
        return
      }
    } else {
      if (userRole !== 'user') {
        router.push('/')
        return
      }
    }
  }, [userRole, params.type, router])

  // Pass the calculator type to the Calculator component
  return <Calculator calculatorType={params.type as 'personal' | 'user'} />
} 