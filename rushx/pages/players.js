import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { 
  FaUsers, 
  FaCrown, 
  FaGamepad, 
  FaSearch,
  FaStar,
  FaCrosshairs
} from 'react-icons/fa'

const PlayersPage = () => {
  const router = useRouter()
  const [players, setPlayers] = useState([])
  const [filteredPlayers, setFilteredPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    sortBy: 'level',
    game: 'all',
    role: 'all'
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

      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 Raw users data:', usersData)
      console.log('❌ Users query error:', usersError)

      if (usersError) {
        console.error('Supabase users error:', usersError)
        throw new Error(`Failed to fetch users: ${usersError.message}`)
      }

      if (!usersData || usersData.length === 0) {
        console.log('ℹ️ No users found in database, using sample data')
        loadSampleData()
        return
      }

      // Process player data
      const processedPlayers = usersData.map(user => {
        console.log('👤 Processing user:', user.username || user.id)
        
        const userSeed = user.id?.slice(-4) || Math.random().toString(36).substr(2, 4)
        const level = calculatePlayerLevel(user)
        const games = ['Valorant', 'CS:GO', 'League of Legends', 'Dota 2', 'Fortnite', 'Apex Legends']
        const favoriteGame = games[parseInt(userSeed, 36) % games.length]

        return {
          ...user,
          username: user.username || `player_${user.id?.slice(-6)}` || 'Unknown',
          gamer_tag: user.gamer_tag || user.username || 'No Tag',
          stats: {
            level: level,
            favoriteGame: favoriteGame,
            recentActivity: user.last_sign_in_at || user.created_at || new Date().toISOString()
          }
        }
      })

      console.log('✅ Processed players:', processedPlayers)
      setPlayers(processedPlayers)

    } catch (error) {
      console.error('❌ Error fetching players:', error)
      setError(error.message)
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
          level: 50,
          favoriteGame: 'Dota 2',
          recentActivity: new Date().toISOString()
        }
      }
    ]

    setPlayers(samplePlayers)
    setFilteredPlayers(samplePlayers)
  }

  const calculatePlayerLevel = (user) => {
    // Simple level calculation based on account age and activity
    const accountAge = Date.now() - new Date(user.created_at).getTime()
    const daysOld = accountAge / (1000 * 60 * 60 * 24)
    const baseLevel = Math.min(Math.floor(daysOld / 10) + 1, 50)
    return baseLevel
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
        case 'level':
          return b.stats.level - a.stats.level
        case 'recent':
          return new Date(b.stats.recentActivity) - new Date(a.stats.recentActivity)
        case 'name':
          return a.username?.localeCompare(b.username)
        default:
          return 0
      }
    })

    console.log('🔍 Filtered players:', filtered.length)
    setFilteredPlayers(filtered)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Players...</p>
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
        

        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Elite Players
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Meet the champions, strategists, and rising stars of the RushX gaming community
          </p>
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
                <option value="level">Highest Level</option>
                <option value="recent">Recently Active</option>
                <option value="name">Alphabetical</option>
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
      // onViewProfile removed to disable link
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
                setFilters({ sortBy: 'level', game: 'all', role: 'all' })
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
    if (rank === 2) return <FaCrown className="w-3 h-3" />
    if (rank === 3) return <FaCrown className="w-3 h-3" />
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
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-400 mb-6">
          <div className="flex items-center space-x-1">
            <FaStar className="w-3 h-3" />
            <span>Level {player.stats.level}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaCrosshairs className="w-3 h-3" />
            <span>{player.stats.favoriteGame}</span>
          </div>
        </div>
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