import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaGamepad, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaSync,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaTrophy,
  FaCog,
  FaBroadcastTower,
  FaMicrophone,
  FaCheckCircle,
  FaTimesCircle,
  FaPlayCircle,
  FaPauseCircle,
  FaIdCard,
  FaLock,
  FaArrowLeft,
  FaSave
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const AdminTournamentsMatches = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showMatchModal, setShowMatchModal] = useState(false)
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
        .select('id, title, slug, game_name')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('tournament_teams')
        .select('*')
        .order('team_name')

      if (teamsError) throw teamsError

      // Load matches with related data
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          tournaments:tournament_id (
            title,
            slug,
            game_name
          ),
          team_a:team_a_id (
            team_name,
            team_tag,
            logo_url
          ),
          team_b:team_b_id (
            team_name,
            team_tag,
            logo_url
          )
        `)
        .order('scheduled_time', { ascending: true })

      if (matchesError) throw matchesError

      setTournaments(tournamentsData || [])
      setTeams(teamsData || [])
      setMatches(matchesData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = () => {
    setSelectedMatch(null)
    setShowMatchModal(true)
  }

  const handleEditMatch = (match) => {
    setSelectedMatch(match)
    setShowMatchModal(true)
  }

  const handleViewDetails = (match) => {
    setSelectedMatch(match)
    setShowDetailsModal(true)
  }

  const handleDeleteMatch = async (match) => {
    if (confirm(`Are you sure you want to delete match: ${match.match_name}?`)) {
      try {
        const { error } = await supabase
          .from('tournament_matches')
          .delete()
          .eq('id', match.id)

        if (error) throw error

        await loadData()
        alert('Match deleted successfully!')
      } catch (error) {
        console.error('Error deleting match:', error)
        alert('Error deleting match: ' + error.message)
      }
    }
  }

  const updateMatchStatus = async (matchId, status) => {
    try {
      const updates = { status }
      
      if (status === 'live') {
        updates.actual_start_time = new Date().toISOString()
      } else if (status === 'completed') {
        updates.actual_end_time = new Date().toISOString()
      }

      const { error } = await supabase
        .from('tournament_matches')
        .update(updates)
        .eq('id', matchId)

      if (error) throw error

      await loadData()
      alert(`Match status updated to ${status}!`)
    } catch (error) {
      console.error('Error updating match status:', error)
      alert('Error updating match status: ' + error.message)
    }
  }

  // Filter matches
  const filteredMatches = matches.filter(match => {
    if (filters.tournament !== 'all' && match.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.status !== 'all' && match.status !== filters.status) {
      return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        match.match_name?.toLowerCase().includes(searchTerm) ||
        match.room_id?.toLowerCase().includes(searchTerm) ||
        match.tournaments?.title?.toLowerCase().includes(searchTerm) ||
        match.team_a?.team_name?.toLowerCase().includes(searchTerm) ||
        match.team_b?.team_name?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: matches.length,
    scheduled: matches.filter(m => m.status === 'scheduled').length,
    live: matches.filter(m => m.status === 'live').length,
    completed: matches.filter(m => m.status === 'completed').length
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Matches...</p>
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
                <FaGamepad className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Tournament Matches</h1>
                <p className="text-cyan-400">Manage match schedules, rooms, and results</p>
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
                onClick={handleCreateMatch}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>New Match</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Matches</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaGamepad className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Scheduled</p>
                <p className="text-3xl font-bold text-white">{stats.scheduled}</p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Now</p>
                <p className="text-3xl font-bold text-white">{stats.live}</p>
              </div>
              <FaPlayCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white">{stats.completed}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-blue-400" />
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
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                placeholder="Search by match name, room ID, team name..."
              />
            </div>
          </div>
        </div>

        {/* Matches Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Match</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Teams</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Schedule</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Room Details</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <FaGamepad className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No matches found</p>
                      <button
                        onClick={handleCreateMatch}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                      >
                        Create First Match
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredMatches.map(match => (
                    <MatchRow
                      key={match.id}
                      match={match}
                      onEdit={handleEditMatch}
                      onViewDetails={handleViewDetails}
                      onDelete={handleDeleteMatch}
                      onUpdateStatus={updateMatchStatus}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <MatchModal
          match={selectedMatch}
          tournaments={tournaments}
          teams={teams}
          onClose={() => setShowMatchModal(false)}
          onSave={loadData}
        />
      )}

      {/* Match Details Modal */}
      {showDetailsModal && selectedMatch && (
        <MatchDetailsModal
          match={selectedMatch}
          onClose={() => setShowDetailsModal(false)}
          onUpdateStatus={updateMatchStatus}
        />
      )}
    </div>
  )
}

// Match Row Component
const MatchRow = ({ match, onEdit, onViewDetails, onDelete, onUpdateStatus }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: FaClock },
      live: { color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: FaPlayCircle },
      completed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: FaCheckCircle },
      cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: FaTimesCircle }
    }
    
    const config = statusConfig[status] || statusConfig.scheduled
    const Icon = config.icon
    
    return (
      <span className={`${config.color} border px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 w-fit`}>
        <Icon className="w-3 h-3" />
        <span className="capitalize">{status}</span>
      </span>
    )
  }

  const getTeamDisplay = (team) => {
    if (!team) return 'TBD'
    return team.team_tag ? `${team.team_name} (${team.team_tag})` : team.team_name
  }

  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        <div>
          <div className="text-white font-semibold">{match.match_name}</div>
          <div className="text-gray-400 text-sm">{match.round_name}</div>
          {match.match_number && (
            <div className="text-cyan-400 text-xs">Match #{match.match_number}</div>
          )}
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <GiTrophyCup className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-white font-medium">{match.tournaments?.title}</div>
            <div className="text-gray-400 text-sm">{match.tournaments?.game_name}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          <div className="text-white text-sm">
            {getTeamDisplay(match.team_a)} vs {getTeamDisplay(match.team_b)}
          </div>
          {match.participants && match.participants.length > 0 && (
            <div className="text-gray-400 text-xs">
              {match.participants.length} participants
            </div>
          )}
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          <div className="text-white text-sm flex items-center space-x-1">
            <FaCalendarAlt className="w-3 h-3 text-cyan-400" />
            <span>
              {match.scheduled_time ? new Date(match.scheduled_time).toLocaleDateString() : 'Not set'}
            </span>
          </div>
          <div className="text-gray-400 text-xs flex items-center space-x-1">
            <FaClock className="w-3 h-3 text-gray-400" />
            <span>
              {match.scheduled_time ? new Date(match.scheduled_time).toLocaleTimeString() : ''}
            </span>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          {match.room_id ? (
            <>
              <div className="text-white text-sm font-mono">{match.room_id}</div>
              <div className="text-gray-400 text-xs">Password: {match.room_password || 'Not set'}</div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">Not assigned</div>
          )}
        </div>
      </td>
      
      <td className="p-4">
        {getStatusBadge(match.status)}
      </td>
      
      <td className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewDetails(match)}
            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
            title="View Details"
          >
            <FaEye className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => onEdit(match)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
            title="Edit Match"
          >
            <FaEdit className="w-3 h-3" />
          </button>

          {match.status === 'scheduled' && (
            <button
              onClick={() => onUpdateStatus(match.id, 'live')}
              className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
              title="Start Match"
            >
              <FaPlayCircle className="w-3 h-3" />
            </button>
          )}

          {match.status === 'live' && (
            <button
              onClick={() => onUpdateStatus(match.id, 'completed')}
              className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
              title="Complete Match"
            >
              <FaCheckCircle className="w-3 h-3" />
            </button>
          )}
          
          <button
            onClick={() => onDelete(match)}
            className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
            title="Delete Match"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Match Modal Component
const MatchModal = ({ match, tournaments, teams, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tournament_id: match?.tournament_id || '',
    match_name: match?.match_name || '',
    match_number: match?.match_number || '',
    round_name: match?.round_name || 'Group Stage',
    scheduled_time: match?.scheduled_time ? new Date(match.scheduled_time).toISOString().slice(0, 16) : '',
    room_id: match?.room_id || '',
    room_password: match?.room_password || '',
    team_a_id: match?.team_a_id || '',
    team_b_id: match?.team_b_id || '',
    status: match?.status || 'scheduled',
    stream_url: match?.stream_url || '',
    casters: match?.casters || [],
    custom_match_settings: match?.custom_match_settings || {},
    admin_notes: match?.admin_notes || '',
    is_featured: match?.is_featured || false
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submissionData = {
        ...formData,
        scheduled_time: formData.scheduled_time ? new Date(formData.scheduled_time).toISOString() : null,
        match_number: formData.match_number ? parseInt(formData.match_number) : null
      }

      if (match) {
        // Update existing match
        const { error } = await supabase
          .from('tournament_matches')
          .update(submissionData)
          .eq('id', match.id)

        if (error) throw error
      } else {
        // Create new match
        const { error } = await supabase
          .from('tournament_matches')
          .insert([submissionData])

        if (error) throw error
      }

      onSave()
      onClose()
      alert(`Match ${match ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving match:', error)
      alert('Error saving match: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCasterChange = (index, value) => {
    const newCasters = [...formData.casters]
    newCasters[index] = value
    setFormData(prev => ({ ...prev, casters: newCasters }))
  }

  const addCaster = () => {
    setFormData(prev => ({ ...prev, casters: [...prev.casters, ''] }))
  }

  const removeCaster = (index) => {
    setFormData(prev => ({ ...prev, casters: prev.casters.filter((_, i) => i !== index) }))
  }

  const tournamentTeams = teams.filter(team => team.tournament_id === formData.tournament_id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {match ? 'Edit Match' : 'Create New Match'}
              </h2>
              <p className="text-cyan-400">Manage match details and settings</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaIdCard className="w-5 h-5 text-cyan-400" />
                <span>Basic Information</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Tournament *
              </label>
              <select
                required
                value={formData.tournament_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tournament_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Match Name *
              </label>
              <input
                type="text"
                required
                value={formData.match_name}
                onChange={(e) => setFormData(prev => ({ ...prev, match_name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., Quarter Final - Match 1"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Match Number
              </label>
              <input
                type="number"
                value={formData.match_number}
                onChange={(e) => setFormData(prev => ({ ...prev, match_number: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Optional match number"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Round Name
              </label>
              <input
                type="text"
                value={formData.round_name}
                onChange={(e) => setFormData(prev => ({ ...prev, round_name: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="e.g., Group Stage, Quarter Final"
              />
            </div>

            {/* Teams */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaUsers className="w-5 h-5 text-purple-400" />
                <span>Teams</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Team A
              </label>
              <select
                value={formData.team_a_id}
                onChange={(e) => setFormData(prev => ({ ...prev, team_a_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select Team A</option>
                {tournamentTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.team_name} {team.team_tag && `(${team.team_tag})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Team B
              </label>
              <select
                value={formData.team_b_id}
                onChange={(e) => setFormData(prev => ({ ...prev, team_b_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select Team B</option>
                {tournamentTeams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.team_name} {team.team_tag && `(${team.team_tag})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Schedule */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaCalendarAlt className="w-5 h-5 text-yellow-400" />
                <span>Schedule</span>
              </h3>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Scheduled Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_time: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Room Details */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaLock className="w-5 h-5 text-green-400" />
                <span>Room Details</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Room ID
              </label>
              <input
                type="text"
                value={formData.room_id}
                onChange={(e) => setFormData(prev => ({ ...prev, room_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter room ID"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Room Password
              </label>
              <input
                type="text"
                value={formData.room_password}
                onChange={(e) => setFormData(prev => ({ ...prev, room_password: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter room password"
              />
            </div>

            {/* Stream Details */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaBroadcastTower className="w-5 h-5 text-red-400" />
                <span>Stream Details</span>
              </h3>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Stream URL
              </label>
              <input
                type="url"
                value={formData.stream_url}
                onChange={(e) => setFormData(prev => ({ ...prev, stream_url: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="https://twitch.tv/your-channel"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Casters
              </label>
              <div className="space-y-2">
                {formData.casters.map((caster, index) => (
                  <div key={index} className="flex space-x-2">
                    <input
                      type="text"
                      value={caster}
                      onChange={(e) => handleCasterChange(index, e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Caster name"
                    />
                    <button
                      type="button"
                      onClick={() => removeCaster(index)}
                      className="px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCaster}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add Caster</span>
                </button>
              </div>
            </div>

            {/* Additional Settings */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaCog className="w-5 h-5 text-gray-400" />
                <span>Additional Settings</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="is_featured" className="text-white font-semibold">
                Featured Match
              </label>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Internal notes for admin..."
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-cyan-500/20">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-colors duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-5 h-5" />
                  <span>{match ? 'Update Match' : 'Create Match'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Match Details Modal Component
const MatchDetailsModal = ({ match, onClose, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState('overview')

  const getTeamDisplay = (team) => {
    if (!team) return 'TBD'
    return team.team_tag ? `${team.team_name} (${team.team_tag})` : team.team_name
  }

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set'
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">{match.match_name}</h2>
              <p className="text-cyan-400">{match.tournaments?.title} • {match.round_name}</p>
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
          {['overview', 'teams', 'room', 'stream', 'results'].map(tab => (
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Match Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={`font-semibold capitalize ${
                        match.status === 'scheduled' ? 'text-yellow-400' :
                        match.status === 'live' ? 'text-green-400' :
                        match.status === 'completed' ? 'text-blue-400' :
                        'text-red-400'
                      }`}>
                        {match.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Round:</span>
                      <span className="text-white">{match.round_name}</span>
                    </div>
                    {match.match_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match #:</span>
                        <span className="text-cyan-400 font-bold">{match.match_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Featured:</span>
                      <span className={match.is_featured ? 'text-green-400' : 'text-gray-400'}>
                        {match.is_featured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Schedule</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Scheduled:</span>
                      <span className="text-white">{formatDateTime(match.scheduled_time)}</span>
                    </div>
                    {match.actual_start_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Started:</span>
                        <span className="text-green-400">{formatDateTime(match.actual_start_time)}</span>
                      </div>
                    )}
                    {match.actual_end_time && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ended:</span>
                        <span className="text-blue-400">{formatDateTime(match.actual_end_time)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {match.admin_notes && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
                  <h4 className="text-yellow-400 font-bold mb-2">Admin Notes</h4>
                  <p className="text-yellow-300">{match.admin_notes}</p>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex space-x-4">
                {match.status === 'scheduled' && (
                  <button
                    onClick={() => onUpdateStatus(match.id, 'live')}
                    className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaPlayCircle className="w-5 h-5" />
                    <span>Start Match</span>
                  </button>
                )}
                {match.status === 'live' && (
                  <button
                    onClick={() => onUpdateStatus(match.id, 'completed')}
                    className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaCheckCircle className="w-5 h-5" />
                    <span>Complete Match</span>
                  </button>
                )}
                {(match.status === 'scheduled' || match.status === 'live') && (
                  <button
                    onClick={() => onUpdateStatus(match.id, 'cancelled')}
                    className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                    <span>Cancel Match</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'teams' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Team A</h3>
                  {match.team_a ? (
                    <div className="space-y-3">
                      <div className="text-xl font-bold text-white">{getTeamDisplay(match.team_a)}</div>
                      {match.team_a.logo_url && (
                        <img 
                          src={match.team_a.logo_url} 
                          alt={match.team_a.team_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">Team not assigned</div>
                  )}
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Team B</h3>
                  {match.team_b ? (
                    <div className="space-y-3">
                      <div className="text-xl font-bold text-white">{getTeamDisplay(match.team_b)}</div>
                      {match.team_b.logo_url && (
                        <img 
                          src={match.team_b.logo_url} 
                          alt={match.team_b.team_name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">Team not assigned</div>
                  )}
                </div>
              </div>

              {match.participants && match.participants.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Participants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {match.participants.map((participant, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                        <FaUsers className="w-4 h-4 text-cyan-400" />
                        <div>
                          <div className="text-white font-medium">{participant.name}</div>
                          <div className="text-gray-400 text-sm">{participant.team}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'room' && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                <h3 className="text-white font-bold text-lg mb-4">Room Details</h3>
                {match.room_id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-gray-400 text-sm">Room ID</label>
                      <p className="text-white font-mono text-xl font-bold">{match.room_id}</p>
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Password</label>
                      <p className="text-cyan-400 font-mono text-lg">{match.room_password || 'Not set'}</p>
                    </div>
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                      <h4 className="text-cyan-400 font-semibold mb-2">Instructions for Players:</h4>
                      <ul className="text-cyan-300 text-sm space-y-1">
                        <li>• Join room 15-30 minutes before scheduled time</li>
                        <li>• Use the Room ID and Password above</li>
                        <li>• Ensure stable internet connection</li>
                        <li>• Contact admin if unable to join</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <FaLock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Room details not assigned yet</p>
                  </div>
                )}
              </div>

              {match.custom_match_settings && Object.keys(match.custom_match_settings).length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Custom Match Settings</h3>
                  <div className="space-y-2">
                    {Object.entries(match.custom_match_settings).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-white">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stream' && (
            <div className="space-y-6">
              {match.stream_url ? (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Live Stream</h3>
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FaBroadcastTower className="w-16 h-16 text-red-400 mx-auto mb-4" />
                      <p className="text-white font-semibold mb-2">Stream Available</p>
                      <a 
                        href={match.stream_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 inline-block"
                      >
                        Watch Stream
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FaBroadcastTower className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No stream URL configured for this match</p>
                </div>
              )}

              {match.casters && match.casters.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Casters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {match.casters.map((caster, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-700/50 rounded-lg">
                        <FaMicrophone className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-medium">{caster}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'results' && (
            <div className="space-y-6">
              {match.status === 'completed' && match.match_result ? (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
                  <h3 className="text-white font-bold text-lg mb-4">Match Results</h3>
                  <div className="space-y-4">
                    {match.match_result.winner && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-lg p-4 border border-yellow-500/30">
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 font-semibold">Winner:</span>
                          <span className="text-yellow-400 font-bold text-xl">
                            {match.match_result.winner}
                          </span>
                        </div>
                      </div>
                    )}
                    {match.match_result.runner_up && (
                      <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <span className="text-gray-400">Runner-up:</span>
                        <span className="text-white font-semibold">{match.match_result.runner_up}</span>
                      </div>
                    )}
                    {match.match_result.scores && Object.keys(match.match_result.scores).length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">Scores</h4>
                        <div className="space-y-2">
                          {Object.entries(match.match_result.scores).map(([team, score]) => (
                            <div key={team} className="flex justify-between">
                              <span className="text-gray-400">{team}:</span>
                              <span className="text-white font-semibold">{score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FaTrophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No results available yet</p>
                  <p className="text-sm mt-2">Results will be available after match completion</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminTournamentsMatches