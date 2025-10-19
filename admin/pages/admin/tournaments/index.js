import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaSearch,
  FaFilter,
  FaUsers,
  FaTrophy,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaGamepad,
  FaClock,
  FaStar,
  FaLock,
  FaGlobe
} from 'react-icons/fa'
import { IoMdAlert } from 'react-icons/io'

const TournamentsPage = () => {
  const router = useRouter()
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      router.push('/')
    }
  }, [user, isAdmin, authLoading, router])

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      alert('Error loading tournaments: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (tournamentId, tournamentTitle) => {
    if (!confirm(`Are you sure you want to delete "${tournamentTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(tournamentId)
      
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) throw error

      // Remove from local state
      setTournaments(prev => prev.filter(t => t.id !== tournamentId))
      
      alert('Tournament deleted successfully!')
    } catch (error) {
      console.error('Error deleting tournament:', error)
      alert('Error deleting tournament: ' + error.message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Upcoming' },
      ongoing: { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Ongoing' },
      completed: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Completed' },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelled' }
    }
    
    const config = statusConfig[status] || statusConfig.upcoming
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getMatchTypeBadge = (matchType) => {
    const typeConfig = {
      solo: { color: 'bg-purple-500/20 text-purple-400', label: 'Solo' },
      duo: { color: 'bg-pink-500/20 text-pink-400', label: 'Duo' },
      squad: { color: 'bg-orange-500/20 text-orange-400', label: 'Squad' },
      custom: { color: 'bg-cyan-500/20 text-cyan-400', label: 'Custom' }
    }
    
    const config = typeConfig[matchType] || typeConfig.custom
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter tournaments based on search and status
  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tournament.game_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <IoMdAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaTrophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Tournaments</h1>
                <p className="text-cyan-400">Manage all tournaments</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/admin/tournaments/new')}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <FaPlus className="w-5 h-5" />
              <span>New Tournament</span>
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="text-center lg:text-right">
                <p className="text-gray-400 text-sm">Total Tournaments</p>
                <p className="text-2xl font-bold text-cyan-400">{filteredTournaments.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tournaments List */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-cyan-400 font-semibold">Loading tournaments...</p>
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-12">
              <FaTrophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No tournaments found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first tournament'
                }
              </p>
              {(searchTerm || statusFilter !== 'all') ? (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('all')
                  }}
                  className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => router.push('/admin/tournaments/new')}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  Create Tournament
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 hover:border-cyan-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    {/* Tournament Info */}
                    <div className="flex-1 mb-4 lg:mb-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-white">{tournament.title}</h3>
                          {tournament.is_featured && (
                            <FaStar className="w-5 h-5 text-yellow-400" />
                          )}
                          {tournament.is_public ? (
                            <FaGlobe className="w-4 h-4 text-green-400" />
                          ) : (
                            <FaLock className="w-4 h-4 text-red-400" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(tournament.status)}
                          {getMatchTypeBadge(tournament.match_type)}
                        </div>
                      </div>

                      <p className="text-gray-300 mb-4">{tournament.short_description || tournament.description?.substring(0, 150)}...</p>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <FaGamepad className="w-4 h-4 text-purple-400" />
                          <span className="text-gray-300 text-sm">{tournament.game_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaUsers className="w-4 h-4 text-blue-400" />
                          <span className="text-gray-300 text-sm">
                            {tournament.current_participants || 0}/{tournament.max_participants} Participants
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaMoneyBillWave className="w-4 h-4 text-green-400" />
                          <span className="text-gray-300 text-sm">
                            ₹{tournament.joining_fee || 'Free'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaTrophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-gray-300 text-sm">
                            ₹{(tournament.prize_pool?.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <FaCalendarAlt className="w-3 h-3" />
                          <span>Starts: {formatDateTime(tournament.schedule?.start_date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaClock className="w-3 h-3" />
                          <span>Created: {formatDate(tournament.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2">
                      <button
                        onClick={() => router.push(`/tournaments/${tournament.slug}`)}
                        className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300 flex items-center space-x-2 lg:w-32"
                      >
                        <FaEye className="w-4 h-4" />
                        <span className="lg:hidden">View</span>
                      </button>
                      
                      <button
                        onClick={() => router.push(`/admin/tournaments/${tournament.id}`)}
                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2 lg:w-32"
                      >
                        <FaEdit className="w-4 h-4" />
                        <span className="lg:hidden">Edit</span>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(tournament.id, tournament.title)}
                        disabled={deleteLoading === tournament.id}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300 disabled:opacity-50 flex items-center space-x-2 lg:w-32"
                      >
                        {deleteLoading === tournament.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <FaTrash className="w-4 h-4" />
                        )}
                        <span className="lg:hidden">
                          {deleteLoading === tournament.id ? 'Deleting...' : 'Delete'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {!loading && filteredTournaments.length > 0 && (
          <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-cyan-500/30 p-4 text-center">
              <div className="text-2xl font-bold text-cyan-400 mb-1">
                {tournaments.filter(t => t.status === 'upcoming').length}
              </div>
              <div className="text-gray-400 text-sm">Upcoming</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-green-500/30 p-4 text-center">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {tournaments.filter(t => t.status === 'ongoing').length}
              </div>
              <div className="text-gray-400 text-sm">Ongoing</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-500/30 p-4 text-center">
              <div className="text-2xl font-bold text-gray-400 mb-1">
                {tournaments.filter(t => t.status === 'completed').length}
              </div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl border border-purple-500/30 p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {tournaments.filter(t => t.is_featured).length}
              </div>
              <div className="text-gray-400 text-sm">Featured</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TournamentsPage