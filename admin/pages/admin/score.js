import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaCrown,
  FaStar,
  FaFire,
  FaUsers,
  FaUser,
  FaUserFriends,
  FaUsers as FaSquad,
  FaRupeeSign,
  FaSkull,
  FaChartLine,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaEye,
  FaTimesCircle,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { GiPodium } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

// Helper functions moved outside the component
const getMatchTypeIcon = (matchType) => {
  const icons = {
    solo: FaUser,
    duo: FaUserFriends,
    squad: FaSquad
  }
  const Icon = icons[matchType] || FaUsers
  return <Icon className="w-4 h-4" />
}

const getMatchTypeColor = (matchType) => {
  const colors = {
    solo: 'text-cyan-400',
    duo: 'text-purple-400',
    squad: 'text-orange-400'
  }
  return colors[matchType] || 'text-gray-400'
}

const getRankBadge = (rank) => {
  const badges = {
    1: { icon: FaCrown, color: 'from-yellow-400 to-yellow-600', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' },
    2: { icon: FaTrophy, color: 'from-gray-400 to-gray-600', bgColor: 'bg-gray-500/20', textColor: 'text-gray-400' },
    3: { icon: FaMedal, color: 'from-orange-400 to-orange-600', bgColor: 'bg-orange-500/20', textColor: 'text-orange-400' },
    4: { icon: FaAward, color: 'from-purple-400 to-purple-600', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' },
    5: { icon: FaStar, color: 'from-cyan-400 to-cyan-600', bgColor: 'bg-cyan-500/20', textColor: 'text-cyan-400' }
  }
  
  const badge = badges[rank] || { icon: FaChartLine, color: 'from-green-400 to-green-600', bgColor: 'bg-green-500/20', textColor: 'text-green-400' }
  const Icon = badge.icon
  
  return (
    <div className={`w-10 h-10 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  )
}

const getStatusBadge = (status) => {
  if (status === 'live') {
    return (
      <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold">
        <FaFire className="w-3 h-3" />
        <span>LIVE</span>
      </div>
    )
  }
  return (
    <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
      <FaCheckCircle className="w-3 h-3" />
      <span>COMPLETED</span>
    </div>
  )
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

const AdminScorePage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [scores, setScores] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedScore, setSelectedScore] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingScore, setEditingScore] = useState(null)
  const [filters, setFilters] = useState({
    tournament: 'all',
    match_type: 'all',
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
        .select('id, title, game_name, slug')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load ALL users for dropdowns
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, gamer_tag, avatar_url')
        .order('username', { ascending: true })

      if (usersError) throw usersError

      // Load scores with tournament data
      const { data: scoresData, error: scoresError } = await supabase
        .from('tournament_scores')
        .select(`
          *,
          tournament:tournaments (
            id,
            title,
            game_name,
            slug
          )
        `)
        .order('points', { ascending: false })

      if (scoresError) throw scoresError

      setTournaments(tournamentsData || [])
      setAllUsers(usersData || [])
      setScores(scoresData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteScore = async (scoreId) => {
    if (!confirm('Are you sure you want to delete this score? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tournament_scores')
        .delete()
        .eq('id', scoreId)

      if (error) throw error

      await loadData()
      alert('✅ Score deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting score:', error)
      alert('❌ Error deleting score: ' + error.message)
    }
  }

  const handleCreateScore = async (scoreData) => {
    try {
      const { error } = await supabase
        .from('tournament_scores')
        .insert([scoreData])

      if (error) throw error

      await loadData()
      setShowCreateModal(false)
      alert('✅ Score created successfully!')
      
    } catch (error) {
      console.error('Error creating score:', error)
      alert('❌ Error creating score: ' + error.message)
    }
  }

  const handleUpdateScore = async (scoreId, updates) => {
    try {
      const { error } = await supabase
        .from('tournament_scores')
        .update(updates)
        .eq('id', scoreId)

      if (error) throw error

      await loadData()
      setEditingScore(null)
      alert('✅ Score updated successfully!')
      
    } catch (error) {
      console.error('Error updating score:', error)
      alert('❌ Error updating score: ' + error.message)
    }
  }

  // Filter scores
  const filteredScores = scores.filter(score => {
    if (filters.tournament !== 'all' && score.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.match_type !== 'all' && score.match_type !== filters.match_type) {
      return false
    }
    if (filters.status !== 'all' && score.status !== filters.status) {
      return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        (score.match_type === 'solo' && score.player_username?.toLowerCase().includes(searchTerm)) ||
        (score.match_type !== 'solo' && score.team_name?.toLowerCase().includes(searchTerm)) ||
        score.tournament?.title?.toLowerCase().includes(searchTerm) ||
        score.tournament?.game_name?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: scores.length,
    solo: scores.filter(score => score.match_type === 'solo').length,
    team: scores.filter(score => score.match_type !== 'solo').length,
    live: scores.filter(score => score.status === 'live').length,
    totalPrize: scores.reduce((sum, score) => sum + (score.prize_won || 0), 0),
    totalPoints: scores.reduce((sum, score) => sum + (score.points || 0), 0)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Tournament Scores...</p>
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
                <GiPodium className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Scores Management</h1>
                <p className="text-cyan-400">Manage tournament scores and rankings</p>
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Score</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Scores</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <GiPodium className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Solo Players</p>
                <p className="text-3xl font-bold text-white">{stats.solo}</p>
              </div>
              <FaUser className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Team Entries</p>
                <p className="text-3xl font-bold text-white">{stats.team}</p>
              </div>
              <FaUsers className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Prize</p>
                <p className="text-3xl font-bold text-white">
                  ₹{stats.totalPrize.toLocaleString()}
                </p>
              </div>
              <FaRupeeSign className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                Match Type
              </label>
              <select
                value={filters.match_type}
                onChange={(e) => setFilters(prev => ({ ...prev, match_type: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
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
                <option value="live">Live</option>
                <option value="completed">Completed</option>
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
                placeholder="Search by player, team, or tournament..."
              />
            </div>
          </div>
        </div>

        {/* Scores Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Rank</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Player/Team</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Type</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Kills</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Points</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Prize</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-gray-400">
                      <GiPodium className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No scores found</p>
                    </td>
                  </tr>
                ) : (
                  filteredScores.map(score => (
                    <ScoreRow
                      key={score.id}
                      score={score}
                      onViewDetails={() => {
                        setSelectedScore(score)
                        setShowDetailsModal(true)
                      }}
                      onEdit={() => setEditingScore(score)}
                      onDelete={() => deleteScore(score.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Score Details Modal */}
      {showDetailsModal && selectedScore && (
        <ScoreDetailsModal
          score={selectedScore}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setShowDetailsModal(false)
            setEditingScore(selectedScore)
          }}
          onDelete={() => {
            setShowDetailsModal(false)
            deleteScore(selectedScore.id)
          }}
        />
      )}

      {/* Create/Edit Score Modal */}
      {(showCreateModal || editingScore) && (
        <ScoreFormModal
          score={editingScore}
          tournaments={tournaments}
          users={allUsers}
          onClose={() => {
            setShowCreateModal(false)
            setEditingScore(null)
          }}
          onSubmit={editingScore ? 
            (data) => handleUpdateScore(editingScore.id, data) :
            handleCreateScore
          }
        />
      )}
    </div>
  )
}

// Score Row Component
const ScoreRow = ({ score, onViewDetails, onEdit, onDelete }) => {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        {getRankBadge(score.rank)}
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${
            score.match_type === 'solo' ? 'from-cyan-500/20 to-cyan-600/20' :
            score.match_type === 'duo' ? 'from-purple-500/20 to-purple-600/20' :
            'from-orange-500/20 to-orange-600/20'
          } rounded-xl border ${
            score.match_type === 'solo' ? 'border-cyan-500/30' :
            score.match_type === 'duo' ? 'border-purple-500/30' :
            'border-orange-500/30'
          } flex items-center justify-center`}>
            {getMatchTypeIcon(score.match_type)}
          </div>
          <div>
            <div className="text-white font-semibold">
              {score.match_type === 'solo' ? score.player_username : score.team_name}
            </div>
            <div className="text-gray-400 text-sm">
              {score.match_type === 'solo' ? 'Solo Player' : `${score.team_members?.length || 0} members`}
            </div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div>
          <div className="text-white font-medium">
            {score.tournament?.title || 'Unknown Tournament'}
          </div>
          <div className="text-gray-400 text-sm">{score.tournament?.game_name}</div>
        </div>
      </td>
      
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          score.match_type === 'solo' ? 'bg-cyan-500/20 text-cyan-400' :
          score.match_type === 'duo' ? 'bg-purple-500/20 text-purple-400' :
          'bg-orange-500/20 text-orange-400'
        }`}>
          {getMatchTypeIcon(score.match_type)}
          <span className="ml-1">{score.match_type}</span>
        </span>
      </td>
      
      <td className="p-4">
        {getStatusBadge(score.status)}
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-1 text-red-400 font-bold">
          <FaSkull className="w-4 h-4" />
          <span>{score.kills}</span>
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-cyan-400 font-bold text-lg">
          {score.points}
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-green-400 font-bold">
          ₹{score.prize_won?.toLocaleString() || 0}
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
            title="View Details"
          >
            <FaEye className="w-3 h-3" />
          </button>
          
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
            title="Edit"
          >
            <FaEdit className="w-3 h-3" />
          </button>
          
          <a
            href={`/score/${score.tournament?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
            title="View on Site"
          >
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
          
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
            title="Delete"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Score Details Modal Component
const ScoreDetailsModal = ({ score, onClose, onEdit, onDelete }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Score Details</h2>
              <p className="text-cyan-400">
                {score.match_type === 'solo' ? score.player_username : score.team_name}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tournament</span>
                  <span className="text-white font-semibold">{score.tournament?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Match Type</span>
                  <span className={`inline-flex items-center ${getMatchTypeColor(score.match_type)}`}>
                    {getMatchTypeIcon(score.match_type)}
                    <span className="ml-1 capitalize">{score.match_type}</span>
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  {getStatusBadge(score.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rank</span>
                  <span className="text-white font-bold text-lg">#{score.rank}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Performance Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Points</span>
                  <span className="text-cyan-400 font-bold text-xl">{score.points}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Kills</span>
                  <span className="text-red-400 font-bold flex items-center">
                    <FaSkull className="w-4 h-4 mr-1" />
                    {score.kills}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prize Won</span>
                  <span className="text-green-400 font-bold">
                    ₹{score.prize_won?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Matches Played</span>
                  <span className="text-white">{score.matches_played || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Section */}
          {score.match_type !== 'solo' && score.team_members && (
            <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-orange-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {score.team_members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">{member.username}</div>
                        <div className="text-gray-400 text-sm">Player</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-red-400">
                      <FaSkull className="w-4 h-4" />
                      <span className="font-bold">{member.kills}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-cyan-500/20 bg-gray-800/50">
          <div className="flex space-x-4">
            <button
              onClick={onDelete}
              className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Delete Score
            </button>
            
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Edit Score
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Score Form Modal Component
const ScoreFormModal = ({ score, tournaments, users, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tournament_id: score?.tournament_id || '',
    match_type: score?.match_type || 'solo',
    status: score?.status || 'live',
    player_id: score?.player_id || '',
    player_username: score?.player_username || '',
    team_name: score?.team_name || '',
    team_members: score?.team_members || [],
    kills: score?.kills || 0,
    rank: score?.rank || 1,
    points: score?.points || 0,
    prize_won: score?.prize_won || 0,
    matches_played: score?.matches_played || 0
  })

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      kills: parseInt(formData.kills) || 0,
      rank: parseInt(formData.rank) || 1,
      points: parseInt(formData.points) || 0,
      prize_won: parseInt(formData.prize_won) || 0,
      matches_played: parseInt(formData.matches_played) || 0,
      // For team matches, set team members
      team_members: formData.match_type !== 'solo' ? selectedTeamMembers : null,
      // For solo matches, clear team data
      team_name: formData.match_type === 'solo' ? null : formData.team_name,
      player_id: formData.match_type === 'solo' ? formData.player_id : null,
      player_username: formData.match_type === 'solo' ? formData.player_username : null
    }

    // Validate required fields
    if (!submissionData.tournament_id) {
      alert('Please select a tournament')
      return
    }
    if (submissionData.match_type === 'solo' && !submissionData.player_id) {
      alert('Please select a player for solo match')
      return
    }
    if (submissionData.match_type !== 'solo' && !submissionData.team_name) {
      alert('Please enter a team name')
      return
    }
    if (submissionData.match_type !== 'solo' && selectedTeamMembers.length === 0) {
      alert('Please add team members')
      return
    }

    onSubmit(submissionData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePlayerSelect = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user) {
      handleInputChange('player_id', user.id)
      handleInputChange('player_username', user.username)
    }
  }

  const addTeamMember = (userId) => {
    const user = users.find(u => u.id === userId)
    if (user && !selectedTeamMembers.find(member => member.player_id === user.id)) {
      const newMember = {
        player_id: user.id,
        username: user.username,
        kills: 0
      }
      setSelectedTeamMembers(prev => [...prev, newMember])
    }
  }

  const removeTeamMember = (playerId) => {
    setSelectedTeamMembers(prev => prev.filter(member => member.player_id !== playerId))
  }

  const updateTeamMemberKills = (playerId, kills) => {
    setSelectedTeamMembers(prev => 
      prev.map(member => 
        member.player_id === playerId 
          ? { ...member, kills: parseInt(kills) || 0 }
          : member
      )
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {score ? 'Edit Score' : 'Add New Score'}
              </h2>
              <p className="text-cyan-400">Enter tournament score details</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tournament Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Tournament *
              </label>
              <select
                required
                value={formData.tournament_id}
                onChange={(e) => handleInputChange('tournament_id', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title} - {tournament.game_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Match Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Match Type *
                </label>
                <select
                  required
                  value={formData.match_type}
                  onChange={(e) => handleInputChange('match_type', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="squad">Squad</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Player/Team Selection */}
            {formData.match_type === 'solo' ? (
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Player *
                </label>
                <select
                  required
                  value={formData.player_id}
                  onChange={(e) => handlePlayerSelect(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Player</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.team_name}
                    onChange={(e) => handleInputChange('team_name', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Enter team name"
                  />
                </div>

                {/* Team Members Management */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
                  <h4 className="text-white font-bold mb-4">Team Members</h4>
                  
                  {/* Add Team Member */}
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Add Team Member
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addTeamMember(e.target.value)
                          e.target.value = ''
                        }
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select Player to Add</option>
                      {users
                        .filter(user => !selectedTeamMembers.find(member => member.player_id === user.id))
                        .map(user => (
                          <option key={user.id} value={user.id}>
                            {user.username} ({user.gamer_tag || 'No tag'})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-3">
                    {selectedTeamMembers.map((member) => (
                      <div key={member.player_id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg flex items-center justify-center">
                            <FaUser className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="text-white font-semibold">{member.username}</div>
                            <div className="text-gray-400 text-sm">Team Member</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <FaSkull className="w-4 h-4 text-red-400" />
                            <input
                              type="number"
                              value={member.kills}
                              onChange={(e) => updateTeamMemberKills(member.player_id, e.target.value)}
                              className="w-20 bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                              min="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(member.player_id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Rank *
                </label>
                <input
                  type="number"
                  required
                  value={formData.rank}
                  onChange={(e) => handleInputChange('rank', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Points *
                </label>
                <input
                  type="number"
                  required
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Kills
                </label>
                <input
                  type="number"
                  value={formData.kills}
                  onChange={(e) => handleInputChange('kills', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Matches Played
                </label>
                <input
                  type="number"
                  value={formData.matches_played}
                  onChange={(e) => handleInputChange('matches_played', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  min="0"
                />
              </div>
            </div>

            {/* Prize */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Prize Won (₹)
              </label>
              <input
                type="number"
                value={formData.prize_won}
                onChange={(e) => handleInputChange('prize_won', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 text-gray-300 rounded-xl font-semibold transition-colors duration-300"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-xl font-semibold transition-colors duration-300"
            >
              {score ? 'Update Score' : 'Create Score'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminScorePage