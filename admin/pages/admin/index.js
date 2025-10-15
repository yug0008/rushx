import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import { 
  FaTrophy, 
  FaUsers, 
  FaMoneyBillWave, 
  FaChartLine,
  FaExclamationTriangle
} from 'react-icons/fa'

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth()
  const [stats, setStats] = useState({})
  const [recentEnrollments, setRecentEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData()
    }
  }, [user, isAdmin])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [
        { count: tournamentsCount },
        { count: usersCount },
        { count: enrollmentsCount },
        { data: pendingPayments },
        { data: recentEnrollmentsData }
      ] = await Promise.all([
        supabase.from('tournaments').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tournament_enrollments').select('*', { count: 'exact', head: true }),
        supabase.from('tournament_enrollments').select('*').eq('payment_status', 'pending'),
        supabase
          .from('tournament_enrollments')
          .select(`
            *,
            tournaments(title),
            profiles(username, email)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      setStats({
        tournaments: tournamentsCount || 0,
        users: usersCount || 0,
        enrollments: enrollmentsCount || 0,
        pendingPayments: pendingPayments?.length || 0
      })

      setRecentEnrollments(recentEnrollmentsData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Admin!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your tournaments today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Tournaments"
            value={stats.tournaments}
            icon={FaTrophy}
            color="blue"
          />
          <StatCard
            title="Registered Users"
            value={stats.users}
            icon={FaUsers}
            color="green"
          />
          <StatCard
            title="Total Enrollments"
            value={stats.enrollments}
            icon={FaChartLine}
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={FaMoneyBillWave}
            color="yellow"
          />
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Enrollments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enrollment.profiles?.username || enrollment.profiles?.email}
                      </div>
                      <div className="text-sm text-gray-500">
                        {enrollment.in_game_nickname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{enrollment.tournaments?.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        enrollment.payment_status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : enrollment.payment_status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enrollment.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    
  )
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    yellow: 'bg-yellow-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard