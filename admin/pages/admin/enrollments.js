import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaSync,
  FaMoneyBillWave,
  FaClock,
  FaUser,
  FaGamepad,
  FaPhone,
  FaMapMarkerAlt,
  FaQrcode,
  FaWhatsapp,
  FaEnvelope,
  FaIdCard,
  FaCalendarAlt
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const AdminEnrollmentsPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState({
    tournament: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    if (!authLoading && user) {
      if (!isAdmin) {
        window.location.href = '/'
        return
      }
      loadData()
    }
  }, [user, isAdmin, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, title, slug, game_name, joining_fee, max_participants, current_participants')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('tournament_enrollments')
        .select('*')
        .order('created_at', { ascending: false })

      if (enrollmentsError) throw enrollmentsError

      // Load user profiles for enrollments
      const userIds = [...new Set(enrollmentsData?.map(e => e.user_id) || [])]
      const profilesData = {}

      for (const userId of userIds) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, email, gamer_tag')
          .eq('id', userId)
          .single()

        if (!profileError && profile) {
          profilesData[userId] = profile
        }
      }

      setTournaments(tournamentsData || [])
      setEnrollments(enrollmentsData || [])
      setProfiles(profilesData)

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getTournamentById = (tournamentId) => {
    return tournaments.find(t => t.id === tournamentId) || {}
  }

  const getUserProfile = (userId) => {
    return profiles[userId] || { username: 'Unknown User', email: 'N/A', gamer_tag: 'N/A' }
  }

  const updateEnrollmentStatus = async (enrollmentId, status, teamId = null) => {
    try {
      const updates = {
        payment_status: status,
        updated_at: new Date().toISOString()
      }

      if (status === 'completed' && teamId) {
        updates.team_id = teamId
      }

      const { error } = await supabase
        .from('tournament_enrollments')
        .update(updates)
        .eq('id', enrollmentId)

      if (error) throw error

      // If approved, update tournament participants count
      if (status === 'completed') {
        const enrollment = enrollments.find(e => e.id === enrollmentId)
        if (enrollment) {
          const tournament = getTournamentById(enrollment.tournament_id)
          const { error: updateError } = await supabase
            .from('tournaments')
            .update({ 
              current_participants: (tournament.current_participants || 0) + 1 
            })
            .eq('id', enrollment.tournament_id)

          if (updateError) throw updateError
        }
      }

      // Send notification to user
      const enrollment = enrollments.find(e => e.id === enrollmentId)
      if (enrollment) {
        let notificationTitle = ''
        let notificationMessage = ''
        let notificationType = ''

        if (status === 'completed') {
          notificationTitle = 'Enrollment Approved! 🎉'
          notificationMessage = `Your enrollment for ${getTournamentById(enrollment.tournament_id).title} has been approved. Team ID: ${teamId}`
          notificationType = 'success'
        } else if (status === 'rejected') {
          notificationTitle = 'Enrollment Rejected'
          notificationMessage = `Your enrollment for ${getTournamentById(enrollment.tournament_id).title} was rejected. Please contact support for details.`
          notificationType = 'warning'
        }

        await supabase
          .from('notifications')
          .insert({
            user_id: enrollment.user_id,
            title: notificationTitle,
            message: notificationMessage,
            type: notificationType,
            related_tournament_id: enrollment.tournament_id
          })
      }

      // Reload data
      await loadData()
      
      alert(`Enrollment ${status === 'completed' ? 'approved' : 'rejected'} successfully!`)
      
    } catch (error) {
      console.error('Error updating enrollment:', error)
      alert('Error updating enrollment: ' + error.message)
    }
  }

  const generateTeamId = (tournamentSlug) => {
    const prefix = tournamentSlug ? tournamentSlug.toUpperCase().substring(0, 3) : 'TMN'
    const randomNum = Math.floor(100 + Math.random() * 900)
    return `${prefix}${randomNum}`
  }

  const handleApprove = async (enrollment) => {
    const tournament = getTournamentById(enrollment.tournament_id)
    const teamId = generateTeamId(tournament.slug)
    if (confirm(`Approve enrollment and assign Team ID: ${teamId}?`)) {
      await updateEnrollmentStatus(enrollment.id, 'completed', teamId)
    }
  }

  const handleReject = async (enrollment) => {
    if (confirm('Reject this enrollment?')) {
      await updateEnrollmentStatus(enrollment.id, 'rejected')
    }
  }

  const handleViewDetails = (enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowDetailsModal(true)
  }

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const tournament = getTournamentById(enrollment.tournament_id)
    const userProfile = getUserProfile(enrollment.user_id)

    if (filters.tournament !== 'all' && enrollment.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.status !== 'all' && enrollment.payment_status !== filters.status) {
      return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        userProfile.username?.toLowerCase().includes(searchTerm) ||
        userProfile.email?.toLowerCase().includes(searchTerm) ||
        enrollment.in_game_nickname?.toLowerCase().includes(searchTerm) ||
        enrollment.transaction_id?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.payment_status === 'pending').length,
    completed: enrollments.filter(e => e.payment_status === 'completed').length,
    rejected: enrollments.filter(e => e.payment_status === 'rejected').length
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Enrollments...</p>
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
                <FaUsers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Enrollment Management</h1>
                <p className="text-cyan-400">Manage tournament enrollments and payments</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaSync className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Enrollments</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaUsers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending Review</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Approved</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-white">{stats.rejected}</p>
              </div>
              <FaTimesCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaFilter className="w-4 h-4 inline mr-2" />
                Tournament
              </label>
              <select
                value={filters.tournament}
                onChange={(e) => setFilters(prev => ({ ...prev, tournament: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Tournaments</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaFilter className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaSearch className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Search by username, email, game nickname, or transaction ID..."
              />
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">User</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Game Details</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Payment</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Date</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <FaUsers className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No enrollments found</p>
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map(enrollment => (
                    <EnrollmentRow
                      key={enrollment.id}
                      enrollment={enrollment}
                      tournament={getTournamentById(enrollment.tournament_id)}
                      userProfile={getUserProfile(enrollment.user_id)}
                      onViewDetails={handleViewDetails}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enrollment Details Modal */}
      {showDetailsModal && selectedEnrollment && (
        <EnrollmentDetailsModal
          enrollment={selectedEnrollment}
          tournament={getTournamentById(selectedEnrollment.tournament_id)}
          userProfile={getUserProfile(selectedEnrollment.user_id)}
          onClose={() => setShowDetailsModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  )
}

// Enrollment Row Component
const EnrollmentRow = ({ enrollment, tournament, userProfile, onViewDetails, onApprove, onReject }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: FaClock },
      completed: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: FaCheckCircle },
      rejected: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: FaTimesCircle }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`${config.color} border px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 w-fit`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
            <FaUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">
              {userProfile?.username || 'No username'}
            </div>
            <div className="text-gray-400 text-sm">{userProfile?.email}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <GiTrophyCup className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-white font-medium">{tournament?.title || 'Unknown Tournament'}</div>
            <div className="text-gray-400 text-sm">{tournament?.game_name || 'N/A'}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div>
          <div className="text-white font-medium flex items-center space-x-2">
            <FaGamepad className="w-3 h-3 text-cyan-400" />
            <span>{enrollment.in_game_nickname}</span>
          </div>
          <div className="text-gray-400 text-sm">UID: {enrollment.game_uid}</div>
        </div>
      </td>
      
      <td className="p-4">
        <div>
          <div className="text-white font-medium flex items-center space-x-2">
            <FaMoneyBillWave className="w-3 h-3 text-green-400" />
            <span>₹{tournament?.joining_fee || '0'}</span>
          </div>
          <div className="text-gray-400 text-sm font-mono text-xs">
            {enrollment.transaction_id}
          </div>
        </div>
      </td>
      
      <td className="p-4">
        {getStatusBadge(enrollment.payment_status)}
        {enrollment.team_id && (
          <div className="text-cyan-400 text-sm font-mono mt-1">
            {enrollment.team_id}
          </div>
        )}
      </td>
      
      <td className="p-4">
        <div className="text-gray-300 text-sm">
          {new Date(enrollment.created_at).toLocaleDateString()}
        </div>
        <div className="text-gray-400 text-xs">
          {new Date(enrollment.created_at).toLocaleTimeString()}
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(enrollment)}
            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
            title="View Details"
          >
            <FaEye className="w-3 h-3" />
          </button>
          
          {enrollment.payment_status === 'pending' && (
            <>
              <button
                onClick={() => onApprove(enrollment)}
                className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
                title="Approve"
              >
                <FaCheckCircle className="w-3 h-3" />
              </button>
              
              <button
                onClick={() => onReject(enrollment)}
                className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                title="Reject"
              >
                <FaTimesCircle className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// Enrollment Details Modal Component
const EnrollmentDetailsModal = ({ enrollment, tournament, userProfile, onClose, onApprove, onReject }) => {
  const [activeTab, setActiveTab] = useState('details')

  const contactUser = () => {
    const phone = enrollment.mobile_number
    const message = `Hi ${userProfile?.username}, regarding your enrollment for ${tournament?.title}`
    
    // Open WhatsApp
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const emailUser = () => {
    const email = userProfile?.email
    const subject = `Regarding your enrollment for ${tournament?.title}`
    
    // Open email client
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Enrollment Details</h2>
              <p className="text-cyan-400">{tournament?.title || 'Unknown Tournament'}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-cyan-500/20">
          {['details', 'payment', 'contact'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 capitalize ${
                activeTab === tab
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                  <FaUser className="w-5 h-5 text-cyan-400" />
                  <span>User Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Username</label>
                    <p className="text-white font-semibold">{userProfile?.username || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white font-semibold">{userProfile?.email || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Gamer Tag</label>
                    <p className="text-white font-semibold">{userProfile?.gamer_tag || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Game Information */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                  <FaGamepad className="w-5 h-5 text-purple-400" />
                  <span>Game Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">In-Game Nickname</label>
                    <p className="text-white font-semibold">{enrollment.in_game_nickname}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Game UID</label>
                    <p className="text-white font-mono font-semibold">{enrollment.game_uid}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Tournament</label>
                    <p className="text-white font-semibold">{tournament?.title || 'Unknown Tournament'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                  <FaPhone className="w-5 h-5 text-green-400" />
                  <span>Contact Information</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Mobile Number</label>
                    <p className="text-white font-semibold">{enrollment.mobile_number}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Address</label>
                    <p className="text-white">{enrollment.address}</p>
                  </div>
                </div>
              </div>

              {/* Enrollment Details */}
              <div className="space-y-4">
                <h3 className="text-white font-bold text-lg flex items-center space-x-2">
                  <FaIdCard className="w-5 h-5 text-yellow-400" />
                  <span>Enrollment Details</span>
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Status</label>
                    <p className={`font-semibold capitalize ${
                      enrollment.payment_status === 'completed' ? 'text-green-400' :
                      enrollment.payment_status === 'rejected' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {enrollment.payment_status}
                    </p>
                  </div>
                  
                  {enrollment.team_id && (
                    <div>
                      <label className="text-gray-400 text-sm">Team ID</label>
                      <p className="text-cyan-400 font-mono font-bold">{enrollment.team_id}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="text-gray-400 text-sm">Enrolled On</label>
                    <p className="text-white">
                      {new Date(enrollment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                  <FaMoneyBillWave className="w-5 h-5 text-green-400" />
                  <span>Payment Information</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Transaction ID</label>
                    <p className="text-white font-mono font-semibold">{enrollment.transaction_id}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Amount Paid</label>
                    <p className="text-green-400 font-bold text-xl">₹{tournament?.joining_fee || '0'}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Payment Method</label>
                    <p className="text-white">UPI Transfer</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Payment Status</label>
                    <p className={`font-semibold capitalize ${
                      enrollment.payment_status === 'completed' ? 'text-green-400' :
                      enrollment.payment_status === 'rejected' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {enrollment.payment_status}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Notes */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                <h4 className="text-yellow-400 font-bold mb-3 flex items-center space-x-2">
                  <IoMdAlert className="w-5 h-5" />
                  <span>Verification Notes</span>
                </h4>
                <ul className="text-yellow-300 text-sm space-y-2">
                  <li>• Verify transaction ID with bank statement</li>
                  <li>• Check if amount matches tournament fee</li>
                  <li>• Contact user if transaction details are unclear</li>
                  <li>• Assign Team ID only after successful verification</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-bold text-lg mb-4">Contact User</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-gray-400 text-sm">Mobile Number</label>
                    <p className="text-white font-semibold">{enrollment.mobile_number}</p>
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <p className="text-white font-semibold">{userProfile?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={contactUser}
                    className="flex-1 flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl p-4 transition-colors duration-300"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    <span>Contact via WhatsApp</span>
                  </button>
                  
                  <button
                    onClick={emailUser}
                    className="flex-1 flex items-center justify-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-xl p-4 transition-colors duration-300"
                  >
                    <FaEnvelope className="w-5 h-5" />
                    <span>Send Email</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {enrollment.payment_status === 'pending' && (
          <div className="p-6 border-t border-cyan-500/20 bg-gray-800/50">
            <div className="flex space-x-4">
              <button
                onClick={() => onReject(enrollment)}
                className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors duration-300"
              >
                Reject Enrollment
              </button>
              
              <button
                onClick={() => onApprove(enrollment)}
                className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl font-semibold transition-colors duration-300"
              >
                Approve & Assign Team ID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEnrollmentsPage