export interface UserActivity {
  type: 'login' | 'logout' | 'form_submission' | 'form_validation' | 'calculation' | 'site_change' | 'error'
  action: string
  timestamp: string
  userId: string
  formId?: string
  siteId?: string
  details?: Record<string, any>
}

export function trackUserActivity(activity: UserActivity) {
  try {
    // Get existing activities
    const storedActivities = localStorage.getItem('userActivities')
    const activities: UserActivity[] = storedActivities 
      ? JSON.parse(storedActivities)
      : []

    // Add new activity
    activities.push(activity)

    // Keep only last 1000 activities
    const trimmedActivities = activities.slice(-1000)

    // Save back to storage
    localStorage.setItem('userActivities', JSON.stringify(trimmedActivities))

    // If we have a backend API, send activity there as well
    // await sendActivityToAPI(activity)
  } catch (error) {
    console.error('Error tracking activity:', error)
  }
}

export function getUserActivities(userId: string, type?: string): UserActivity[] {
  try {
    const storedActivities = localStorage.getItem('userActivities')
    if (!storedActivities) return []

    const activities: UserActivity[] = JSON.parse(storedActivities)
    return activities.filter(activity => 
      activity.userId === userId && 
      (!type || activity.type === type)
    )
  } catch (error) {
    console.error('Error getting activities:', error)
    return []
  }
} 