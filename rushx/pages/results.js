import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
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
  FaExternalLinkAlt
} from 'react-icons/fa'
import { GiLaurels, GiPodium, GiTrophyCup } from 'react-icons/gi'

const ResultsPage = () => {
  const router = useRouter()
  const [results, setResults] = useState([])
  const [filteredResults, setFilteredResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    game: 'all',
    status: 'completed'
  })

  useEffect(() => {
    fetchResults()
  }, [])

  useEffect(() => {
    filterResults()
  }, [results, searchTerm, filters])

  const fetchResults = async () => {
    try {
      setLoading(true)
      
      // Fetch tournament results with related data
      const { data: resultsData, error } = await supabase
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
            max_participants
          ),
          winner:winner_id(id, username, avatar_url, gamer_tag),
          runner_up:runner_up_id(id, username, avatar_url, gamer_tag),
          third_place:third_place_id(id, username, avatar_url, gamer_tag)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      console.log('Fetched results:', resultsData)
      setResults(resultsData || [])
      
      // Load sample data if no real data exists
      if (!resultsData || resultsData.length === 0) {
        loadSampleResults()
      }

    } catch (error) {
      console.error('Error fetching results:', error)
      loadSampleResults()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleResults = () => {
    const sampleResults = [
      {
        id: '1',
        tournament_id: '1',
        winner_id: '1',
        runner_up_id: '2',
        third_place_id: '3',
        fourth_place_id: '4',
        fifth_place_id: '5',
        final_score: '3-1',
        completed_at: new Date(Date.now() - 86400000).toISOString(),
        total_participants: 32,
        prize_distribution: {
          winner: 50000,
          runner_up: 25000,
          third_place: 15000,
          fourth_place: 7500,
          fifth_place: 2500
        },
        tournament: {
          id: '1',
          title: 'Valorant Champions Cup 2024',
          game_name: 'Valorant',
          game_image: null,
          start_date: new Date(Date.now() - 604800000).toISOString(),
          end_date: new Date(Date.now() - 86400000).toISOString(),
          total_prize_pool: 100000,
          max_participants: 32
        },
        winner: {
          id: '1',
          username: 'ProPlayer1',
          avatar_url: null,
          gamer_tag: 'PRO1'
        },
        runner_up: {
          id: '2',
          username: 'EliteGamer',
          avatar_url: null,
          gamer_tag: 'ELITE'
        },
        third_place: {
          id: '3',
          username: 'StrategyMaster',
          avatar_url: null,
          gamer_tag: 'STRAT'
        }
      },
      {
        id: '2',
        tournament_id: '2',
        winner_id: '4',
        runner_up_id: '5',
        third_place_id: '6',
        fourth_place_id: '7',
        fifth_place_id: '8',
        final_score: '2-0',
        completed_at: new Date(Date.now() - 172800000).toISOString(),
        total_participants: 16,
        prize_distribution: {
          winner: 25000,
          runner_up: 12000,
          third_place: 8000,
          fourth_place: 4000,
          fifth_place: 1000
        },
        tournament: {
          id: '2',
          title: 'CS:GO Elite Tournament',
          game_name: 'CS:GO',
          game_image: null,
          start_date: new Date(Date.now() - 1209600000).toISOString(),
          end_date: new Date(Date.now() - 172800000).toISOString(),
          total_prize_pool: 50000,
          max_participants: 16
        },
        winner: {
          id: '4',
          username: 'ApexPredator',
          avatar_url: null,
          gamer_tag: 'APEX'
        },
        runner_up: {
          id: '5',
          username: 'DotaChampion',
          avatar_url: null,
          gamer_tag: 'DOTA'
        },
        third_place: {
          id: '6',
          username: 'RookieRiser',
          avatar_url: null,
          gamer_tag: 'ROOKIE'
        }
      }
    ]

    setResults(sampleResults)
    setFilteredResults(sampleResults)
  }

  const filterResults = () => {
    let filtered = [...results]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.tournament?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.tournament?.game_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.winner?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Game filter
    if (filters.game !== 'all') {
      filtered = filtered.filter(result => 
        result.tournament?.game_name?.toLowerCase() === filters.game.toLowerCase()
      )
    }

    setFilteredResults(filtered)
  }

  const getGameIcon = (gameName) => {
    const gameIcons = {
      valorant: '🎯',
      'cs:go': '🔫',
      'league of legends': '⚔️',
      'dota 2': '🗡️',
      fortnite: '🏹',
      'apex legends': '🔫'
    }
    return gameIcons[gameName.toLowerCase()] || '🎮'
  }

  const getStatusBadge = (result) => {
    return (
      <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
        <FaCheckCircle className="w-3 h-3" />
        <span>Completed</span>
      </div>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Tournament Results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20">
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
              <GiTrophyCup className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tournament Results
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Celebrating champions and their epic victories across all tournaments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GiTrophyCup className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{results.length}</div>
            <div className="text-gray-400">Tournaments Completed</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaRupeeSign className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {formatCurrency(results.reduce((sum, result) => sum + result.tournament.total_prize_pool, 0)).replace('₹', '₹ ')}
            </div>
            <div className="text-gray-400">Total Prize Pool</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaUsers className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {results.reduce((sum, result) => sum + result.total_participants, 0)}
            </div>
            <div className="text-gray-400">Total Participants</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaCrown className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {new Set(results.map(result => result.winner_id)).size}
            </div>
            <div className="text-gray-400">Unique Champions</div>
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
                  placeholder="Search tournaments, games, or champions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Game Filter */}
            <div>
              <select
                value={filters.game}
                onChange={(e) => setFilters(prev => ({ ...prev, game: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
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

            {/* Results Count */}
            <div className="flex items-center justify-end">
              <span className="text-cyan-400 font-semibold">
                {filteredResults.length} {filteredResults.length === 1 ? 'Result' : 'Results'}
              </span>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-6">
          {filteredResults.map((result) => (
            <TournamentResultCard 
              key={result.id} 
              result={result} 
              onSelect={() => setSelectedTournament(result)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredResults.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <GiTrophyCup className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Results Found</h3>
            <p className="text-gray-400 mb-6">No tournament results match your search criteria</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ game: 'all', status: 'completed' })
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* Tournament Result Modal */}
      {selectedTournament && (
        <TournamentResultModal 
          result={selectedTournament}
          onClose={() => setSelectedTournament(null)}
        />
      )}
    </div>
  )
}

// Tournament Result Card Component
const TournamentResultCard = ({ result, onSelect }) => {
  return (
    <div 
      className="group bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 cursor-pointer"
      onClick={onSelect}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg">
              {getGameIcon(result.tournament.game_name)}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                {result.tournament.title}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                <div className="flex items-center space-x-1">
                  <FaCalendar className="w-3 h-3" />
                  <span>{formatDate(result.completed_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaUsers className="w-3 h-3" />
                  <span>{result.total_participants} Participants</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(result)}
            <FaExternalLinkAlt className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Podium Preview */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Runner Up */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-gray-400">
              <FaMedal className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">2nd</div>
            <div className="text-xs text-gray-400 truncate">{result.runner_up?.username || 'TBD'}</div>
            <div className="text-xs text-cyan-400 mt-1">
              {formatCurrency(result.prize_distribution.runner_up).replace('₹', '₹ ')}
            </div>
          </div>

          {/* Winner */}
          <div className="text-center transform -translate-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-yellow-400 shadow-lg shadow-yellow-500/25">
              <FaCrown className="w-8 h-8 text-white" />
            </div>
            <div className="text-sm font-semibold text-yellow-300">1st</div>
            <div className="text-xs text-white font-bold truncate">{result.winner?.username || 'TBD'}</div>
            <div className="text-xs text-yellow-400 mt-1 font-semibold">
              {formatCurrency(result.prize_distribution.winner).replace('₹', '₹ ')}
            </div>
          </div>

          {/* Third Place */}
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 border-2 border-orange-400">
              <FaAward className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-semibold text-gray-300">3rd</div>
            <div className="text-xs text-gray-400 truncate">{result.third_place?.username || 'TBD'}</div>
            <div className="text-xs text-cyan-400 mt-1">
              {formatCurrency(result.prize_distribution.third_place).replace('₹', '₹ ')}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
          <div className="flex items-center space-x-2 text-cyan-400">
            <FaRupeeSign className="w-4 h-4" />
            <span className="font-semibold">
              {formatCurrency(result.tournament.total_prize_pool).replace('₹', '₹ ')} Prize Pool
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            Final Score: <span className="text-white font-semibold">{result.final_score}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tournament Result Modal Component
const TournamentResultModal = ({ result, onClose }) => {
  const podiumPlayers = [
    { position: 1, player: result.winner, prize: result.prize_distribution.winner, icon: FaCrown, color: 'yellow' },
    { position: 2, player: result.runner_up, prize: result.prize_distribution.runner_up, icon: FaMedal, color: 'gray' },
    { position: 3, player: result.third_place, prize: result.prize_distribution.third_place, icon: FaAward, color: 'orange' }
  ]

  const getColorClasses = (color) => {
    const colors = {
      yellow: 'from-yellow-400 to-yellow-600 border-yellow-400 text-yellow-100',
      gray: 'from-gray-400 to-gray-600 border-gray-400 text-gray-100',
      orange: 'from-orange-400 to-orange-600 border-orange-400 text-orange-100'
    }
    return colors[color] || colors.yellow
  }

  const getOrdinalSuffix = (number) => {
    if (number === 1) return 'st'
    if (number === 2) return 'nd'
    if (number === 3) return 'rd'
    return 'th'
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                {getGameIcon(result.tournament.game_name)}
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{result.tournament.title}</h2>
                <div className="flex items-center space-x-4 text-gray-400 mt-2">
                  <div className="flex items-center space-x-2">
                    <FaCalendar className="w-4 h-4" />
                    <span>Completed {formatDate(result.completed_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FaUsers className="w-4 h-4" />
                    <span>{result.total_participants} Participants</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-gray-800/50 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-300"
            >
              ×
            </button>
          </div>

          {/* Final Score */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl p-6 border border-cyan-500/20">
            <div className="text-center">
              <div className="text-sm text-cyan-400 font-semibold mb-2">CHAMPIONSHIP MATCH</div>
              <div className="text-4xl font-bold text-white">{result.final_score}</div>
              <div className="text-gray-400 mt-2">Final Score</div>
            </div>
          </div>
        </div>

        {/* Podium Section */}
        <div className="p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <GiPodium className="w-6 h-6 text-cyan-400" />
            <span>Tournament Podium</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {podiumPlayers.map(({ position, player, prize, icon: Icon, color }) => (
              <div key={position} className={`text-center transform ${position === 1 ? '-translate-y-4' : ''}`}>
                <div className={`w-24 h-24 bg-gradient-to-br ${getColorClasses(color)} rounded-full flex items-center justify-center mx-auto mb-4 border-4 shadow-2xl ${position === 1 ? 'shadow-yellow-500/25' : ''}`}>
                  <Icon className="w-10 h-10" />
                </div>
                <div className={`text-lg font-semibold mb-2 ${position === 1 ? 'text-yellow-300' : 'text-gray-300'}`}>
                  {position === 1 ? 'CHAMPION' : `${position}${getOrdinalSuffix(position)}`} PLACE
                </div>
                <div className="text-xl font-bold text-white mb-2">{player?.username || 'TBD'}</div>
                <div className="text-sm text-gray-400 mb-2">{player?.gamer_tag || ''}</div>
                <div className={`text-lg font-bold ${position === 1 ? 'text-yellow-400' : 'text-cyan-400'}`}>
                  {formatCurrency(prize).replace('₹', '₹ ')}
                </div>
              </div>
            ))}
          </div>

          {/* Prize Distribution */}
          <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50">
            <h4 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <FaRupeeSign className="w-5 h-5 text-cyan-400" />
              <span>Prize Distribution</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(result.prize_distribution).map(([position, prize]) => (
                <div key={position} className="text-center">
                  <div className="text-sm text-gray-400 capitalize">
                    {position.replace('_', ' ')}
                  </div>
                  <div className="text-lg font-bold text-cyan-400">
                    {formatCurrency(prize).replace('₹', '₹ ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Total Prize Pool */}
        <div className="p-8 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {formatCurrency(result.tournament.total_prize_pool).replace('₹', '₹ ')}
            </div>
            <div className="text-cyan-400 font-semibold">Total Prize Pool</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
const getGameIcon = (gameName) => {
  const gameIcons = {
    valorant: '🎯',
    'cs:go': '🔫',
    'league of legends': '⚔️',
    'dota 2': '🗡️',
    fortnite: '🏹',
    'apex legends': '🔫'
  }
  return gameIcons[gameName.toLowerCase()] || '🎮'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

const getStatusBadge = (result) => {
  return (
    <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
      <FaCheckCircle className="w-3 h-3" />
      <span>Completed</span>
    </div>
  )
}

export default ResultsPage