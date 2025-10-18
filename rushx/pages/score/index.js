import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
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
  FaChevronRight,
  FaCheckCircle,
  FaPlayCircle,
  FaSearch,
  FaFilter,
  FaEye,
  FaExternalLinkAlt,
  FaGamepad,
  FaCalendar,
  FaClock
} from 'react-icons/fa'
import { GiPodium, GiTrophyCup } from 'react-icons/gi'

const LiveScoresPage = () => {
  const router = useRouter()
  const [topScores, setTopScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMatchType, setSelectedMatchType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTopScores()
    const interval = setInterval(fetchTopScores, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [selectedMatchType, searchTerm])

  const fetchTopScores = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('tournament_scores')
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
            status
          )
        `)
        .order('points', { ascending: false })
        .limit(8)

      if (selectedMatchType !== 'all') {
        query = query.eq('match_type', selectedMatchType)
      }

      const { data: scoresData, error } = await query

      if (error) throw error

      console.log('Fetched top scores:', scoresData)
      
      let filteredScores = scoresData || []
      
      // Apply search filter
      if (searchTerm) {
        filteredScores = filteredScores.filter(score =>
          (score.match_type === 'solo' && score.player_username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (score.match_type !== 'solo' && score.team_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          score.tournament?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          score.tournament?.game_name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      setTopScores(filteredScores)
      
      if (!scoresData || scoresData.length === 0) {
        loadSampleScores()
      }

    } catch (error) {
      console.error('Error fetching scores:', error)
      loadSampleScores()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleScores = () => {
    const sampleScores = [
      {
        id: '1',
        tournament_id: '1',
        tournament: {
          id: '1',
          title: 'Valorant Champions Cup 2024',
          game_name: 'Valorant',
          total_prize_pool: 200000,
          status: 'live'
        },
        match_type: 'solo',
        status: 'live',
        player_id: '1',
        player_username: 'ProPlayer1',
        player_avatar_url: null,
        kills: 42,
        rank: 1,
        points: 2850,
        prize_won: 0,
        matches_played: 8,
      },
      {
        id: '2',
        tournament_id: '1',
        tournament: {
          id: '1',
          title: 'Valorant Champions Cup 2024',
          game_name: 'Valorant',
          total_prize_pool: 200000,
          status: 'live'
        },
        match_type: 'solo',
        status: 'live',
        player_id: '2',
        player_username: 'EliteGamer',
        player_avatar_url: null,
        kills: 38,
        rank: 2,
        points: 2650,
        prize_won: 0,
        matches_played: 8,
      },
      {
        id: '3',
        tournament_id: '2',
        tournament: {
          id: '2',
          title: 'CS:GO Elite Tournament',
          game_name: 'CS:GO',
          total_prize_pool: 150000,
          status: 'live'
        },
        match_type: 'squad',
        status: 'live',
        team_name: 'Alpha Warriors',
        team_logo_url: null,
        team_members: [
          { player_id: '3', username: 'StrategyMaster', kills: 15 },
          { player_id: '4', username: 'ApexPredator', kills: 12 },
          { player_id: '5', username: 'DotaChampion', kills: 10 },
          { player_id: '6', username: 'RookieRiser', kills: 8 }
        ],
        kills: 45,
        rank: 1,
        points: 3200,
        prize_won: 0,
        matches_played: 6,
      },
      {
        id: '4',
        tournament_id: '1',
        tournament: {
          id: '1',
          title: 'Valorant Champions Cup 2024',
          game_name: 'Valorant',
          total_prize_pool: 200000,
          status: 'live'
        },
        match_type: 'solo',
        status: 'live',
        player_id: '7',
        player_username: 'HeadshotKing',
        player_avatar_url: null,
        kills: 35,
        rank: 3,
        points: 2450,
        prize_won: 0,
        matches_played: 8,
      },
      {
        id: '5',
        tournament_id: '3',
        tournament: {
          id: '3',
          title: 'Fortnite Battle Royale',
          game_name: 'Fortnite',
          total_prize_pool: 120000,
          status: 'live'
        },
        match_type: 'duo',
        status: 'live',
        team_name: 'Dynamic Duo',
        team_logo_url: null,
        team_members: [
          { player_id: '8', username: 'BuildMaster', kills: 18 },
          { player_id: '9', username: 'SniperPro', kills: 16 }
        ],
        kills: 34,
        rank: 1,
        points: 2950,
        prize_won: 0,
        matches_played: 5,
      },
      {
        id: '6',
        tournament_id: '4',
        tournament: {
          id: '4',
          title: 'Apex Legends Showdown',
          game_name: 'Apex Legends',
          total_prize_pool: 180000,
          status: 'completed'
        },
        match_type: 'squad',
        status: 'completed',
        team_name: 'Beta Titans',
        team_logo_url: null,
        team_members: [
          { player_id: '10', username: 'ThunderStorm', kills: 14 },
          { player_id: '11', username: 'IceCold', kills: 11 },
          { player_id: '12', username: 'FireBlaze', kills: 9 }
        ],
        kills: 41,
        rank: 1,
        points: 3100,
        prize_won: 90000,
        matches_played: 6,
      }
    ]

    setTopScores(sampleScores)
  }

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
      solo: 'from-cyan-500 to-cyan-600',
      duo: 'from-purple-500 to-purple-600',
      squad: 'from-orange-500 to-orange-600'
    }
    return colors[matchType] || 'from-gray-500 to-gray-600'
  }

  const getMatchTypeTextColor = (matchType) => {
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
      <div className={`w-12 h-12 bg-gradient-to-br ${badge.color} rounded-2xl flex items-center justify-center shadow-lg mobile:w-10 mobile:h-10 mobile:rounded-xl`}>
        <Icon className="w-6 h-6 text-white mobile:w-5 mobile:h-5" />
      </div>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'live') {
      return (
        <div className="flex items-center space-x-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full text-sm font-semibold mobile:px-2 mobile:py-1 mobile:text-xs">
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span>LIVE</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full text-sm font-semibold mobile:px-2 mobile:py-1 mobile:text-xs">
        <FaCheckCircle className="w-3 h-3 mobile:w-2 mobile:h-2" />
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

  const getGameIcon = (gameName) => {
    const gameIcons = {
      valorant: '🎯',
      'cs:go': '🔫',
      'league of legends': '⚔️',
      'dota 2': '🗡️',
      fortnite: '🏹',
      'apex legends': '🔫',
      'call of duty': '🎖️',
      overwatch: '🛡️'
    }
    return gameIcons[gameName.toLowerCase()] || '🎮'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4 mobile:w-12 mobile:h-12"></div>
          <p className="text-cyan-400 font-semibold mobile:text-sm">Loading Live Scores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl mobile:-top-20 mobile:-right-20 mobile:w-40 mobile:h-40"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl mobile:-bottom-20 mobile:-left-20 mobile:w-40 mobile:h-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl mobile:w-48 mobile:h-48"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl mobile:w-16 mobile:h-16"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 mobile:px-3 mobile:py-6">
        {/* Premium Header Section */}
        <div className="text-center mb-12 mobile:mb-8">
          <div className="flex items-center justify-center space-x-4 mb-6 mobile:space-x-3 mobile:mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/25 mobile:w-12 mobile:h-12 mobile:rounded-2xl">
              <GiTrophyCup className="w-8 h-8 text-white mobile:w-6 mobile:h-6" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mobile:text-3xl">
              Live Scores
            </h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mobile:text-base mobile:px-2">
            Real-time tournament standings, champion rankings, and live performance metrics
          </p>
        </div>

        {/* Premium Stats Overview */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-12">
  {/* 1️⃣ Top Entries */}
  <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-cyan-500/30 p-3 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-cyan-500/20 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
      <GiTrophyCup className="w-4 h-4 sm:w-7 sm:h-7 text-cyan-400" />
    </div>
    <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">
      {topScores.length}
    </div>
    <div className="text-gray-400 text-xs sm:text-base font-medium">Top Entries</div>
  </div>

  {/* 2️⃣ Total Prize Pool */}
  <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-500/30 p-3 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-purple-500/20 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
      <FaRupeeSign className="w-3.5 h-3.5 sm:w-6 sm:h-6 text-purple-400" />
    </div>
    <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">
      {formatCurrency(
        topScores.reduce(
          (sum, score) => sum + score.tournament.total_prize_pool,
          0
        )
      ).replace('₹', '₹')}
    </div>
    <div className="text-gray-400 text-xs sm:text-base font-medium">Total Prize Pool</div>
  </div>

  {/* 3️⃣ Active Tournaments */}
  <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-green-500/30 p-3 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-green-500/20 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
      <FaUsers className="w-4 h-4 sm:w-7 sm:h-7 text-green-400" />
    </div>
    <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">
      {new Set(topScores.map(score => score.tournament_id)).size}
    </div>
    <div className="text-gray-400 text-xs sm:text-base font-medium">Active Tournaments</div>
  </div>

  {/* 4️⃣ Live Matches */}
  <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-red-500/30 p-3 sm:p-6 text-center transform hover:scale-105 transition-all duration-300">
    <div className="w-8 h-8 sm:w-14 sm:h-14 bg-red-500/20 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-2 sm:mb-4">
      <FaFire className="w-4 h-4 sm:w-7 sm:h-7 text-red-400" />
    </div>
    <div className="text-base sm:text-3xl font-bold text-white mb-1 sm:mb-2">
      {topScores.filter(score => score.status === 'live').length}
    </div>
    <div className="text-gray-400 text-xs sm:text-base font-medium">Live Matches</div>
  </div>
</div>


        {/* Premium Search and Filters */}
<div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-cyan-500/30 p-4 sm:p-8 mb-6 sm:mb-8">
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
    
    {/* 🔍 Search Bar */}
    <div className="lg:col-span-2">
      <div className="relative">
        <FaSearch className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          type="text"
          placeholder="Search tournaments, players, teams, or games..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-2.5 sm:py-4 bg-gray-800/70 border border-cyan-500/30 rounded-xl sm:rounded-2xl text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-gray-800/90 transition-all duration-300"
        />
      </div>
    </div>

    {/* ⚙️ Match Type Filter */}
    <div>
      <select
        value={selectedMatchType}
        onChange={(e) => setSelectedMatchType(e.target.value)}
        className="w-full px-3 sm:px-5 py-2.5 sm:py-4 bg-gray-800/70 border border-cyan-500/30 rounded-xl sm:rounded-2xl text-sm sm:text-base text-white focus:outline-none focus:border-cyan-500 transition-all duration-300"
      >
        <option value="all">All Match Types</option>
        <option value="solo">Solo</option>
        <option value="duo">Duo</option>
        <option value="squad">Squad</option>
      </select>
    </div>

    {/* 📊 Results Count */}
    <div className="flex items-center justify-end">
      <div className="text-cyan-400 font-bold text-sm sm:text-lg">
        {topScores.length} {topScores.length === 1 ? 'Result' : 'Results'}
      </div>
    </div>

  </div>
</div>
{/* Premium Top Scores Grid */}
<div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-12">
  {topScores.map((score, index) => (
    <div
      key={score.id}
      className="group bg-gray-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 cursor-pointer"
      onClick={() => router.push(`/score/${score.tournament_id}`)}
    >
      <div className="p-4 sm:p-8">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {getRankBadge(score.rank)}
            <div>
              <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                <h3 className="text-lg sm:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                  {score.match_type === 'solo' ? score.player_username : score.team_name}
                </h3>
                {getStatusBadge(score.status)}
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 text-gray-400 text-xs sm:text-sm">
                <div className={`flex items-center space-x-1 sm:space-x-2 ${getMatchTypeTextColor(score.match_type)} font-semibold`}>
                  {getMatchTypeIcon(score.match_type)}
                  <span>{score.match_type.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2 text-red-400">
                  <FaSkull className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>{score.kills} Kills</span>
                </div>
              </div>
            </div>
          </div>
          <FaExternalLinkAlt className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{score.points}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">
              {formatCurrency(score.prize_won || 0).replace('₹', '₹')}
            </div>
            <div className="text-gray-400 text-xs sm:text-sm">Prize Won</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{score.matches_played}</div>
            <div className="text-gray-400 text-xs sm:text-sm">Matches</div>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-700/50">
          <div className="flex items-center justify-between sm:flex-row flex-col sm:gap-0 gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-lg sm:rounded-xl flex items-center justify-center text-sm sm:text-lg">
                {getGameIcon(score.tournament.game_name)}
              </div>
              <div>
                <div className="text-white font-semibold text-xs sm:text-sm">{score.tournament.title}</div>
                <div className="text-gray-400 text-xs sm:text-sm">{score.tournament.game_name}</div>
              </div>
            </div>
            <div className="text-right sm:text-right text-xs sm:text-sm">
              <div className="text-green-400 font-bold text-xs sm:text-sm">
                {formatCurrency(score.tournament.total_prize_pool).replace('₹', '₹')}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Prize Pool</div>
            </div>
          </div>
        </div>

        {/* Team Members Preview */}
        {score.match_type !== 'solo' && score.team_members && (
          <div className="mt-2 sm:mt-4">
            <div className="text-gray-400 text-xs font-semibold mb-1 sm:mb-2">
              Team Members ({score.team_members.length})
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {score.team_members.slice(0, 3).map((member, idx) => (
                <div key={idx} className="flex items-center space-x-1 sm:space-x-2 bg-gray-800/50 px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg border border-gray-700/50">
                  <FaUser className="w-2 h-2 sm:w-3 sm:h-3 text-gray-400" />
                  <span className="text-white text-xs sm:text-sm">{member.username}</span>
                  <span className="text-red-400 text-xs font-bold sm:text-sm">({member.kills})</span>
                </div>
              ))}
              {score.team_members.length > 3 && (
                <div className="flex items-center space-x-1 sm:space-x-2 bg-cyan-500/10 px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg border border-cyan-500/20">
                  <span className="text-cyan-400 text-xs sm:text-sm">
                    +{score.team_members.length - 3} more
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  ))}
</div>


        {/* Premium Empty State */}
        {topScores.length === 0 && (
          <div className="text-center py-16 mobile:py-12">
            <div className="w-32 h-32 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-6 mobile:w-24 mobile:h-24 mobile:mb-4">
              <GiPodium className="w-16 h-16 text-gray-400 mobile:w-12 mobile:h-12" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3 mobile:text-xl">No Scores Found</h3>
            <p className="text-gray-400 mb-8 text-lg mobile:text-sm mobile:mb-6">
              {searchTerm ? 'No results match your search criteria' : 'No live scores available at the moment'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedMatchType('all')
              }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 mobile:px-6 mobile:py-3 mobile:text-sm mobile:rounded-xl"
            >
              {searchTerm ? 'Clear Search' : 'Refresh Scores'}
            </button>
          </div>
        )}

        {/* Premium View All Button */}
{topScores.length > 0 && (
  <div className="text-center">
    <button
      onClick={() => router.push('/score/all')}
      className="group px-8 sm:px-12 py-3.5 sm:py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl sm:rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
    >
      <div className="flex items-center justify-center space-x-2 sm:space-x-3">
        <FaEye className="w-5 h-5 sm:w-6 sm:h-6" />
        <span className="text-sm sm:text-base">View All Tournament Scores</span>
        <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </button>
  </div>
)}

      </div>
    </div>
  )
}

export default LiveScoresPage