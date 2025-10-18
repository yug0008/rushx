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
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
  FaSearch,
  FaFilter,
  FaArrowLeft
} from 'react-icons/fa'
import { GiPodium } from 'react-icons/gi'

const TournamentScoresPage = () => {
  const router = useRouter()
  const { tournament } = router.query
  const [scores, setScores] = useState([])
  const [tournamentData, setTournamentData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    match_type: 'all',
    status: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedTeam, setExpandedTeam] = useState(null)

  useEffect(() => {
    if (tournament) {
      fetchTournamentScores()
    }
  }, [tournament, filters, searchTerm])

  const fetchTournamentScores = async () => {
    try {
      setLoading(true)
      
      // Fetch tournament data
      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournament)
        .single()

      if (tournamentError) throw tournamentError

      setTournamentData(tournamentData)

      // Fetch scores
      let query = supabase
        .from('tournament_scores')
        .select('*')
        .eq('tournament_id', tournament)
        .order('points', { ascending: false })

      if (filters.match_type !== 'all') {
        query = query.eq('match_type', filters.match_type)
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      const { data: scoresData, error: scoresError } = await query

      if (scoresError) throw scoresError

      console.log('Fetched tournament scores:', scoresData)
      
      let filteredScores = scoresData || []
      
      // Apply search filter
      if (searchTerm) {
        filteredScores = filteredScores.filter(score =>
          (score.match_type === 'solo' && score.player_username?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (score.match_type !== 'solo' && score.team_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (score.team_members && score.team_members.some(member => 
            member.username.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        )
      }

      setScores(filteredScores)
      
      if (!scoresData || scoresData.length === 0) {
        loadSampleScores()
      }

    } catch (error) {
      console.error('Error fetching tournament scores:', error)
      loadSampleScores()
    } finally {
      setLoading(false)
    }
  }

  const loadSampleScores = () => {
    const sampleScores = [
      {
        id: '1',
        tournament_id: tournament,
        match_type: 'solo',
        status: 'live',
        player_id: '1',
        player_username: 'ProPlayer1',
        player_avatar_url: null,
        kills: 42,
        rank: 1,
        points: 2850,
        prize_won: 50000,
        matches_played: 8,
      },
      {
        id: '2',
        tournament_id: tournament,
        match_type: 'solo',
        status: 'live',
        player_id: '2',
        player_username: 'EliteGamer',
        player_avatar_url: null,
        kills: 38,
        rank: 2,
        points: 2650,
        prize_won: 25000,
        matches_played: 8,
      },
      {
        id: '3',
        tournament_id: tournament,
        match_type: 'solo',
        status: 'live',
        player_id: '3',
        player_username: 'HeadshotKing',
        player_avatar_url: null,
        kills: 35,
        rank: 3,
        points: 2450,
        prize_won: 15000,
        matches_played: 8,
      },
      {
        id: '4',
        tournament_id: tournament,
        match_type: 'duo',
        status: 'live',
        team_name: 'Dynamic Duo',
        team_logo_url: null,
        team_members: [
          { player_id: '4', username: 'BuildMaster', kills: 18 },
          { player_id: '5', username: 'SniperPro', kills: 16 }
        ],
        kills: 34,
        rank: 1,
        points: 2950,
        prize_won: 40000,
        matches_played: 5,
      },
      {
        id: '5',
        tournament_id: tournament,
        match_type: 'squad',
        status: 'live',
        team_name: 'Alpha Warriors',
        team_logo_url: null,
        team_members: [
          { player_id: '6', username: 'StrategyMaster', kills: 15 },
          { player_id: '7', username: 'ApexPredator', kills: 12 },
          { player_id: '8', username: 'DotaChampion', kills: 10 },
          { player_id: '9', username: 'RookieRiser', kills: 8 }
        ],
        kills: 45,
        rank: 1,
        points: 3200,
        prize_won: 60000,
        matches_played: 6,
      },
      {
        id: '6',
        tournament_id: tournament,
        match_type: 'squad',
        status: 'live',
        team_name: 'Beta Titans',
        team_logo_url: null,
        team_members: [
          { player_id: '10', username: 'ThunderStorm', kills: 14 },
          { player_id: '11', username: 'IceCold', kills: 11 },
          { player_id: '12', username: 'FireBlaze', kills: 9 },
          { player_id: '13', username: 'WindWalker', kills: 7 }
        ],
        kills: 41,
        rank: 2,
        points: 3100,
        prize_won: 30000,
        matches_played: 6,
      }
    ]

    setScores(sampleScores)
    setTournamentData({
      id: tournament,
      title: 'Valorant Champions Cup 2024',
      game_name: 'Valorant',
      total_prize_pool: 200000,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString()
    })
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
      <div className={`w-10 h-10 bg-gradient-to-br ${badge.color} rounded-xl flex items-center justify-center mobile:w-8 mobile:h-8 mobile:rounded-lg`}>
        <Icon className="w-5 h-5 text-white mobile:w-4 mobile:h-4" />
      </div>
    )
  }

  const getStatusBadge = (status) => {
    if (status === 'live') {
      return (
        <div className="flex items-center space-x-1 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-semibold mobile:px-2 mobile:py-0.5 mobile:text-xs">
          <FaFire className="w-3 h-3 mobile:w-2 mobile:h-2" />
          <span>LIVE</span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold mobile:px-2 mobile:py-0.5 mobile:text-xs">
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

  const toggleTeamExpand = (teamId) => {
    setExpandedTeam(expandedTeam === teamId ? null : teamId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4 mobile:w-12 mobile:h-12"></div>
          <p className="text-cyan-400 font-semibold mobile:text-sm">Loading Tournament Scores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-cyan-900/20 pt-20">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl mobile:-top-20 mobile:-right-20 mobile:w-40 mobile:h-40"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl mobile:-bottom-20 mobile:-left-20 mobile:w-40 mobile:h-40"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 rounded-full blur-3xl mobile:w-48 mobile:h-48"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 mobile:px-3 mobile:py-4">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between mb-6 mobile:mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-all duration-300 mobile:space-x-1 mobile:px-3 mobile:py-2 mobile:bg-cyan-500/10 mobile:rounded-lg"
          >
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />

           <span className="font-semibold text-sm sm:text-base">Back</span>

          </button>
          
          <div className="text-center flex-1 mx-6 mobile:mx-2">
            <h1 className="text-sm sm:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">
  {tournamentData?.title || 'Tournament Scores'}
</h1>


            <div className="flex items-center justify-center space-x-6 text-gray-400 mobile:space-x-3 mobile:text-xs">
              <div className="flex items-center space-x-2 mobile:space-x-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full mobile:w-1.5 mobile:h-1.5"></div>
                <span className="mobile:text-xs">{tournamentData?.game_name}</span>
              </div>
              <div className="flex items-center space-x-2 mobile:space-x-1">
                <FaRupeeSign className="w-4 h-4 text-green-400 mobile:w-3 mobile:h-3" />
                <span className="mobile:text-xs">{formatCurrency(tournamentData?.total_prize_pool || 0).replace('₹', '₹')}</span>
              </div>
            </div>
          </div>

          <div className="w-20 mobile:w-12"></div>
        </div>

        {/* Enhanced Filters and Search */}
        <div className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6 mobile:p-4 mobile:rounded-xl mobile:mb-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mobile:gap-3">
            <div className="lg:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4 mobile:left-3 mobile:w-3 mobile:h-3" />
                <input
                  type="text"
                  placeholder="Search players, teams, or members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/70 border border-cyan-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:bg-gray-800/90 transition-all duration-300 mobile:pl-10 mobile:py-2.5 mobile:text-sm mobile:rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mobile:gap-3">
              <select
                value={filters.match_type}
                onChange={(e) => setFilters(prev => ({ ...prev, match_type: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/70 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all duration-300 mobile:py-2.5 mobile:text-sm mobile:rounded-lg mobile:px-3"
              >
                <option value="all">All Modes</option>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/70 border border-cyan-500/30 rounded-xl text-white focus:outline-none focus:border-cyan-500 transition-all duration-300 mobile:py-2.5 mobile:text-sm mobile:rounded-lg mobile:px-3"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Premium Mobile-Friendly Scores Grid */}
<div className="space-y-3 sm:space-y-3">
  {scores.map((score) => (
    <div
      key={score.id}
      className="bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 sm:rounded-2xl rounded-lg"
    >
      {/* Main Score Card */}
      <div className="p-4 sm:p-4 p-2">
        <div className="flex items-center justify-between sm:flex-row flex-col sm:items-center items-start gap-1">
          {/* Left Section */}
          <div className="flex items-center space-x-4 sm:space-x-4 space-x-1 w-full">
            {getRankBadge(score.rank)}

            <div className="flex items-center sm:space-x-3 space-x-1 flex-1 min-w-0">
              <div
                className={`w-12 h-12 sm:w-12 sm:h-12 w-7 h-7 bg-gradient-to-br ${
                  score.match_type === 'solo'
                    ? 'from-cyan-500/20 to-cyan-600/20'
                    : score.match_type === 'duo'
                    ? 'from-purple-500/20 to-purple-600/20'
                    : 'from-orange-500/20 to-orange-600/20'
                } rounded-xl sm:rounded-xl rounded-md border ${
                  score.match_type === 'solo'
                    ? 'border-cyan-500/30'
                    : score.match_type === 'duo'
                    ? 'border-purple-500/30'
                    : 'border-orange-500/30'
                } flex items-center justify-center`}
              >
                <div className="scale-[0.9]">{getMatchTypeIcon(score.match_type)}</div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center sm:space-x-2 space-x-0.5 mb-1 sm:mb-1 flex-wrap gap-y-0.5">
                  <h3 className="text-lg sm:text-lg text-[10px] font-bold text-white truncate max-w-[100px]">
                    {score.match_type === 'solo'
                      ? score.player_username
                      : score.team_name}
                  </h3>
                  <div className="scale-[0.6]">{getStatusBadge(score.status)}</div>
                </div>

                <div className="flex items-center sm:space-x-3 space-x-1 text-gray-300 text-[9px] font-medium">
                  <div
                    className={`flex items-center space-x-1 ${getMatchTypeColor(
                      score.match_type
                    )}`}
                  >
                    <div className="scale-[0.6]">{getMatchTypeIcon(score.match_type)}</div>
                    <span>{score.match_type.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-red-400">
                    <FaSkull className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2" />
                    <span>{score.kills} Kills</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center sm:space-x-6 space-x-2 justify-between w-full sm:w-auto">
            <div className="text-right sm:text-right text-left">
              <div className="text-2xl sm:text-2xl text-[12px] font-bold text-cyan-400">
                {score.points}
              </div>
              <div className="text-sm sm:text-sm text-[9px] text-gray-400">Points</div>
            </div>

            <div className="text-right sm:text-right text-left">
              <div className="text-lg sm:text-lg text-[11px] font-bold text-green-400">
                {formatCurrency(score.prize_won).replace('₹', '₹')}
              </div>
              <div className="text-sm sm:text-sm text-[9px] text-gray-400">Prize</div>
            </div>
          </div>
        </div>

        {/* Team Members Section */}
        {score.match_type !== 'solo' && score.team_members && (
          <div className="mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-2 sm:mb-2 mb-1">
              <div className="text-sm sm:text-sm text-[9px] font-semibold text-gray-400">
                Team Members ({score.team_members.length})
              </div>
              <button
                onClick={() => toggleTeamExpand(score.id)}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-200 text-[9px]"
              >
                <span>
                  {expandedTeam === score.id ? 'Show Less' : 'Show All'}
                </span>
                {expandedTeam === score.id ? (
                  <FaChevronUp className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2" />
                ) : (
                  <FaChevronDown className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2" />
                )}
              </button>
            </div>

            <div className="grid sm:gap-2 gap-1">
              {score.team_members
                .slice(
                  0,
                  expandedTeam === score.id
                    ? score.team_members.length
                    : 2
                )
                .map((member) => (
                  <div
                    key={member.player_id}
                    className="flex items-center justify-between sm:p-3 p-1.5 bg-gray-800/50 rounded-md border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center sm:space-x-3 space-x-1">
                      <div className="w-8 h-8 sm:w-8 sm:h-8 w-4.5 h-4.5 bg-gradient-to-br from-gray-600 to-gray-700 rounded-md flex items-center justify-center">
                        <FaUser className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2 text-gray-400" />
                      </div>
                      <span className="text-white font-medium sm:text-sm text-[9px]">
                        {member.username}
                      </span>
                    </div>
                    <div className="flex items-center sm:space-x-2 space-x-1">
                      <FaSkull className="w-3 h-3 sm:w-3 sm:h-3 w-2 h-2 text-red-400" />
                      <span className="text-red-400 font-bold sm:text-sm text-[9px]">
                        {member.kills}
                      </span>
                    </div>
                  </div>
                ))}

              {!expandedTeam && score.team_members.length > 2 && (
                <div className="text-center py-1">
                  <span className="text-cyan-400 text-sm sm:text-sm text-[9px]">
                    +{score.team_members.length - 2} more members
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

        {/* Enhanced Empty State */}
        {scores.length === 0 && (
          <div className="text-center py-12 mobile:py-8">
            <div className="w-24 h-24 bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-full flex items-center justify-center mx-auto mb-4 mobile:w-16 mobile:h-16 mobile:mb-3">
              <GiPodium className="w-12 h-12 text-gray-400 mobile:w-8 mobile:h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 mobile:text-lg">No Scores Found</h3>
            <p className="text-gray-400 mb-6 mobile:text-sm mobile:mb-4">
              {searchTerm ? 'No results match your search' : 'No scores available for this tournament'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ match_type: 'all', status: 'all' })
              }}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 mobile:px-6 mobile:py-2.5 mobile:text-sm"
            >
              {searchTerm ? 'Clear Search' : 'Reset Filters'}
            </button>
          </div>
        )}

        {/* Results Count */}
        {scores.length > 0 && (
          <div className="text-center mt-6 mobile:mt-4">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 text-cyan-400 px-4 py-2 rounded-full mobile:px-3 mobile:py-1.5 mobile:text-sm">
              <FaUsers className="w-4 h-4 mobile:w-3 mobile:h-3" />
              <span>
                Showing <strong>{scores.length}</strong> of <strong>{scores.length}</strong> entries
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TournamentScoresPage