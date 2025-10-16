import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { 
  FaUsers, 
  FaTrophy, 
  FaCrown, 
  FaGamepad, 
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaStar,
  FaMedal,
  FaAward,
  FaFire,
  FaShieldAlt,
  FaCrosshairs,
  FaHeart,
  FaGlobe,
  FaTwitter,
  FaTwitch,
  FaDiscord
} from 'react-icons/fa'
import { GiTrophyCup, GiRank3, GiPodium } from 'react-icons/gi'

const PlayersPage = () => {
  const router = useRouter()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    sortBy: 'tournaments',
    game: 'all',
    role: 'all'
  })

  // Stats state
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTournaments: 0,
    totalWins: 0,
    activePlayers: 0
  })

  useEffect(() => {
    fetchPlayers()
  }, [])

  useEffect(() => {
    filterAndSortPlayers()
  }, [players, searchTerm, filters])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Starting to fetch players...')

      // First, let's test the basic users query
      const { data: usersData, error: usersError, count } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Raw users data:', usersData)
      console.log('❌ Users query error:', usersError)
      console.log('👥 User count:', count)

      if (usersError) {
        console.error('Supabase users error:', usersError)
        throw new Error(`Failed to fetch users: ${usersError.message}`)
      }

      if (!usersData || usersData.length === 0) {
        console.log('ℹ️ No users found in database, using sample data')
        // Load sample data for testing
        loadSampleData()
        return
      }

      // Try to fetch tournament data if the tables exist
      let tournamentData = []
      try {
        const { data: tournaments, error: tournamentsError } = await supabase
          .from('tournament_enrollments')
          .select('*')
          .limit(10)
        
        if (!tournamentsError) {
          tournamentData = tournaments || []
          console.log('🎯 Tournament enrollments:', tournamentData)
        }
      } catch (tournamentErr) {
        console.log('ℹ️ Tournament enrollments table might not exist, using placeholder data')
      }

      // Process player data with stats
      const processedPlayers = usersData.map(user => {
        console.log('👤 Processing user:', user.username || user.id)
        
        // Generate realistic placeholder stats based on user data
        const userSeed = user.id?.slice(-4) || Math.random().toString(36).substr(2, 4)
        const tournaments = parseInt(userSeed, 36) % 50 + 1
        const wins = Math.max(1, Math.floor(tournaments * (0.3 + (parseInt(userSeed, 36) % 20) / 100)))
        const winRate = tournaments > 0 ? `${Math.round((wins / tournaments) * 100)}%` : '0%'
        const level = calculatePlayerLevel(tournaments, wins)

        // Determine favorite game based on available data or use defaults
        const games = ['Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 'Fortnite', 'Apex Legends']
        const favoriteGame = games[parseInt(userSeed, 36) % games.length]

        return {
          ...user,
          username: user.username || `player_${user.id?.slice(-6)}` || 'Unknown',
          gamer_tag: user.gamer_tag || user.username || 'No Tag',
          stats: {
            tournaments: tournaments,
            wins: wins,
            winRate: winRate,
            level: level,
            favoriteGame: favoriteGame,
            recentActivity: user.last_sign_in_at || user.created_at || new Date().toISOString()
          }
        }
      })

      console.log('✅ Processed players:', processedPlayers)
      setPlayers(processedPlayers)

      // Calculate overall stats
      const totalTournaments = processedPlayers.reduce((sum, player) => sum + player.stats.tournaments, 0)
      const totalWins = processedPlayers.reduce((sum, player) => sum + player.stats.wins, 0)
      
      setStats({
        totalPlayers: processedPlayers.length,
        totalTournaments: totalTournaments,
        totalWins: totalWins,
        activePlayers: processedPlayers.filter(p => 
          new Date(p.stats.recentActivity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length
      })

    } catch (error) {
      console.error('❌ Error fetching players:', error)
      setError(error.message)
      // Load sample data as fallback
      loadSampleData()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleData = () => {
    console.log('🔄 Loading sample data...')
    const samplePlayers = [
      {
        id: '1',
        username: 'ProPlayer1',
        gamer_tag: 'PRO1',
        avatar_url: null,
        created_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString(),
        stats: {
          tournaments: 45,
          wins: 28,
          winRate: '62%',
          level: 32,
          favoriteGame: 'Valorant',
          recentActivity: new Date().toISOString()
        }
      },
      {
        id: '2',
        username: 'EliteGamer',
        gamer_tag: 'ELITE',
        avatar_url: null,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        last_sign_in_at: new Date().toISOString(),
        stats: {
          tournaments: 67,
          wins: 42,
          winRate: '63%',
          level: 45,
          favoriteGame: 'CS:GO',
          recentActivity: new Date().toISOString()
        }
      },
      {
        id: '3',
        username: 'RookieRiser',
        gamer_tag: 'ROOKIE',
        avatar_url: null,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 86400000).toISOString(),
        stats: {
          tournaments: 12,
          wins: 5,
          winRate: '42%',
          level: 8,
          favoriteGame: 'Fortnite',
          recentActivity: new Date(Date.now() - 86400000).toISOString()
        }
      },
      {
        id: '4',
        username: 'StrategyMaster',
        gamer_tag: 'STRAT',
        avatar_url: null,
        created_at: new Date(Date.now() - 259200000).toISOString(),
        last_sign_in_at: new Date().toISOString(),
        stats: {
          tournaments: 89,
          wins: 51,
          winRate: '57%',
          level: 38,
          favoriteGame: 'League of Legends',
          recentActivity: new Date().toISOString()
        }
      },
      {
        id: '5',
        username: 'ApexPredator',
        gamer_tag: 'APEX',
        avatar_url: null,
        created_at: new Date(Date.now() - 345600000).toISOString(),
        last_sign_in_at: new Date(Date.now() - 172800000).toISOString(),
        stats: {
          tournaments: 23,
          wins: 14,
          winRate: '61%',
          level: 15,
          favoriteGame: 'Apex Legends',
          recentActivity: new Date(Date.now() - 172800000).toISOString()
        }
      },
      {
        id: '6',
        username: 'DotaChampion',
        gamer_tag: 'DOTA',
        avatar_url: null,
        created_at: new Date(Date.now() - 432000000).toISOString(),
        last_sign_in_at: new Date().toISOString(),
        stats: {
          tournaments: 156,
          wins: 89,
          winRate: '57%',
          level: 50,
          favoriteGame: 'Dota 2',
          recentActivity: new Date().toISOString()
        }
      }
    ]

    setPlayers(samplePlayers)
    setFilteredPlayers(samplePlayers)
    
    const totalTournaments = samplePlayers.reduce((sum, player) => sum + player.stats.tournaments, 0)
    const totalWins = samplePlayers.reduce((sum, player) => sum + player.stats.wins, 0)
    
    setStats({
      totalPlayers: samplePlayers.length,
      totalTournaments: totalTournaments,
      totalWins: totalWins,
      activePlayers: samplePlayers.filter(p => 
        new Date(p.stats.recentActivity) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      ).length
    })
  }

  const calculatePlayerLevel = (tournaments, wins) => {
    if (tournaments === 0) return 1
    const baseLevel = Math.floor(tournaments / 5) + 1
    const winBonus = Math.floor(wins / 3)
    return Math.min(baseLevel + winBonus, 50) // Cap at level 50
  }

  const filterAndSortPlayers = () => {
    let filtered = [...players]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.gamer_tag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.stats.favoriteGame.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort players
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'tournaments':
          return b.stats.tournaments - a.stats.tournaments
        case 'wins':
          return b.stats.wins - a.stats.wins
        case 'winRate':
          return parseFloat(b.stats.winRate) - parseFloat(a.stats.winRate)
        case 'level':
          return b.stats.level - a.stats.level
        case 'recent':
          return new Date(b.stats.recentActivity) - new Date(a.stats.recentActivity)
        default:
          return 0
      }
    })

    console.log('🔍 Filtered players:', filtered.length)
    setFilteredPlayers(filtered)
  }

  const getLevelColor = (level) => {
    if (level >= 40) return 'text-purple-400'
    if (level >= 30) return 'text-red-400'
    if (level >= 20) return 'text-orange-400'
    if (level >= 10) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getLevelBadge = (level) => {
    if (level >= 40) return { color: 'bg-purple-500', text: 'Legend' }
    if (level >= 30) return { color: 'bg-red-500', text: 'Master' }
    if (level >= 20) return { color: 'bg-orange-500', text: 'Expert' }
    if (level >= 10) return { color: 'bg-yellow-500', text: 'Veteran' }
    return { color: 'bg-green-500', text: 'Rookie' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Players...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching player data from database</p>
        </div>
      </div>
    )
  }

  if (error && players.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUsers className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Error Loading Players</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <p className="text-gray-500 text-sm mb-4">
            Showing sample data instead. Check your Supabase connection and database setup.
          </p>
          <button
            onClick={fetchPlayers}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            Retry Connection
          </button>
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
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm">
                  <strong>Debug Info:</strong> {players.length} players loaded | 
                  {error ? ` Error: ${error}` : ' Connected to Supabase'}
                </p>
              </div>
              <button 
                onClick={() => {
                  console.log('Players data:', players)
                  console.log('Filtered players:', filteredPlayers)
                }}
                className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm hover:bg-yellow-500/30"
              >
                Log Data
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Elite Players
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Meet the champions, strategists, and rising stars of the RushX gaming community
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaUsers className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalPlayers}</div>
            <div className="text-gray-400">Total Players</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GiTrophyCup className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalTournaments}</div>
            <div className="text-gray-400">Tournaments Played</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaCrown className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.totalWins}</div>
            <div className="text-gray-400">Total Wins</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaFire className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.activePlayers}</div>
            <div className="text-gray-400">Active Players</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search players by name, gamer tag, or game..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              >
                <option value="tournaments">Most Tournaments</option>
                <option value="wins">Most Wins</option>
                <option value="winRate">Best Win Rate</option>
                <option value="level">Highest Level</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-cyan-400 font-semibold">
                {filteredPlayers.length} {filteredPlayers.length === 1 ? 'Player' : 'Players'}
              </span>
            </div>
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredPlayers.map((player, index) => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              rank={index + 1}
              onViewProfile={() => router.push(`/profile/${player.username || player.id}`)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUsers className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Players Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ sortBy: 'tournaments', game: 'all', role: 'all' })
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Player Card Component
const PlayerCard = ({ player, rank, onViewProfile }) => {
  const levelBadge = getLevelBadge(player.stats.level)
  
  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-yellow-500 text-white'
    if (rank === 2) return 'bg-gray-400 text-white'
    if (rank === 3) return 'bg-orange-500 text-white'
    return 'bg-cyan-500 text-white'
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <FaCrown className="w-3 h-3" />
    if (rank === 2) return <FaMedal className="w-3 h-3" />
    if (rank === 3) return <FaAward className="w-3 h-3" />
    return <FaStar className="w-3 h-3" />
  }

  return (
    <div 
      className="group bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
      onClick={onViewProfile}
    >
      {/* Header with Avatar and Rank */}
      <div className="relative h-32 bg-gradient-to-r from-cyan-500/20 to-purple-600/20">
        {/* Rank Badge */}
        <div className={`absolute top-4 left-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(rank)}`}>
          {getRankIcon(rank)}
        </div>

        {/* Level Badge */}
        <div className={`absolute top-4 right-4 ${levelBadge.color} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
          {levelBadge.text}
        </div>

        {/* Avatar */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl border-4 border-gray-900 shadow-2xl flex items-center justify-center overflow-hidden">
            {player.avatar_url ? (
              <img 
                src={player.avatar_url} 
                alt={player.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 pb-6 px-6 text-center">
        {/* Player Name and Tag */}
        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300">
          {player.username || 'Player'}
        </h3>
        <div className="flex items-center justify-center space-x-2 text-cyan-400 mb-4">
          <FaGamepad className="w-3 h-3" />
          <span className="text-sm font-semibold">{player.gamer_tag || 'No tag'}</span>
        </div>

        {/* Level and Favorite Game */}
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center space-x-1">
            <FaStar className="w-3 h-3" />
            <span>Level {player.stats.level}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaCrosshairs className="w-3 h-3" />
            <span>{player.stats.favoriteGame}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{player.stats.tournaments}</div>
            <div className="text-gray-400 text-xs">Tournaments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{player.stats.wins}</div>
            <div className="text-gray-400 text-xs">Wins</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{player.stats.winRate}</div>
            <div className="text-gray-400 text-xs">Win Rate</div>
          </div>
        </div>

        {/* Social Links - Placeholder for now */}
        <div className="flex justify-center space-x-3 mb-4">
          <div className="w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center opacity-50">
            <FaTwitch className="w-3 h-3 text-purple-400" />
          </div>
          <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center opacity-50">
            <FaDiscord className="w-3 h-3 text-blue-400" />
          </div>
          <div className="w-6 h-6 bg-cyan-500/20 rounded flex items-center justify-center opacity-50">
            <FaTwitter className="w-3 h-3 text-cyan-400" />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation()
            onViewProfile()
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105 text-sm"
        >
          View Profile
        </button>
      </div>
    </div>
  )
}

// Helper function to get level badge
function getLevelBadge(level) {
  if (level >= 40) return { color: 'bg-purple-500', text: 'Legend' }
  if (level >= 30) return { color: 'bg-red-500', text: 'Master' }
  if (level >= 20) return { color: 'bg-orange-500', text: 'Expert' }
  if (level >= 10) return { color: 'bg-yellow-500', text: 'Veteran' }
  return { color: 'bg-green-500', text: 'Rookie' }
}

export default PlayersPage