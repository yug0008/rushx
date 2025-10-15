import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaTrophy, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch,
  FaFilter,
  FaSync,
  FaUsers,
  FaSkull,
  FaHeart,
  FaCrosshairs,
  FaClock,
  FaMedal,
  FaBan,
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaChartLine,
  FaCrown,
  FaArrowLeft,
  FaSave,
  FaCalculator
} from 'react-icons/fa'
import { GiTrophyCup, GiPodium } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const AdminTournamentsLeaderboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [leaderboard, setLeaderboard] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [profiles, setProfiles] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [showEntryModal, setShowEntryModal] = useState(false)
  const [showStatsModal, setShowStatsModal] = useState(false)
  const [filters, setFilters] = useState({
    tournament: 'all',
    search: '',
    status: 'all' // all, qualified, disqualified
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
        .select('id, title, slug, game_name, prize_pool')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load leaderboard with user data
      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from('tournament_leaderboard')
        .select(`
          *,
          tournaments:tournament_id (
            title,
            slug,
            game_name,
            prize_pool
          )
        `)
        .order('score', { ascending: false })

      if (leaderboardError) throw leaderboardError

      // Load user profiles for leaderboard entries
      const userIds = [...new Set(leaderboardData?.map(entry => entry.user_id) || [])]
      const profilesData = {}

      for (const userId of userIds) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username, email, gamer_tag, avatar_url')
          .eq('id', userId)
          .single()

        if (!profileError && profile) {
          profilesData[userId] = profile
        } else {
          profilesData[userId] = { 
            username: 'Unknown User', 
            email: 'N/A', 
            gamer_tag: 'N/A',
            avatar_url: null
          }
        }
      }

      // Calculate rank positions
      const rankedLeaderboard = calculateRanks(leaderboardData || [])

      setTournaments(tournamentsData || [])
      setLeaderboard(rankedLeaderboard)
      setProfiles(profilesData)

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const calculateRanks = (entries) => {
    return entries
      .sort((a, b) => b.score - a.score || b.kills - a.kills)
      .map((entry, index) => ({
        ...entry,
        rank_position: index + 1
      }))
  }

  const handleCreateEntry = () => {
    setSelectedEntry(null)
    setShowEntryModal(true)
  }

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry)
    setShowEntryModal(true)
  }

  const handleViewStats = (entry) => {
    setSelectedEntry(entry)
    setShowStatsModal(true)
  }

  const handleDeleteEntry = async (entry) => {
    if (confirm(`Are you sure you want to delete ${getUserProfile(entry.user_id)?.gamer_tag}'s leaderboard entry?`)) {
      try {
        const { error } = await supabase
          .from('tournament_leaderboard')
          .delete()
          .eq('id', entry.id)

        if (error) throw error

        await loadData()
        alert('Leaderboard entry deleted successfully!')
      } catch (error) {
        console.error('Error deleting entry:', error)
        alert('Error deleting entry: ' + error.message)
      }
    }
  }

  const toggleDisqualification = async (entry) => {
    const newStatus = !entry.is_disqualified
    const reason = newStatus ? prompt('Enter disqualification reason:') : null

    if (newStatus && reason === null) return // User cancelled

    try {
      const updates = {
        is_disqualified: newStatus,
        disqualification_reason: newStatus ? reason : null
      }

      const { error } = await supabase
        .from('tournament_leaderboard')
        .update(updates)
        .eq('id', entry.id)

      if (error) throw error

      await loadData()
      alert(`Player ${newStatus ? 'disqualified' : 'reinstated'} successfully!`)
    } catch (error) {
      console.error('Error updating disqualification status:', error)
      alert('Error updating status: ' + error.message)
    }
  }

  const distributePrize = async (entry) => {
    const amount = prompt(`Enter prize amount for ${getUserProfile(entry.user_id)?.gamer_tag}:`, entry.prize_won || '0')
    
    if (amount === null) return // User cancelled

    const prizeAmount = parseFloat(amount)
    if (isNaN(prizeAmount) || prizeAmount < 0) {
      alert('Please enter a valid prize amount')
      return
    }

    try {
      const updates = {
        prize_won: prizeAmount,
        prize_distributed: true
      }

      const { error } = await supabase
        .from('tournament_leaderboard')
        .update(updates)
        .eq('id', entry.id)

      if (error) throw error

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: entry.user_id,
          title: 'Prize Distributed! 🎉',
          message: `Congratulations! You have won ₹${prizeAmount} in ${entry.tournaments?.title}. The amount will be transferred within 24-48 hours.`,
          type: 'success',
          related_tournament_id: entry.tournament_id
        })

      await loadData()
      alert('Prize distributed successfully! User has been notified.')
    } catch (error) {
      console.error('Error distributing prize:', error)
      alert('Error distributing prize: ' + error.message)
    }
  }

  const recalculateRanks = async () => {
    try {
      const updatedLeaderboard = calculateRanks(leaderboard)
      
      // Update ranks in database
      for (const entry of updatedLeaderboard) {
        const { error } = await supabase
          .from('tournament_leaderboard')
          .update({ rank_position: entry.rank_position })
          .eq('id', entry.id)

        if (error) throw error
      }

      setLeaderboard(updatedLeaderboard)
      alert('Ranks recalculated successfully!')
    } catch (error) {
      console.error('Error recalculating ranks:', error)
      alert('Error recalculating ranks: ' + error.message)
    }
  }

  const getUserProfile = (userId) => {
    return profiles[userId] || { 
      username: 'Unknown User', 
      email: 'N/A', 
      gamer_tag: 'N/A',
      avatar_url: null
    }
  }

  const getTournamentById = (tournamentId) => {
    return tournaments.find(t => t.id === tournamentId) || { 
      title: 'Unknown Tournament', 
      game_name: 'N/A'
    }
  }

  // Filter leaderboard
  const filteredLeaderboard = leaderboard.filter(entry => {
    const userProfile = getUserProfile(entry.user_id)

    if (filters.tournament !== 'all' && entry.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.status !== 'all') {
      if (filters.status === 'disqualified' && !entry.is_disqualified) return false
      if (filters.status === 'qualified' && entry.is_disqualified) return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        userProfile.username?.toLowerCase().includes(searchTerm) ||
        userProfile.gamer_tag?.toLowerCase().includes(searchTerm) ||
        userProfile.email?.toLowerCase().includes(searchTerm) ||
        entry.team_id?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: leaderboard.length,
    disqualified: leaderboard.filter(e => e.is_disqualified).length,
    prizeDistributed: leaderboard.filter(e => e.prize_distributed).length,
    totalPrize: leaderboard.reduce((sum, entry) => sum + (entry.prize_won || 0), 0)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Leaderboard...</p>
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
                <h1 className="text-3xl font-bold text-white">Tournament Leaderboards</h1>
                <p className="text-cyan-400">Manage player rankings, stats, and prize distribution</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={recalculateRanks}
                className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaCalculator className="w-4 h-4" />
                <span>Recalc Ranks</span>
              </button>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaSync className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCreateEntry}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>New Entry</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Players</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaUsers className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Disqualified</p>
                <p className="text-3xl font-bold text-white">{stats.disqualified}</p>
              </div>
              <FaBan className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Prize Distributed</p>
                <p className="text-3xl font-bold text-white">{stats.prizeDistributed}</p>
              </div>
              <FaMoneyBillWave className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Prize</p>
                <p className="text-3xl font-bold text-yellow-400">₹{stats.totalPrize.toLocaleString()}</p>
              </div>
              <FaTrophy className="w-8 h-8 text-yellow-400" />
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
                <option value="all">All Players</option>
                <option value="qualified">Qualified</option>
                <option value="disqualified">Disqualified</option>
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
                placeholder="Search by player name, gamer tag, email, or team ID..."
              />
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Rank</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Player</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Stats</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Performance</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Prize</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      <GiPodium className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No leaderboard entries found</p>
                      <button
                        onClick={handleCreateEntry}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                      >
                        Create First Entry
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredLeaderboard.map(entry => (
                    <LeaderboardRow
                      key={entry.id}
                      entry={entry}
                      userProfile={getUserProfile(entry.user_id)}
                      onEdit={handleEditEntry}
                      onViewStats={handleViewStats}
                      onDelete={handleDeleteEntry}
                      onToggleDisqualification={toggleDisqualification}
                      onDistributePrize={distributePrize}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Entry Modal */}
      {showEntryModal && (
        <LeaderboardEntryModal
          entry={selectedEntry}
          tournaments={tournaments}
          onClose={() => setShowEntryModal(false)}
          onSave={loadData}
        />
      )}

      {/* Stats Modal */}
      {showStatsModal && selectedEntry && (
        <PlayerStatsModal
          entry={selectedEntry}
          userProfile={getUserProfile(selectedEntry.user_id)}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  )
}

// Leaderboard Row Component
const LeaderboardRow = ({ entry, userProfile, onEdit, onViewStats, onDelete, onToggleDisqualification, onDistributePrize }) => {
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-yellow-500/25">1</div>
    } else if (rank === 2) {
      return <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-gray-500/25">2</div>
    } else if (rank === 3) {
      return <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-500/25">3</div>
    } else {
      return <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 font-bold">{rank}</div>
    }
  }

  const getStatusBadge = (entry) => {
    if (entry.is_disqualified) {
      return (
        <span className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 w-fit">
          <FaBan className="w-3 h-3" />
          <span>Disqualified</span>
        </span>
      )
    }
    return (
      <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 w-fit">
        <FaCheckCircle className="w-3 h-3" />
        <span>Qualified</span>
      </span>
    )
  }

  return (
    <tr className={`border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300 ${
      entry.is_disqualified ? 'bg-red-500/5' : ''
    }`}>
      <td className="p-4">
        {getRankBadge(entry.rank_position)}
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-3">
          {userProfile.avatar_url ? (
            <img 
              src={userProfile.avatar_url} 
              alt={userProfile.gamer_tag}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center">
              <FaUsers className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <div className="text-white font-semibold">{userProfile.gamer_tag}</div>
            <div className="text-gray-400 text-sm">{userProfile.username}</div>
            {entry.team_id && (
              <div className="text-cyan-400 text-xs font-mono">Team: {entry.team_id}</div>
            )}
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <GiTrophyCup className="w-4 h-4 text-cyan-400" />
          <div>
            <div className="text-white font-medium">{entry.tournaments?.title}</div>
            <div className="text-gray-400 text-sm">{entry.tournaments?.game_name}</div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <FaTrophy className="w-3 h-3 text-yellow-400" />
            <span className="text-white font-semibold">{entry.score} pts</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaSkull className="w-3 h-3 text-green-400" />
            <span className="text-gray-300">{entry.kills} K / {entry.deaths} D</span>
          </div>
          <div className="text-gray-400 text-xs">
            K/D: {entry.kd_ratio || '0.00'}
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-sm">
            <FaChartLine className="w-3 h-3 text-blue-400" />
            <span className="text-gray-300">{entry.matches_played} matches</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FaCrown className="w-3 h-3 text-yellow-400" />
            <span className="text-gray-300">{entry.wins} wins</span>
          </div>
          {entry.average_damage > 0 && (
            <div className="text-gray-400 text-xs">
              Avg Dmg: {entry.average_damage}
            </div>
          )}
        </div>
      </td>
      
      <td className="p-4">
        <div className="space-y-1">
          {entry.prize_won > 0 ? (
            <>
              <div className="text-yellow-400 font-semibold flex items-center space-x-1">
                <FaMoneyBillWave className="w-3 h-3" />
                <span>₹{entry.prize_won.toLocaleString()}</span>
              </div>
              <div className={`text-xs ${
                entry.prize_distributed ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {entry.prize_distributed ? 'Distributed' : 'Pending'}
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No prize</div>
          )}
        </div>
      </td>
      
      <td className="p-4">
        {getStatusBadge(entry)}
      </td>
      
      <td className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => onViewStats(entry)}
            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
            title="View Stats"
          >
            <FaEye className="w-3 h-3" />
          </button>
          
          <button
            onClick={() => onEdit(entry)}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
            title="Edit Entry"
          >
            <FaEdit className="w-3 h-3" />
          </button>

          {entry.prize_won > 0 && !entry.prize_distributed && (
            <button
              onClick={() => onDistributePrize(entry)}
              className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
              title="Distribute Prize"
            >
              <FaMoneyBillWave className="w-3 h-3" />
            </button>
          )}

          <button
            onClick={() => onToggleDisqualification(entry)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-300 ${
              entry.is_disqualified
                ? 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30'
                : 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
            }`}
            title={entry.is_disqualified ? 'Reinstate Player' : 'Disqualify Player'}
          >
            {entry.is_disqualified ? (
              <FaCheckCircle className="w-3 h-3" />
            ) : (
              <FaBan className="w-3 h-3" />
            )}
          </button>
          
          <button
            onClick={() => onDelete(entry)}
            className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
            title="Delete Entry"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Leaderboard Entry Modal Component
const LeaderboardEntryModal = ({ entry, tournaments, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tournament_id: entry?.tournament_id || '',
    user_id: entry?.user_id || '',
    team_id: entry?.team_id || '',
    score: entry?.score || 0,
    kills: entry?.kills || 0,
    deaths: entry?.deaths || 0,
    assists: entry?.assists || 0,
    headshots: entry?.headshots || 0,
    matches_played: entry?.matches_played || 0,
    wins: entry?.wins || 0,
    average_damage: entry?.average_damage || 0,
    survival_time: entry?.survival_time || 0,
    prize_won: entry?.prize_won || 0,
    prize_distributed: entry?.prize_distributed || false,
    is_disqualified: entry?.is_disqualified || false,
    disqualification_reason: entry?.disqualification_reason || '',
    admin_notes: entry?.admin_notes || ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submissionData = {
        ...formData,
        score: parseInt(formData.score),
        kills: parseInt(formData.kills),
        deaths: parseInt(formData.deaths),
        assists: parseInt(formData.assists),
        headshots: parseInt(formData.headshots),
        matches_played: parseInt(formData.matches_played),
        wins: parseInt(formData.wins),
        average_damage: parseFloat(formData.average_damage),
        survival_time: parseInt(formData.survival_time),
        prize_won: parseFloat(formData.prize_won),
        kd_ratio: formData.deaths === 0 ? formData.kills : (formData.kills / formData.deaths).toFixed(2)
      }

      if (entry) {
        // Update existing entry
        const { error } = await supabase
          .from('tournament_leaderboard')
          .update(submissionData)
          .eq('id', entry.id)

        if (error) throw error
      } else {
        // Create new entry
        const { error } = await supabase
          .from('tournament_leaderboard')
          .insert([submissionData])

        if (error) throw error
      }

      onSave()
      onClose()
      alert(`Leaderboard entry ${entry ? 'updated' : 'created'} successfully!`)
    } catch (error) {
      console.error('Error saving entry:', error)
      alert('Error saving entry: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {entry ? 'Edit Leaderboard Entry' : 'Create New Leaderboard Entry'}
              </h2>
              <p className="text-cyan-400">Manage player statistics and rankings</p>
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
                <FaUsers className="w-5 h-5 text-cyan-400" />
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
                User ID *
              </label>
              <input
                type="text"
                required
                value={formData.user_id}
                onChange={(e) => setFormData(prev => ({ ...prev, user_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter user UUID"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Team ID
              </label>
              <input
                type="text"
                value={formData.team_id}
                onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Enter team ID"
              />
            </div>

            {/* Game Statistics */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaChartLine className="w-5 h-5 text-green-400" />
                <span>Game Statistics</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Score
              </label>
              <input
                type="number"
                min="0"
                value={formData.score}
                onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Kills
              </label>
              <input
                type="number"
                min="0"
                value={formData.kills}
                onChange={(e) => setFormData(prev => ({ ...prev, kills: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Deaths
              </label>
              <input
                type="number"
                min="0"
                value={formData.deaths}
                onChange={(e) => setFormData(prev => ({ ...prev, deaths: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Assists
              </label>
              <input
                type="number"
                min="0"
                value={formData.assists}
                onChange={(e) => setFormData(prev => ({ ...prev, assists: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Headshots
              </label>
              <input
                type="number"
                min="0"
                value={formData.headshots}
                onChange={(e) => setFormData(prev => ({ ...prev, headshots: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Matches Played
              </label>
              <input
                type="number"
                min="0"
                value={formData.matches_played}
                onChange={(e) => setFormData(prev => ({ ...prev, matches_played: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Wins
              </label>
              <input
                type="number"
                min="0"
                value={formData.wins}
                onChange={(e) => setFormData(prev => ({ ...prev, wins: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Average Damage
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.average_damage}
                onChange={(e) => setFormData(prev => ({ ...prev, average_damage: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Survival Time (seconds)
              </label>
              <input
                type="number"
                min="0"
                value={formData.survival_time}
                onChange={(e) => setFormData(prev => ({ ...prev, survival_time: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Prize Information */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaMoneyBillWave className="w-5 h-5 text-yellow-400" />
                <span>Prize Information</span>
              </h3>
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">
                Prize Won (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prize_won}
                onChange={(e) => setFormData(prev => ({ ...prev, prize_won: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="prize_distributed"
                checked={formData.prize_distributed}
                onChange={(e) => setFormData(prev => ({ ...prev, prize_distributed: e.target.checked }))}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="prize_distributed" className="text-white font-semibold">
                Prize Distributed
              </label>
            </div>

            {/* Admin Controls */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                <FaBan className="w-5 h-5 text-red-400" />
                <span>Admin Controls</span>
              </h3>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="is_disqualified"
                checked={formData.is_disqualified}
                onChange={(e) => setFormData(prev => ({ ...prev, is_disqualified: e.target.checked }))}
                className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
              <label htmlFor="is_disqualified" className="text-white font-semibold">
                Disqualified
              </label>
            </div>

            {formData.is_disqualified && (
              <div className="lg:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Disqualification Reason
                </label>
                <input
                  type="text"
                  value={formData.disqualification_reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, disqualification_reason: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Reason for disqualification"
                />
              </div>
            )}

            <div className="lg:col-span-2">
              <label className="block text-white font-semibold mb-2">
                Admin Notes
              </label>
              <textarea
                rows={3}
                value={formData.admin_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, admin_notes: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                placeholder="Internal admin notes..."
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
                  <span>{entry ? 'Update Entry' : 'Create Entry'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Player Stats Modal Component
const PlayerStatsModal = ({ entry, userProfile, onClose }) => {
  const stats = [
    { label: 'Total Score', value: entry.score, icon: FaTrophy, color: 'text-yellow-400' },
    { label: 'Kills', value: entry.kills, icon: FaSkull, color: 'text-green-400' },
    { label: 'Deaths', value: entry.deaths, icon: FaHeart, color: 'text-red-400' },
    { label: 'Assists', value: entry.assists, icon: FaUsers, color: 'text-blue-400' },
    { label: 'Headshots', value: entry.headshots, icon: FaCrosshairs, color: 'text-purple-400' },
    { label: 'Matches Played', value: entry.matches_played, icon: FaChartLine, color: 'text-cyan-400' },
    { label: 'Wins', value: entry.wins, icon: FaCrown, color: 'text-yellow-400' },
    { label: 'Win Rate', value: `${((entry.wins / entry.matches_played) * 100).toFixed(1)}%`, icon: FaTrophy, color: 'text-green-400' },
    { label: 'K/D Ratio', value: entry.kd_ratio || '0.00', icon: FaSkull, color: 'text-red-400' },
    { label: 'Average Damage', value: entry.average_damage || '0', icon: FaCrosshairs, color: 'text-orange-400' },
    { label: 'Survival Time', value: `${Math.floor(entry.survival_time / 60)}m ${entry.survival_time % 60}s`, icon: FaClock, color: 'text-blue-400' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {userProfile.avatar_url ? (
                <img 
                  src={userProfile.avatar_url} 
                  alt={userProfile.gamer_tag}
                  className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/50"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-cyan-500/50">
                  <FaUsers className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">{userProfile.gamer_tag}</h2>
                <p className="text-cyan-400">{userProfile.username} • {entry.tournaments?.title}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <FaTrophy className="w-4 h-4" />
                    <span className="font-semibold">Rank #{entry.rank_position}</span>
                  </div>
                  {entry.team_id && (
                    <div className="text-cyan-400 text-sm font-mono">
                      Team: {entry.team_id}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/30 transition-colors duration-300">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </div>
                <div className="text-gray-400 text-sm font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Prize Information */}
            {entry.prize_won > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                  <FaMoneyBillWave className="w-5 h-5 text-yellow-400" />
                  <span>Prize Information</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Amount Won:</span>
                    <span className="text-yellow-400 font-bold text-xl">₹{entry.prize_won.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${
                      entry.prize_distributed ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {entry.prize_distributed ? 'Distributed' : 'Pending Distribution'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Information */}
            <div className={`rounded-xl p-6 border ${
              entry.is_disqualified 
                ? 'bg-red-500/10 border-red-500/30' 
                : 'bg-green-500/10 border-green-500/30'
            }`}>
              <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
                {entry.is_disqualified ? (
                  <>
                    <FaBan className="w-5 h-5 text-red-400" />
                    <span>Disqualified</span>
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="w-5 h-5 text-green-400" />
                    <span>Qualified</span>
                  </>
                )}
              </h3>
              {entry.is_disqualified && entry.disqualification_reason && (
                <div className="text-red-300">
                  <strong>Reason:</strong> {entry.disqualification_reason}
                </div>
              )}
              {!entry.is_disqualified && (
                <div className="text-green-300">
                  Player is eligible for rankings and prizes.
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {entry.admin_notes && (
            <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center space-x-2">
                <FaEye className="w-5 h-5 text-cyan-400" />
                <span>Admin Notes</span>
              </h3>
              <p className="text-gray-300">{entry.admin_notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminTournamentsLeaderboard