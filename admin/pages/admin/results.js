import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaTrophy, 
  FaMedal, 
  FaAward, 
  FaCalendar,
  FaGamepad,
  FaUsers,
  FaRupeeSign,
  FaCrown,
  FaStar,
  FaFire,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaEye,
  FaTimesCircle
} from 'react-icons/fa'
import { GiLaurels, GiPodium, GiTrophyCup } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const AdminResultsPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [results, setResults] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingResult, setEditingResult] = useState(null)
  const [filters, setFilters] = useState({
    tournament: 'all',
    game: 'all',
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
        .select('id, title, game_name, game_image, start_date, end_date, total_prize_pool, max_participants, current_participants')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load results
      const { data: resultsData, error: resultsError } = await supabase
        .from('tournament_results')
        .select(`
          *,
          tournament:tournaments (
            id,
            title,
            game_name,
            game_image,
            start_date,
            end_date,
            total_prize_pool,
            max_participants,
            current_participants
          )
        `)
        .order('created_at', { ascending: false })

      if (resultsError) throw resultsError

      // Load ALL users for dropdowns
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, gamer_tag, avatar_url')
        .order('username', { ascending: true })

      if (usersError) throw usersError

      setTournaments(tournamentsData || [])
      setResults(resultsData || [])
      setAllUsers(usersData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getUserById = (userId) => {
    const user = allUsers.find(u => u.id === userId)
    return user || { 
      username: 'Unknown User', 
      gamer_tag: 'N/A',
      email: 'N/A'
    }
  }

  const getTournamentById = (tournamentId) => {
    return tournaments.find(t => t.id === tournamentId) || { 
      title: 'Unknown Tournament', 
      game_name: 'N/A'
    }
  }

  const deleteResult = async (resultId) => {
    if (!confirm('Are you sure you want to delete this result? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tournament_results')
        .delete()
        .eq('id', resultId)

      if (error) throw error

      await loadData()
      alert('✅ Result deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting result:', error)
      alert('❌ Error deleting result: ' + error.message)
    }
  }

  const handleCreateResult = async (resultData) => {
    try {
      const { error } = await supabase
        .from('tournament_results')
        .insert([resultData])

      if (error) throw error

      await loadData()
      setShowCreateModal(false)
      alert('✅ Result created successfully!')
      
    } catch (error) {
      console.error('Error creating result:', error)
      alert('❌ Error creating result: ' + error.message)
    }
  }

  const handleUpdateResult = async (resultId, updates) => {
    try {
      const { error } = await supabase
        .from('tournament_results')
        .update(updates)
        .eq('id', resultId)

      if (error) throw error

      await loadData()
      setEditingResult(null)
      alert('✅ Result updated successfully!')
      
    } catch (error) {
      console.error('Error updating result:', error)
      alert('❌ Error updating result: ' + error.message)
    }
  }

  // Filter results
  const filteredResults = results.filter(result => {
    const tournament = result.tournament

    if (filters.tournament !== 'all' && result.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.game !== 'all' && tournament?.game_name?.toLowerCase() !== filters.game.toLowerCase()) {
      return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        tournament?.title?.toLowerCase().includes(searchTerm) ||
        tournament?.game_name?.toLowerCase().includes(searchTerm) ||
        getUserById(result.winner_id)?.username?.toLowerCase().includes(searchTerm) ||
        getUserById(result.runner_up_id)?.username?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: results.length,
    totalPrizePool: results.reduce((sum, result) => sum + (result.tournament?.total_prize_pool || 0), 0),
    totalParticipants: results.reduce((sum, result) => sum + (result.total_participants || 0), 0),
    uniqueWinners: new Set(results.map(result => result.winner_id)).size
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Results...</p>
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
                <GiTrophyCup className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Results Management</h1>
                <p className="text-cyan-400">Manage tournament results and winners</p>
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
                <span>Add Result</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Results</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <GiTrophyCup className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Prize Pool</p>
                <p className="text-3xl font-bold text-white">
                  ₹{stats.totalPrizePool.toLocaleString()}
                </p>
              </div>
              <FaRupeeSign className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Participants</p>
                <p className="text-3xl font-bold text-white">{stats.totalParticipants}</p>
              </div>
              <FaUsers className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unique Winners</p>
                <p className="text-3xl font-bold text-white">{stats.uniqueWinners}</p>
              </div>
              <FaCrown className="w-8 h-8 text-yellow-400" />
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
                Game
              </label>
              <select
                value={filters.game}
                onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Games</option>
                <option value="valorant">Valorant</option>
                <option value="cs:go">CS:GO</option>
                <option value="league of legends">League of Legends</option>
                <option value="dota 2">Dota 2</option>
                <option value="fortnite">Fortnite</option>
                <option value="apex legends">Apex Legends</option>
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
                placeholder="Search by tournament, game, or winner..."
              />
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Winner</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Runner-up</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Prize Pool</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Participants</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Date</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-400">
                      <GiTrophyCup className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No results found</p>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map(result => (
                    <ResultRow
                      key={result.id}
                      result={result}
                      tournament={result.tournament}
                      winner={getUserById(result.winner_id)}
                      runnerUp={getUserById(result.runner_up_id)}
                      onViewDetails={() => {
                        setSelectedResult(result)
                        setShowDetailsModal(true)
                      }}
                      onEdit={() => setEditingResult(result)}
                      onDelete={() => deleteResult(result.id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Result Details Modal */}
      {showDetailsModal && selectedResult && (
        <ResultDetailsModal
          result={selectedResult}
          tournament={selectedResult.tournament}
          winner={getUserById(selectedResult.winner_id)}
          runnerUp={getUserById(selectedResult.runner_up_id)}
          thirdPlace={getUserById(selectedResult.third_place_id)}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setShowDetailsModal(false)
            setEditingResult(selectedResult)
          }}
          onDelete={() => {
            setShowDetailsModal(false)
            deleteResult(selectedResult.id)
          }}
        />
      )}

      {/* Create/Edit Result Modal */}
      {(showCreateModal || editingResult) && (
        <ResultFormModal
          result={editingResult}
          tournaments={tournaments}
          users={allUsers}
          onClose={() => {
            setShowCreateModal(false)
            setEditingResult(null)
          }}
          onSubmit={editingResult ? 
            (data) => handleUpdateResult(editingResult.id, data) :
            handleCreateResult
          }
        />
      )}
    </div>
  )
}

// Result Row Component
const ResultRow = ({ result, tournament, winner, runnerUp, onViewDetails, onEdit, onDelete }) => {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaGamepad className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">
              {tournament?.title || 'Unknown Tournament'}
            </div>
            <div className="text-gray-400 text-sm">{tournament?.game_name}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <FaCrown className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-white font-medium">{winner?.username || 'N/A'}</div>
            <div className="text-gray-400 text-sm">{winner?.gamer_tag}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <FaMedal className="w-4 h-4 text-gray-400" />
          <div>
            <div className="text-white font-medium">{runnerUp?.username || 'N/A'}</div>
            <div className="text-gray-400 text-sm">{runnerUp?.gamer_tag}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-green-400 font-bold">
          ₹{tournament?.total_prize_pool?.toLocaleString() || 0}
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-white font-medium">
          {result.total_participants || tournament?.current_participants || 0}
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-gray-300 text-sm">
          {new Date(result.completed_at || result.created_at).toLocaleDateString()}
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

// Result Details Modal Component
const ResultDetailsModal = ({ result, tournament, winner, runnerUp, thirdPlace, onClose, onEdit, onDelete }) => {
  const podiumPlayers = [
    { position: 1, player: winner, prize: result.prize_distribution?.winner, icon: FaCrown },
    { position: 2, player: runnerUp, prize: result.prize_distribution?.runner_up, icon: FaMedal },
    { position: 3, player: thirdPlace, prize: result.prize_distribution?.third_place, icon: FaAward }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Result Details</h2>
              <p className="text-cyan-400">{tournament?.title}</p>
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
          {/* Tournament Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30 mb-6">
            <h3 className="text-white font-bold text-lg mb-4">Tournament Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Tournament Name</label>
                <p className="text-white font-semibold">{tournament?.title}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Game</label>
                <p className="text-white font-semibold">{tournament?.game_name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Total Prize Pool</label>
                <p className="text-green-400 font-bold">₹{tournament?.total_prize_pool?.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Participants</label>
                <p className="text-white font-semibold">{result.total_participants || tournament?.current_participants}</p>
              </div>
            </div>
          </div>

          {/* Podium */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30 mb-6">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center space-x-2">
              <GiPodium className="w-5 h-5 text-purple-400" />
              <span>Tournament Podium</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {podiumPlayers.map(({ position, player, prize, icon: Icon }) => (
                <div key={position} className={`text-center transform ${position === 1 ? '-translate-y-4' : ''}`}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center border-4 ${
                    position === 1 ? 'bg-yellow-500/20 border-yellow-400' :
                    position === 2 ? 'bg-gray-500/20 border-gray-400' :
                    'bg-orange-500/20 border-orange-400'
                  }`}>
                    <Icon className={`w-8 h-8 ${
                      position === 1 ? 'text-yellow-400' :
                      position === 2 ? 'text-gray-400' :
                      'text-orange-400'
                    }`} />
                  </div>
                  
                  <div className={`font-semibold mb-2 ${
                    position === 1 ? 'text-yellow-300' : 'text-gray-300'
                  }`}>
                    {position === 1 ? 'CHAMPION' : `${position}${position === 2 ? 'nd' : 'rd'} PLACE`}
                  </div>
                  
                  <div className="text-white font-bold text-lg mb-1">
                    {player?.username || 'N/A'}
                  </div>
                  
                  <div className="text-gray-400 text-sm mb-2">
                    {player?.gamer_tag || ''}
                  </div>
                  
                  <div className={`text-lg font-bold ${
                    position === 1 ? 'text-yellow-400' : 'text-cyan-400'
                  }`}>
                    ₹{prize?.toLocaleString() || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/30">
              <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                <FaRupeeSign className="w-4 h-4 text-green-400" />
                <span>Prize Distribution</span>
              </h4>
              <div className="space-y-2">
                {result.prize_distribution && Object.entries(result.prize_distribution).map(([position, prize]) => (
                  <div key={position} className="flex justify-between items-center">
                    <span className="text-gray-400 capitalize">{position.replace('_', ' ')}</span>
                    <span className="text-green-400 font-semibold">₹{prize.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-blue-500/30">
              <h4 className="text-white font-bold mb-4 flex items-center space-x-2">
                <FaCalendar className="w-4 h-4 text-blue-400" />
                <span>Match Details</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Final Score</span>
                  <span className="text-white font-semibold">{result.final_score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed On</span>
                  <span className="text-white">
                    {new Date(result.completed_at || result.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-cyan-500/20 bg-gray-800/50">
          <div className="flex space-x-4">
            <button
              onClick={onDelete}
              className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Delete Result
            </button>
            
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Edit Result
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Result Form Modal Component
const ResultFormModal = ({ result, tournaments, users, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tournament_id: result?.tournament_id || '',
    winner_id: result?.winner_id || '',
    runner_up_id: result?.runner_up_id || '',
    third_place_id: result?.third_place_id || '',
    fourth_place_id: result?.fourth_place_id || '',
    fifth_place_id: result?.fifth_place_id || '',
    final_score: result?.final_score || '',
    total_participants: result?.total_participants || '',
    completed_at: result?.completed_at ? new Date(result.completed_at).toISOString().split('T')[0] : '',
    prize_distribution: result?.prize_distribution || {
      winner: 0,
      runner_up: 0,
      third_place: 0,
      fourth_place: 0,
      fifth_place: 0
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data for submission - convert empty strings to null for UUID fields
    const submissionData = {
      ...formData,
      // Convert empty strings to null for optional UUID fields
      third_place_id: formData.third_place_id || null,
      fourth_place_id: formData.fourth_place_id || null,
      fifth_place_id: formData.fifth_place_id || null,
      // Ensure required fields are properly set
      tournament_id: formData.tournament_id,
      winner_id: formData.winner_id,
      runner_up_id: formData.runner_up_id,
      // Convert total_participants to integer
      total_participants: parseInt(formData.total_participants) || 0,
      // Ensure prize distribution values are numbers
      prize_distribution: {
        winner: parseInt(formData.prize_distribution.winner) || 0,
        runner_up: parseInt(formData.prize_distribution.runner_up) || 0,
        third_place: parseInt(formData.prize_distribution.third_place) || 0,
        fourth_place: parseInt(formData.prize_distribution.fourth_place) || 0,
        fifth_place: parseInt(formData.prize_distribution.fifth_place) || 0,
      }
    }

    // Validate required fields
    if (!submissionData.tournament_id) {
      alert('Please select a tournament')
      return
    }
    if (!submissionData.winner_id) {
      alert('Please select a winner')
      return
    }
    if (!submissionData.runner_up_id) {
      alert('Please select a runner-up')
      return
    }

    onSubmit(submissionData)
  }

  const handlePrizeChange = (position, value) => {
    setFormData(prev => ({
      ...prev,
      prize_distribution: {
        ...prev.prize_distribution,
        [position]: parseInt(value) || 0
      }
    }))
  }

  // Handle input changes with proper value conversion
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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
                {result ? 'Edit Result' : 'Add New Result'}
              </h2>
              <p className="text-cyan-400">Enter tournament result details</p>
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

            {/* Winners */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Winner *
                </label>
                <select
                  required
                  value={formData.winner_id}
                  onChange={(e) => handleInputChange('winner_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Winner</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Runner-up *
                </label>
                <select
                  required
                  value={formData.runner_up_id}
                  onChange={(e) => handleInputChange('runner_up_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Runner-up</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Third Place
                </label>
                <select
                  value={formData.third_place_id}
                  onChange={(e) => handleInputChange('third_place_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Third Place</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Placement Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Fourth Place
                </label>
                <select
                  value={formData.fourth_place_id}
                  onChange={(e) => handleInputChange('fourth_place_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Fourth Place</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Fifth Place
                </label>
                <select
                  value={formData.fifth_place_id}
                  onChange={(e) => handleInputChange('fifth_place_id', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="">Select Fifth Place</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.gamer_tag || 'No tag'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prize Distribution */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-green-500/30">
              <h4 className="text-white font-bold mb-4">Prize Distribution</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(formData.prize_distribution).map(([position, prize]) => (
                  <div key={position}>
                    <label className="block text-gray-300 text-sm font-medium mb-2 capitalize">
                      {position.replace('_', ' ')}
                    </label>
                    <input
                      type="number"
                      value={prize}
                      onChange={(e) => handlePrizeChange(position, e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500 transition-colors"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Final Score
                </label>
                <input
                  type="text"
                  value={formData.final_score}
                  onChange={(e) => handleInputChange('final_score', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g., 3-1, 2-0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Total Participants
                </label>
                <input
                  type="number"
                  value={formData.total_participants}
                  onChange={(e) => handleInputChange('total_participants', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Number of participants"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Completion Date
              </label>
              <input
                type="date"
                value={formData.completed_at}
                onChange={(e) => handleInputChange('completed_at', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
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
              {result ? 'Update Result' : 'Create Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminResultsPage