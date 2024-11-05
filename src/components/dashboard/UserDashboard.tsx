import { User } from '@/types/auth'
import { Site, CalculationForm } from '@/types/site'
import { BarChart, PieChart, Calendar } from 'lucide-react'

interface UserDashboardProps {
  user: User
  sites: Site[]
}

interface SiteStats {
  totalForms: number
  totalAmount: number
  averageAmount: number
  lastUpdated: string
  formsByDate: { [key: string]: number }
  creditsByClient: { [key: string]: number }
  expensesByType: { [key: string]: number }
}

export function UserDashboard({ user, sites }: UserDashboardProps) {
  const calculateSiteStats = (site: Site): SiteStats => {
    const stats: SiteStats = {
      totalForms: site.forms.length,
      totalAmount: 0,
      averageAmount: 0,
      lastUpdated: site.statistics.lastUpdated,
      formsByDate: {},
      creditsByClient: {},
      expensesByType: {}
    }

    site.forms.forEach(form => {
      // Calculate total amount
      const amount = parseFloat(form.result.replace('Total: ', '')) || 0
      stats.totalAmount += amount

      // Group forms by date
      const date = new Date(form.timestamp).toLocaleDateString()
      stats.formsByDate[date] = (stats.formsByDate[date] || 0) + 1

      // Group credits by client
      form.creditRows.forEach(row => {
        if (row.client) {
          stats.creditsByClient[row.client] = (stats.creditsByClient[row.client] || 0) + 
            (parseFloat(row.totalClient) || 0)
        }
      })

      // Group expenses by type
      form.depenseRows.forEach(row => {
        if (row.details) {
          stats.expensesByType[row.details] = (stats.expensesByType[row.details] || 0) + 
            (parseFloat(row.totalDepense) || 0)
        }
      })
    })

    stats.averageAmount = stats.totalAmount / stats.totalForms

    return stats
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6">User Dashboard</h2>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart className="text-blue-500" />
              <h3 className="font-semibold">Total Sites</h3>
            </div>
            <p className="text-2xl font-bold">{sites.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <PieChart className="text-green-500" />
              <h3 className="font-semibold">Total Forms</h3>
            </div>
            <p className="text-2xl font-bold">
              {sites.reduce((total, site) => total + site.forms.length, 0)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="text-purple-500" />
              <h3 className="font-semibold">Last Activity</h3>
            </div>
            <p className="text-lg">
              {new Date(Math.max(...sites.map(s => new Date(s.statistics.lastUpdated).getTime())))
                .toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Site-specific Statistics */}
        <div className="space-y-6">
          {sites.map(site => {
            const stats = calculateSiteStats(site)
            return (
              <div key={site.id} className="border rounded-lg p-4">
                <h3 className="text-xl font-bold mb-4">{site.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Forms Overview</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Total Forms: {stats.totalForms}</li>
                      <li>Total Amount: {stats.totalAmount.toFixed(1)}</li>
                      <li>Average Amount: {stats.averageAmount.toFixed(1)}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Top Clients</h4>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(stats.creditsByClient)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([client, amount]) => (
                          <li key={client}>{client}: {amount.toFixed(1)}</li>
                        ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Top Expenses</h4>
                    <ul className="space-y-1 text-sm">
                      {Object.entries(stats.expensesByType)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([type, amount]) => (
                          <li key={type}>{type}: {amount.toFixed(1)}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
} 