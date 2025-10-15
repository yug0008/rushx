import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaCheck, 
  FaTimes, 
  FaEye,
  FaEdit,
  FaTrash,
  FaClock,
  FaMoneyBillWave,
  FaTrophy,
  FaUserCheck,
  FaUserTimes,
  FaExclamationTriangle,
  FaQrcode,
  FaWhatsapp,
  FaEnvelope,
  FaIdCard,
  FaMobile,
  FaMapMarkerAlt
} from 'react-icons/fa'

const AdminEnrollments = () => {
  const { user, isAdmin } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('')
  const [filters, setFilters] = useState({
    tournament: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    if (user && isAdmin) {
      fetchData()
    }
  }, [user, isAdmin])

  const fetchData = async () => {
    try {
      const [
        { data: enrollmentsData },
        { data: tournamentsData }
      ] = await Promise.all([
        supabase
          .from('tournament_enrollments')
          .select(`
            *,
            user:user_id(
              username,
              email,
              avatar_url
            ),
            tournament:tournament_id(
              id,
              title,
              slug,
              game_name,
              joining_fee,
              status,
              current_participants,
              max_participants
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('tournaments')
          .select('id, title, game_name')
          .order('created_at', { ascending: false })
      ])

      setEnrollments(enrollmentsData || [])
      setTournaments(tournamentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (enrollmentId, teamId = null) => {
    try {
      const finalTeamId = teamId || generateTeamId()
      
      const { error } = await supabase
        .from('tournament_enrollments')
        .update({ 
          payment_status: 'completed',
          team_id: finalTeamId,
          verified_at: new Date().toISOString(),
          verified_by: user.id
        })
        .eq('id', enrollmentId)

      if (error) throw error

      // Update tournament participant count
      const enrollment = enrollments.find(e => e.id === enrollmentId)
      if (enrollment) {
        await supabase
          .from('tournaments')
          .update({ 
            current_participants: (enrollment.tournament.current_participants || 0) + 1 
          })
          .eq('id', enrollment.tournament_id)
      }

      // Create success notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: enrollment.user_id,
          title: '🎉 Enrollment Approved!',
          message: `Your enrollment for "${enrollment.tournament.title}" has been approved. Your Team ID: ${finalTeamId}. Get ready to compete!`,
          type: 'success',
          related_tournament_id: enrollment.tournament_id
        })

      fetchData()
      setShowActionModal(false)
    } catch (error) {
      console.error('Error approving enrollment:', error)
    }
  }

  const handleReject = async (enrollmentId, reason = 'Payment verification failed') => {
    try {
      const { error } = await supabase
        .from('tournament_enrollments')
        .update({ 
          payment_status: 'rejected',
          rejection_reason: reason,
          rejected_at: new Date().toISOString(),
          rejected_by: user.id
        })
        .eq('id', enrollmentId)

      if (error) throw error

      const enrollment = enrollments.find(e => e.id === enrollmentId)
      
      // Create rejection notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: enrollment.user_id,
          title: 'Enrollment Rejected',
          message: `Your enrollment for "${enrollment.tournament.title}" was rejected. Reason: ${reason}. Contact support if you believe this is a mistake.`,
          type: 'warning',
          related_tournament_id: enrollment.tournament_id
        })

      fetchData()
      setShowActionModal(false)
    } catch (error) {
      console.error('Error rejecting enrollment:', error)
    }
  }

  const handleDelete = async (enrollmentId) => {
    if (!confirm('Are you sure you want to delete this enrollment? This action cannot be undone.')) return

    try {
      const enrollment = enrollments.find(e => e.id === enrollmentId)
      
      // If enrollment was approved, decrement tournament participant count
      if (enrollment.payment_status === 'completed') {
        await supabase
          .from('tournaments')
          .update({ 
            current_participants: (enrollment.tournament.current_participants || 1) - 1 
          })
          .eq('id', enrollment.tournament_id)
      }

      const { error } = await supabase
        .from('tournament_enrollments')
        .delete()
        .eq('id', enrollmentId)

      if (error) throw error

      fetchData()
    } catch (error) {
      console.error('Error deleting enrollment:', error)
    }
  }

  const generateTeamId = () => {
    const prefix = 'TEAM'
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()
    return `${prefix}${random}`
  }

  const getStatusStats = () => {
    const stats = {
      pending: enrollments.filter(e => e.payment_status === 'pending').length,
      completed: enrollments.filter(e => e.payment_status === 'completed').length,
      rejected: enrollments.filter(e => e.payment_status === 'rejected').length,
      total: enrollments.length
    }
    return stats
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    // Tournament filter
    if (filters.tournament !== 'all' && enrollment.tournament_id !== filters.tournament) {
      return false
    }

    // Status filter
    if (filters.status !== 'all' && enrollment.payment_status !== filters.status) {
      return false
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesUser = enrollment.user?.username?.toLowerCase().includes(searchTerm) ||
                         enrollment.user?.email?.toLowerCase().includes(searchTerm)
      const matchesTournament = enrollment.tournament?.title?.toLowerCase().includes(searchTerm)
      const matchesTeamId = enrollment.team_id?.toLowerCase().includes(searchTerm)
      const matchesTransaction = enrollment.transaction_id?.toLowerCase().includes(searchTerm)
      const matchesGameName = enrollment.in_game_nickname?.toLowerCase().includes(searchTerm)

      if (!matchesUser && !matchesTournament && !matchesTeamId && !matchesTransaction && !matchesGameName) {
        return false
      }
    }

    return true
  })

  const stats = getStatusStats()

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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enrollments Management</h1>
            <p className="text-gray-600">Review and manage tournament enrollments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Enrollments"
            value={stats.total}
            icon={FaUsers}
            color="blue"
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            icon={FaClock}
            color="yellow"
          />
          <StatCard
            title="Approved"
            value={stats.completed}
            icon={FaUserCheck}
            color="green"
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            icon={FaUserTimes}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users, tournaments, team IDs..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tournament</label>
              <select
                value={filters.tournament}
                onChange={(e) => setFilters(prev => ({ ...prev, tournament: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ tournament: 'all', status: 'all', search: '' })}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User & Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <EnrollmentRow
                    key={enrollment.id}
                    enrollment={enrollment}
                    onViewDetails={() => {
                      setSelectedEnrollment(enrollment)
                      setShowDetailsModal(true)
                    }}
                    onApprove={() => {
                      setSelectedEnrollment(enrollment)
                      setActionType('approve')
                      setShowActionModal(true)
                    }}
                    onReject={() => {
                      setSelectedEnrollment(enrollment)
                      setActionType('reject')
                      setShowActionModal(true)
                    }}
                    onDelete={() => handleDelete(enrollment.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No enrollments found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showDetailsModal && selectedEnrollment && (
          <EnrollmentDetailsModal
            enrollment={selectedEnrollment}
            onClose={() => {
              setShowDetailsModal(false)
              setSelectedEnrollment(null)
            }}
          />
        )}

        {showActionModal && selectedEnrollment && (
          <ActionModal
            enrollment={selectedEnrollment}
            actionType={actionType}
            onClose={() => {
              setShowActionModal(false)
              setSelectedEnrollment(null)
              setActionType('')
            }}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </Layout>
  )
}

const EnrollmentRow = ({ enrollment, onViewDetails, onApprove, onReject, onDelete }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: FaClock 
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: FaCheck 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: FaTimes 
      }
    }
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const isTournamentFull = enrollment.tournament?.current_participants >= enrollment.tournament?.max_participants

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            {enrollment.user?.username?.charAt(0) || enrollment.user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-gray-900 truncate">
              {enrollment.user?.username || enrollment.user?.email}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {enrollment.tournament?.title}
            </div>
            <div className="text-xs text-cyan-600 flex items-center space-x-1">
              <FaTrophy className="w-3 h-3" />
              <span>{enrollment.tournament?.game_name}</span>
              {isTournamentFull && (
                <span className="text-red-500 text-xs ml-2">• FULL</span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-semibold text-gray-900">₹{enrollment.tournament?.joining_fee}</div>
        <div className="text-sm text-gray-500 font-mono text-xs">{enrollment.transaction_id}</div>
        {enrollment.team_id && (
          <div className="text-xs text-green-600 font-mono font-bold flex items-center space-x-1">
            <FaIdCard className="w-3 h-3" />
            <span>{enrollment.team_id}</span>
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">{enrollment.in_game_nickname}</div>
        <div className="text-sm text-gray-500 font-mono text-xs">UID: {enrollment.game_uid}</div>
        <div className="text-xs text-gray-400 flex items-center space-x-1">
          <FaMobile className="w-3 h-3" />
          <span>{enrollment.mobile_number}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(enrollment.payment_status)}
        {enrollment.verified_at && (
          <div className="text-xs text-gray-500 mt-1">
            {new Date(enrollment.verified_at).toLocaleDateString()}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(enrollment.created_at).toLocaleDateString()}
        <div className="text-xs text-gray-400">
          {new Date(enrollment.created_at).toLocaleTimeString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={onViewDetails}
          className="text-cyan-600 hover:text-cyan-900 transition-colors duration-200 p-1 rounded"
          title="View Details"
        >
          <FaEye className="w-4 h-4" />
        </button>
        
        {enrollment.payment_status === 'pending' && (
          <>
            <button
              onClick={onApprove}
              className="text-green-600 hover:text-green-900 transition-colors duration-200 p-1 rounded"
              title="Approve Enrollment"
              disabled={isTournamentFull}
            >
              <FaCheck className="w-4 h-4" />
            </button>
            <button
              onClick={onReject}
              className="text-red-600 hover:text-red-900 transition-colors duration-200 p-1 rounded"
              title="Reject Enrollment"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </>
        )}
        
        <button
          onClick={onDelete}
          className="text-gray-600 hover:text-gray-900 transition-colors duration-200 p-1 rounded"
          title="Delete Enrollment"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

const EnrollmentDetailsModal = ({ enrollment, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Enrollment Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* User & Tournament Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaUsers className="w-5 h-5 text-cyan-600" />
                <span>User Information</span>
              </h3>
              <div className="space-y-3">
                <InfoField label="Username" value={enrollment.user?.username || 'N/A'} />
                <InfoField label="Email" value={enrollment.user?.email} />
                <InfoField label="Mobile Number" value={enrollment.mobile_number} icon={FaMobile} />
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 flex items-start space-x-2">
                    <FaMapMarkerAlt className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>{enrollment.address}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <FaTrophy className="w-5 h-5 text-purple-600" />
                <span>Tournament Information</span>
              </h3>
              <div className="space-y-3">
                <InfoField label="Tournament" value={enrollment.tournament?.title} />
                <InfoField label="Game" value={enrollment.tournament?.game_name} />
                <InfoField label="Entry Fee" value={`₹${enrollment.tournament?.joining_fee}`} />
                <InfoField 
                  label="Team ID" 
                  value={enrollment.team_id || 'Not assigned'} 
                  valueClass={enrollment.team_id ? 'text-green-600 font-mono font-bold' : 'text-gray-500'}
                  icon={FaIdCard}
                />
                <InfoField 
                  label="Tournament Status" 
                  value={enrollment.tournament?.status} 
                  valueClass={`capitalize ${
                    enrollment.tournament?.status === 'ongoing' ? 'text-green-600' :
                    enrollment.tournament?.status === 'upcoming' ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Game Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaGamepad className="w-5 h-5 text-green-600" />
              <span>Game Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="In-Game Nickname" value={enrollment.in_game_nickname} />
              <InfoField label="Game UID" value={enrollment.game_uid} valueClass="font-mono" />
            </div>
          </div>

          {/* Payment & Status Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <FaMoneyBillWave className="w-5 h-5 text-yellow-600" />
              <span>Payment & Status Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Transaction ID" value={enrollment.transaction_id} valueClass="font-mono" />
              <div>
                <label className="text-sm font-medium text-gray-500">Payment Status</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  enrollment.payment_status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                  enrollment.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                  'bg-red-100 text-red-800 border-red-200'
                }`}>
                  {enrollment.payment_status.charAt(0).toUpperCase() + enrollment.payment_status.slice(1)}
                </span>
              </div>
              {enrollment.verified_at && (
                <InfoField label="Verified At" value={new Date(enrollment.verified_at).toLocaleString()} />
              )}
              {enrollment.rejection_reason && (
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{enrollment.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const InfoField = ({ label, value, valueClass = '', icon: Icon }) => (
  <div>
    <label className="text-sm font-medium text-gray-500">{label}</label>
    <p className={`text-gray-900 ${valueClass} ${Icon ? 'flex items-center space-x-2' : ''}`}>
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <span>{value}</span>
    </p>
  </div>
)

const ActionModal = ({ enrollment, actionType, onClose, onApprove, onReject }) => {
  const [teamId, setTeamId] = useState(enrollment.team_id || '')
  const [rejectionReason, setRejectionReason] = useState('')

  const handleSubmit = () => {
    if (actionType === 'approve') {
      onApprove(enrollment.id, teamId || undefined)
    } else {
      onReject(enrollment.id, rejectionReason || 'Payment verification failed')
    }
  }

  const isTournamentFull = enrollment.tournament?.current_participants >= enrollment.tournament?.max_participants

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {actionType === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {actionType === 'approve' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team ID (Optional)
              </label>
              <input
                type="text"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                placeholder="Leave empty to auto-generate"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                A team ID will be automatically generated if left empty
              </p>
              
              {isTournamentFull && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-800">
                    <FaExclamationTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Tournament Full</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    This tournament has reached maximum participants. Consider rejecting this enrollment.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <FaExclamationTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Confirmation Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              {actionType === 'approve' 
                ? 'This will approve the enrollment and assign a team ID. The user will be notified via email and in-app notification.'
                : 'This will reject the enrollment. The user will be notified with the reason provided.'
              }
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-4 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={actionType === 'approve' && isTournamentFull}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              actionType === 'approve'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {actionType === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
          </button>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
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

export default AdminEnrollments