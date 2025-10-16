import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import { 
  FaCalendarAlt, 
  FaClock, 
  FaUsers, 
  FaTrophy, 
  FaGamepad,
  FaFire,
  FaRegClock,
  FaPlayCircle,
  FaSearch,
  FaFilter,
  FaSortAmountDown
} from 'react-icons/fa'
import { GiTrophyCup, GiRank3 } from 'react-icons/gi'

const SchedulePage = () => {
  const router = useRouter()
  const [tournaments, setTournaments] = useState([])
  const [filteredTournaments, setFilteredTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    game: 'all',
    sortBy: 'start_date'
  })

  // Available games for filter
  const [availableGames, setAvailableGames] = useState([])

  useEffect(() => {
    fetchTournaments()
  }, [])

  useEffect(() => {
    filterAndSortTournaments()
  }, [tournaments, searchTerm, filters])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('schedule->start_date', { ascending: true })

      if (error) throw error

      setTournaments(data || [])
      
      // Extract unique games
      const games = [...new Set(data?.map(t => t.game_name).filter(Boolean))]
      setAvailableGames(games)

    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortTournaments = () => {
    let filtered = [...tournaments]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.game_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === filters.status)
    }

    // Game filter
    if (filters.game !== 'all') {
      filtered = filtered.filter(tournament => tournament.game_name === filters.game)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'start_date':
          return new Date(a.schedule?.start_date) - new Date(b.schedule?.start_date)
        case 'participants':
          return b.current_participants - a.current_participants
        case 'prize_pool':
          const prizeA = (a.prize_pool?.winner || 0) + (a.prize_pool?.runnerUp || 0)
          const prizeB = (b.prize_pool?.winner || 0) + (b.prize_pool?.runnerUp || 0)
          return prizeB - prizeA
        default:
          return 0
      }
    })

    setFilteredTournaments(filtered)
  }

  const getTournamentStatus = (tournament) => {
    const now = new Date()
    const startDate = new Date(tournament.schedule?.start_date)
    const regEndDate = new Date(tournament.schedule?.registration_end)

    if (now > startDate) return 'ongoing'
    if (now > regEndDate) return 'registration_closed'
    return 'upcoming'
  }

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-green-500',
      ongoing: 'bg-cyan-500',
      registration_closed: 'bg-red-500',
      completed: 'bg-gray-500'
    }
    return colors[status] || colors.upcoming
  }

  const getStatusText = (status) => {
    const texts = {
      upcoming: 'Upcoming',
      ongoing: 'Live Now',
      registration_closed: 'Registration Closed',
      completed: 'Completed'
    }
    return texts[status] || texts.upcoming
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Tournaments...</p>
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
              <FaCalendarAlt className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Tournament Schedule
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Never miss a tournament! Browse all upcoming events, check schedules, and join the competition.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaCalendarAlt className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredTournaments.filter(t => getTournamentStatus(t) === 'upcoming').length}
            </div>
            <div className="text-gray-400">Upcoming</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaPlayCircle className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredTournaments.filter(t => getTournamentStatus(t) === 'ongoing').length}
            </div>
            <div className="text-gray-400">Live Now</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FaUsers className="w-6 h-6 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredTournaments.reduce((sum, t) => sum + t.current_participants, 0)}
            </div>
            <div className="text-gray-400">Total Players</div>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6 text-center">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
              <GiTrophyCup className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              ₹{filteredTournaments.reduce((sum, t) => sum + (t.prize_pool?.winner || 0) + (t.prize_pool?.runnerUp || 0), 0).toLocaleString()}
            </div>
            <div className="text-gray-400">Total Prize</div>
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
                  placeholder="Search tournaments or games..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Live Now</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              >
                <option value="start_date">Sort by Date</option>
                <option value="participants">Sort by Participants</option>
                <option value="prize_pool">Sort by Prize Pool</option>
              </select>
            </div>
          </div>

          {/* Game Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setFilters(prev => ({ ...prev, game: 'all' }))}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                filters.game === 'all'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All Games
            </button>
            {availableGames.map((game) => (
              <button
                key={game}
                onClick={() => setFilters(prev => ({ ...prev, game }))}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  filters.game === game
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {game}
              </button>
            ))}
          </div>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => (
            <TournamentCard 
              key={tournament.id} 
              tournament={tournament} 
              onViewDetails={() => router.push(`/tournaments/${tournament.slug}`)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredTournaments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendarAlt className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Tournaments Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ status: 'all', game: 'all', sortBy: 'start_date' })
              }}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Tournament Card Component
const TournamentCard = ({ tournament, onViewDetails }) => {
  const status = getTournamentStatus(tournament)
  const schedule = tournament.schedule || {}
  const prizePool = tournament.prize_pool || {}

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-green-500',
      ongoing: 'bg-cyan-500',
      registration_closed: 'bg-red-500',
      completed: 'bg-gray-500'
    }
    return colors[status] || colors.upcoming
  }

  const getStatusText = (status) => {
    const texts = {
      upcoming: 'Upcoming',
      ongoing: 'Live Now',
      registration_closed: 'Registration Closed',
      completed: 'Completed'
    }
    return texts[status] || texts.upcoming
  }

  return (
    <div 
      className="group bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 transform hover:scale-[1.02] cursor-pointer"
      onClick={onViewDetails}
    >
      {/* Banner */}
      <div className="relative h-48 overflow-hidden">
        {tournament.banner_urls?.[0] ? (
          <img 
            src={tournament.banner_urls[0]} 
            alt={tournament.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-600/20 flex items-center justify-center">
            <FaGamepad className="w-16 h-16 text-white/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`${getStatusColor(status)} text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1`}>
            {status === 'ongoing' && <FaFire className="w-3 h-3" />}
            <span>{getStatusText(status)}</span>
          </span>
        </div>

        {/* Game Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-black/70 text-cyan-400 px-3 py-1 rounded-full text-sm font-semibold">
            {tournament.game_name}
          </span>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title and Description */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
          {tournament.title}
        </h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {tournament.description}
        </p>

        {/* Tournament Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-gray-300">
            <FaUsers className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">{tournament.current_participants}/{tournament.max_participants}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <FaTrophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">₹{(prizePool.winner + prizePool.runnerUp).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <FaClock className="w-4 h-4 text-purple-400" />
            <span className="text-sm">{tournament.match_type}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <GiRank3 className="w-4 h-4 text-green-400" />
            <span className="text-sm">₹{tournament.joining_fee}</span>
          </div>
        </div>

        {/* Countdown Timer */}
        {status === 'upcoming' && schedule.start_date && (
          <CountdownTimer targetDate={new Date(schedule.start_date)} />
        )}

        {/* Registration Deadline */}
        {status === 'upcoming' && schedule.registration_end && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-400 text-sm">
              <FaRegClock className="w-3 h-3" />
              <span>Register by: {new Date(schedule.registration_end).toLocaleDateString()}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button 
          onClick={onViewDetails}
          className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
        >
          {status === 'ongoing' ? 'Watch Live' : 'View Details'}
        </button>
      </div>
    </div>
  )
}

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  function calculateTimeLeft() {
    const difference = targetDate - new Date()
    let timeLeft = {}

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    return timeLeft
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearTimeout(timer)
  })

  if (Object.keys(timeLeft).length === 0) {
    return (
      <div className="text-center py-2">
        <span className="text-green-400 font-semibold">Starting Now!</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
      <div className="text-center text-cyan-400 text-sm font-semibold mb-2">Starts In</div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-2xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-gray-400 text-xs">Days</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-gray-400 text-xs">Hours</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-gray-400 text-xs">Minutes</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-gray-400 text-xs">Seconds</div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get tournament status
function getTournamentStatus(tournament) {
  const now = new Date()
  const startDate = new Date(tournament.schedule?.start_date)
  const regEndDate = new Date(tournament.schedule?.registration_end)

  if (tournament.status === 'completed') return 'completed'
  if (now > startDate) return 'ongoing'
  if (now > regEndDate) return 'registration_closed'
  return 'upcoming'
}

export default SchedulePage