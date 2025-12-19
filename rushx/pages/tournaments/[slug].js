import { useState,useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaUsers, 
  FaTrophy, FaTimesCircle,
  FaCalendarAlt, 
  FaClock, 
  FaMoneyBillWave,
  FaGamepad,
  FaShare,
  FaBookmark,
  FaCrown,
  FaMedal,
  FaQrcode,
  FaCheckCircle,
  FaLock,
  FaEye,
  FaArrowLeft,
  FaWhatsapp,
  FaDiscord,
  FaTwitter,
  FaHourglassHalf,
  FaExternalLinkAlt,
  FaSkull,
  FaUser,
  FaUserFriends,
  FaUsers as FaSquad,
  FaGift,
  FaTag,
  FaCopy,
  FaPercentage,
  FaPlus,
  FaSearch,
  FaFilter,
  FaUserPlus,
  FaUserTimes,
  FaUnlock,
  FaRegClock,
  FaShieldAlt,
  FaStar,
  FaAward,
  FaSignOutAlt,
  FaEdit,
  FaTrash
} from 'react-icons/fa'
import { GiTrophyCup, GiPodium, GiTeamIdea, GiTeamUpgrade, GiTeamDowngrade, GiRank3 } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const TournamentDetail = () => {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()
  
  const [tournament, setTournament] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])
  const [enrollmentFormData, setEnrollmentFormData] = useState(null)
  const [topScores, setTopScores] = useState([])
  const [scoresLoading, setScoresLoading] = useState(true)
  const [teams, setTeams] = useState([])
  const [userTeam, setUserTeam] = useState(null)
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    if (slug) {
      fetchTournamentData()
    }
  }, [slug, user])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      
      // Fetch tournament
      const { data: tournamentData, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      setTournament(tournamentData)

      // Fetch enrollment if user is logged in
      if (user) {
        const { data: enrollmentData } = await supabase
          .from('tournament_enrollments')
          .select('*')
          .eq('tournament_id', tournamentData.id)
          .eq('user_id', user.id)
          .single()

        setEnrollment(enrollmentData)

        // Fetch user's team if enrolled
        if (enrollmentData && ['duo', 'squad'].includes(tournamentData.match_type)) {
          await fetchUserTeam(tournamentData.id, user.id)
        }
      }

      // Fetch leaderboard
      const { data: leaderboardData } = await supabase
        .from('tournament_leaderboard')
        .select(`
          *,
          users:user_id (
            username,
            gamer_tag
          )
        `)
        .eq('tournament_id', tournamentData.id)
        .order('score', { ascending: false })

      setLeaderboard(leaderboardData || [])
      
      // Fetch top 5 scores
      await fetchTopScores(tournamentData.id)

      // Fetch teams if it's a team tournament
      if (['duo', 'squad'].includes(tournamentData.match_type)) {
        await fetchTeams(tournamentData.id)
      }

    } catch (error) {
      console.error('Error fetching tournament:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTeam = async (tournamentId, userId) => {
    try {
      const { data: teamData } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          team_members:team_members(
            *,
            user:users(
              username,
              gamer_tag,
              avatar_url
            )
          )
        `)
        .eq('tournament_id', tournamentId)
        .contains('team_members.user_id', [userId])
        .single()

      setUserTeam(teamData)
    } catch (error) {
      console.error('Error fetching user team:', error)
      setUserTeam(null)
    }
  }

  const fetchTeams = async (tournamentId) => {
    try {
      setTeamsLoading(true)
      const { data: teamsData, error } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          team_members:team_members(
            *,
            user:users(
              username,
              gamer_tag,
              avatar_url
            )
          ),
          owner:users(
            username,
            gamer_tag,
            avatar_url
          )
        `)
        .eq('tournament_id', tournamentId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTeams(teamsData || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
      setTeams([])
    } finally {
      setTeamsLoading(false)
    }
  }

  const fetchTopScores = async (tournamentId) => {
    try {
      setScoresLoading(true)
      
      // Try to fetch from tournament_scores table first
      const { data: scoresData, error } = await supabase
        .from('tournament_scores')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('points', { ascending: false })
        .limit(5)

      if (error) throw error

      if (scoresData && scoresData.length > 0) {
        setTopScores(scoresData)
      } else {
        // If no scores in database, set empty array
        setTopScores([])
      }

    } catch (error) {
      console.error('Error fetching top scores:', error)
      setTopScores([])
    } finally {
      setScoresLoading(false)
    }
  }

  const handleJoinClick = () => {
    if (!user) {
      router.push('/auth?redirect=' + router.asPath)
      return
    }
    
    // Check if tournament is full
    if (tournament.current_participants >= tournament.max_participants) {
      alert('Tournament is full! Registration closed.')
      return
    }
    
    setShowEnrollModal(true)
  }

  const handleEnrollSubmit = (formData) => {
    setEnrollmentFormData(formData)
    setShowEnrollModal(false)
    setShowPaymentModal(true)
  }

  const handleCreateTeam = () => {
    if (!enrollment) {
      alert('You need to enroll in this tournament first to create a team!')
      return
    }
    
    if (userTeam) {
      alert('You are already in a team for this tournament!')
      return
    }
    
    setShowCreateTeamModal(true)
  }

  const handleJoinTeam = (team) => {
    if (!enrollment) {
      alert('You need to enroll in this tournament first to join a team!')
      return
    }
    
    if (userTeam) {
      alert('You are already in a team for this tournament!')
      return
    }
    
    setSelectedTeam(team)
    setShowJoinTeamModal(true)
  }

  const handleTeamCreated = () => {
    setShowCreateTeamModal(false)
    fetchTournamentData()
  }

  const handleTeamJoined = () => {
    setShowJoinTeamModal(false)
    setSelectedTeam(null)
    fetchTournamentData()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Tournament...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <IoMdAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
          <p className="text-gray-400 mb-6">The tournament you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/tournaments')}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            Browse Tournaments
          </button>
        </div>
      </div>
    )
  }

  const isTournamentFull = tournament.current_participants >= tournament.max_participants
  const isTeamTournament = ['duo', 'squad'].includes(tournament.match_type)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Tournament Header */}
        <TournamentHeader 
          tournament={tournament}
          currentBanner={currentBanner}
          setCurrentBanner={setCurrentBanner}
          enrollment={enrollment}
          onJoinClick={handleJoinClick}
          isTournamentFull={isTournamentFull}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <TournamentSidebar 
                tournament={tournament}
                enrollment={enrollment}
                onJoinClick={handleJoinClick}
                isTournamentFull={isTournamentFull}
              />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <TournamentTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                tournament={tournament}
                enrollment={enrollment}
                leaderboard={leaderboard}
                topScores={topScores}
                scoresLoading={scoresLoading}
                teams={teams}
                userTeam={userTeam}
                teamsLoading={teamsLoading}
                onCreateTeam={handleCreateTeam}
                onJoinTeam={handleJoinTeam}
                isTeamTournament={isTeamTournament}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEnrollModal && (
        <EnrollModal 
          tournament={tournament}
          onClose={() => setShowEnrollModal(false)}
          onSubmit={handleEnrollSubmit}
        />
      )}

      {showPaymentModal && (
        <PaymentModal 
          tournament={tournament}
          enrollmentData={enrollmentFormData}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={fetchTournamentData}
        />
      )}

      {showCreateTeamModal && (
        <CreateTeamModal
          tournament={tournament}
          enrollment={enrollment}
          onClose={() => setShowCreateTeamModal(false)}
          onSuccess={handleTeamCreated}
        />
      )}

      {showJoinTeamModal && selectedTeam && (
        <JoinTeamModal
          team={selectedTeam}
          tournament={tournament}
          enrollment={enrollment}
          onClose={() => {
            setShowJoinTeamModal(false)
            setSelectedTeam(null)
          }}
          onSuccess={handleTeamJoined}
        />
      )}
    </div>
  )
}

// Tournament Header Component
const TournamentHeader = ({ tournament, currentBanner, setCurrentBanner, enrollment, onJoinClick, isTournamentFull }) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      upcoming: { color: 'bg-yellow-500', text: 'Upcoming' },
      ongoing: { color: 'bg-green-500', text: 'Live Now' },
      completed: { color: 'bg-gray-500', text: 'Completed' }
    }
    const config = statusConfig[status] || statusConfig.upcoming
    return (
      <span className={`${config.color} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
        {config.text}
      </span>
    )
  }

  const getEnrollmentStatus = () => {
    if (!enrollment) return null
    
    const statusConfig = {
      pending: { color: 'bg-yellow-500/20', text: 'Under Review', icon: <FaHourglassHalf className="w-4 h-4" /> },
      completed: { color: 'bg-green-500/20', text: 'Enrolled', icon: <FaCheckCircle className="w-4 h-4" /> },
      rejected: { color: 'bg-red-500/20', text: 'Rejected', icon: <IoMdAlert className="w-4 h-4" /> }
    }
    
    const config = statusConfig[enrollment.payment_status] || statusConfig.pending
    
    return (
      <div className={`${config.color} border border-yellow-500/50 rounded-2xl px-6 py-4 text-center`}>
        <div className="flex items-center justify-center space-x-2 text-yellow-400 mb-2">
          {config.icon}
          <span className="font-semibold">{config.text}</span>
        </div>
        {enrollment.team_id && (
          <div className="text-yellow-300 text-sm">Team ID: {enrollment.team_id}</div>
        )}
        {enrollment.payment_status === 'pending' && (
          <div className="text-yellow-200 text-xs mt-1">Waiting for payment verification</div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Banner Carousel */}
      <div className="relative h-96 lg:h-[500px] overflow-hidden">
        {tournament.banner_urls?.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentBanner ? 'opacity-30' : 'opacity-0'
            }`}
          >
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${banner})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            </div>
          </div>
        ))}
        
        {/* Banner Navigation */}
        {tournament.banner_urls?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {tournament.banner_urls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentBanner ? 'bg-cyan-400 scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Header Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                  {getStatusBadge(tournament.status)}
                  {isTournamentFull && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs sm:text-sm font-semibold">
                      Tournament Full
                    </span>
                  )}
                  <span className="text-cyan-400 font-semibold flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                    <FaGamepad className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{tournament.game_name}</span>
                  </span>
                  <span className="text-gray-300 flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                    <FaUsers className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{tournament.current_participants}/{tournament.max_participants} Players</span>
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl sm:text-3xl lg:text-6xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                  {tournament.title}
                </h1>
                
                {/* Description */}
                <p className="text-sm sm:text-base lg:text-xl text-gray-300 max-w-full sm:max-w-3xl mb-4 sm:mb-6">
                  {tournament.description}
                </p>
              </div>

              {/* Join Button */}
              <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
                {enrollment ? (
                  getEnrollmentStatus()
                ) : (
                  <button
                    onClick={onJoinClick}
                    disabled={tournament.status !== 'upcoming' || isTournamentFull}
                    className="px-6 sm:px-8 py-2 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-sm sm:text-lg"
                  >
                    {isTournamentFull ? 'Tournament Full' : `Join Tournament - ₹${tournament.joining_fee}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tournament Sidebar Component
const TournamentSidebar = ({ tournament, enrollment, onJoinClick, isTournamentFull }) => {
  const prizePool = tournament.prize_pool || {}
  const schedule = tournament.schedule || {}

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
          <GiTrophyCup className="w-5 h-5 text-cyan-400" />
          <span>Quick Info</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Entry Fee</span>
            <span className="text-cyan-400 font-semibold">₹{tournament.joining_fee}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Players</span>
            <span className="text-white font-semibold">
              {tournament.current_participants}/{tournament.max_participants}
              {isTournamentFull && (
                <span className="text-red-400 text-sm ml-2">(Full)</span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Match Type</span>
            <span className="text-white font-semibold">{tournament.match_type}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Registration</span>
            <span className="text-white font-semibold">
              {new Date(schedule.registration_end).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Prize Pool */}
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
          <FaTrophy className="w-5 h-5 text-yellow-400" />
          <span>Prize Pool</span>
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-yellow-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaCrown className="w-4 h-4 text-yellow-400" />
              <span className="text-white">Winner</span>
            </div>
            <span className="text-yellow-400 font-bold">₹{prizePool.winner}</span>
          </div>
          
          <div className="flex justify-between items-center bg-gray-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaMedal className="w-4 h-4 text-gray-400" />
              <span className="text-white">Runner Up</span>
            </div>
            <span className="text-gray-300 font-semibold">₹{prizePool.runnerUp}</span>
          </div>
          <div className="flex justify-between items-center bg-gray-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaMedal className="w-4 h-4 text-amber-600" />
              <span className="text-white">3rd Place</span>
            </div>
            <span className="text-gray-300 font-semibold">₹{prizePool.thirdPlace}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaMedal className="w-4 h-4 text-teal-500" />
              <span className="text-white">4th Place</span>
            </div>
            <span className="text-gray-300 font-semibold">₹{prizePool.fourthPlace}</span>
          </div>

          <div className="flex justify-between items-center bg-gray-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <FaMedal className="w-4 h-4 text-blue-500" />
              <span className="text-white">5th Place</span>
            </div>
            <span className="text-gray-300 font-semibold">₹{prizePool.fifthPlace}</span>
          </div>
        </div>
      </div>

      {/* Share Tournament */}
      <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
        <h3 className="text-white font-bold text-lg mb-4">Share Tournament</h3>
        <div className="flex space-x-3">
          <button className="flex-1 flex items-center justify-center space-x-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg p-3 transition-colors duration-300">
            <FaWhatsapp className="w-4 h-4" />
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-lg p-3 transition-colors duration-300">
            <FaDiscord className="w-4 h-4" />
          </button>
          <button className="flex-1 flex items-center justify-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg p-3 transition-colors duration-300">
            <FaTwitter className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Tournament Tabs Component
const TournamentTabs = ({ 
  activeTab, 
  setActiveTab, 
  tournament, 
  enrollment, 
  leaderboard, 
  topScores, 
  scoresLoading,
  teams,
  userTeam,
  teamsLoading,
  onCreateTeam,
  onJoinTeam,
  isTeamTournament
}) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FaEye className="w-4 h-4" /> },
    { id: 'about', name: 'About', icon: <FaBookmark className="w-4 h-4" /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <GiPodium className="w-4 h-4" /> },
    { id: 'rules', name: 'Rules', icon: <FaLock className="w-4 h-4" /> },
  ]

  // Add Teams tab for team tournaments
  if (isTeamTournament) {
    tabs.splice(3, 0, { id: 'teams', name: 'Teams', icon: <FaUsers className="w-4 h-4" /> })
  }

  if (enrollment) {
    tabs.push({ id: 'myteam', name: 'My Team', icon: <FaUsers className="w-4 h-4" /> })
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-cyan-500/20">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab tournament={tournament} />}
        {activeTab === 'about' && <AboutTab tournament={tournament} />}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab 
            leaderboard={leaderboard} 
            topScores={topScores}
            scoresLoading={scoresLoading}
            tournamentId={tournament?.id}
          />
        )}
        {activeTab === 'rules' && <RulesTab tournament={tournament} />}
        {activeTab === 'teams' && (
          <TeamsTab
            tournament={tournament}
            teams={teams}
            userTeam={userTeam}
            loading={teamsLoading}
            enrollment={enrollment}
            onCreateTeam={onCreateTeam}
            onJoinTeam={onJoinTeam}
          />
        )}
        {activeTab === 'myteam' && <MyTeamTab enrollment={enrollment} />}
      </div>
    </div>
  )
}

// Tab Components

// Overview Tab Component
const OverviewTab = ({ tournament }) => {
  const schedule = tournament.schedule || {}
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <FaCalendarAlt className="w-6 h-6 text-cyan-400" />
            <h3 className="text-white font-semibold">Registration Ends</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {new Date(schedule.registration_end).toLocaleDateString()}
          </p>
          <p className="text-gray-400 text-sm">
            {new Date(schedule.registration_end).toLocaleTimeString()}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <FaClock className="w-6 h-6 text-purple-400" />
            <h3 className="text-white font-semibold">Tournament Starts</h3>
          </div>
          <p className="text-2xl font-bold text-white">
            {new Date(schedule.start_date).toLocaleDateString()}
          </p>
          <p className="text-gray-400 text-sm">
            {new Date(schedule.start_date).toLocaleTimeString()}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center space-x-3 mb-4">
            <FaTrophy className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white font-semibold">Total Prize</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-400">
            ₹{(
              (tournament.prize_pool?.winner || 0) +
              (tournament.prize_pool?.runnerUp || 0) +
              (tournament.prize_pool?.thirdPlace || 0) +
              (tournament.prize_pool?.fourthPlace || 0) +
              (tournament.prize_pool?.fifthPlace || 0)
            ).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">
            Winner + Runner Up + 3rd + 4th + 5th Place
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-xl p-6 border border-cyan-500/20">
        <h3 className="text-white font-bold text-xl mb-4">Tournament Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Match Structure</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• {tournament.match_type} matches</li>
              <li>• Matches held in official custom rooms.</li>
              <li>• Room ID & Password shared before match starts.</li>
              <li>• Players must join on time to be eligible.</li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Requirements</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• Stable internet connection</li>
              <li>• Discord for communication</li>
              <li>• Register and pay entry fee on time.</li>
              <li>• Fair play agreement</li>
              <li>• Use the same in-game ID as submitted.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// About Tab Component
const AboutTab = ({ tournament }) => {
  const about = tournament.about || {}
  
  return (
    <div className="prose prose-invert max-w-none">
      {about.sections?.map((section, index) => (
        <div key={index} className="mb-8">
          {section.type === 'heading' && (
            <h3 className="text-2xl font-bold text-white mb-4">{section.content}</h3>
          )}
          {section.type === 'paragraph' && (
            <p className="text-gray-300 leading-relaxed mb-4">{section.content}</p>
          )}
          {section.type === 'bullet_list' && (
            <ul className="text-gray-300 space-y-2">
              {section.items?.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start space-x-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
      
      {!about.sections && (
        <div className="text-center py-12">
          <FaBookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No About Content</h3>
          <p className="text-gray-400">Tournament details will be added soon.</p>
        </div>
      )}
    </div>
  )
}

// Leaderboard Tab Component
const LeaderboardTab = ({ leaderboard, topScores, scoresLoading, tournamentId }) => {
  const router = useRouter()

  const getMatchTypeIcon = (matchType) => {
    const icons = {
      solo: FaUser,
      duo: FaUserFriends,
      squad: FaSquad
    }
    const Icon = icons[matchType] || FaUsers
    return <Icon className="w-3 h-3" />
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
      1: { color: 'from-yellow-400 to-yellow-600', text: '1st' },
      2: { color: 'from-gray-400 to-gray-600', text: '2nd' },
      3: { color: 'from-orange-400 to-orange-600', text: '3rd' },
      4: { color: 'from-purple-400 to-purple-600', text: '4th' },
      5: { color: 'from-cyan-400 to-cyan-600', text: '5th' }
    }
    
    const badge = badges[rank] || { color: 'from-green-400 to-green-600', text: `${rank}th` }
    
    return (
      <div className={`w-8 h-8 bg-gradient-to-br ${badge.color} rounded-lg flex items-center justify-center`}>
        <span className="text-white font-bold text-xs">{badge.text}</span>
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

  const handleViewCompleteScorecard = () => {
    if (tournamentId) {
      router.push(`/score/${tournamentId}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">Tournament Leaderboard</h3>
        <div className="flex items-center space-x-2 text-cyan-400">
          <GiPodium className="w-5 h-5" />
          <span>Top Performers</span>
        </div>
      </div>

      {/* Top 5 Scores Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold text-lg">Top 5 Winners</h4>
          {topScores.length > 0 && (
            <button
              onClick={handleViewCompleteScorecard}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-lg transition-all duration-300"
            >
              <span>View Complete Scorecard</span>
              <FaExternalLinkAlt className="w-3 h-3" />
            </button>
          )}
        </div>

        {scoresLoading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-cyan-400">Loading scores...</p>
          </div>
        ) : topScores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
            {topScores.map((score) => (
              <div
                key={score.id}
                className={`bg-gradient-to-r ${
                  score.rank === 1 ? 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/30' :
                  score.rank === 2 ? 'from-gray-500/10 to-gray-500/5 border-gray-500/30' :
                  score.rank === 3 ? 'from-orange-500/10 to-orange-500/5 border-orange-500/30' :
                  'from-purple-500/10 to-purple-500/5 border-purple-500/30'
                } border rounded-xl p-4 hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getRankBadge(score.rank)}
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="text-white font-semibold">
                          {score.match_type === 'solo' ? score.player_username : score.team_name}
                        </h5>
                        <div className={`flex items-center space-x-1 ${getMatchTypeColor(score.match_type)}`}>
                          {getMatchTypeIcon(score.match_type)}
                          <span className="text-xs">{score.match_type.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <FaSkull className="w-3 h-3 text-red-400" />
                          <span>{score.kills} Kills</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FaTrophy className="w-3 h-3 text-cyan-400" />
                          <span>{score.points} Points</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {formatCurrency(score.prize_won).replace('₹', '₹')}
                    </div>
                    <div className="text-sm text-gray-400">Prize Won</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <GiPodium className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold text-lg mb-2">Scorecard Not Released</h4>
            <p className="text-gray-400">
              The tournament scorecard hasn't been released yet. Check back after the tournament ends.
            </p>
          </div>
        )}
      </div>

      {/* Original Leaderboard Section */}
      <div className="border-t border-gray-700/50 pt-6">
        <h4 className="text-white font-semibold text-lg mb-4">Live Leaderboard</h4>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <GiPodium className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-white font-semibold text-lg mb-2">No Leaderboard Data</h4>
            <p className="text-gray-400">Leaderboard will be updated once the tournament starts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  index < 3
                    ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30'
                    : 'bg-gray-800/50 border-gray-700/50 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-white font-semibold">
                      {player.users?.gamer_tag || player.users?.username || 'Unknown Player'}
                    </div>
                    <div className="text-gray-400 text-sm">Team: {player.team_id}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-right">
                  <div>
                    <div className="text-white font-bold">{player.score} pts</div>
                    <div className="text-gray-400 text-sm">Score</div>
                  </div>
                  <div>
                    <div className="text-green-400 font-bold">{player.kills}</div>
                    <div className="text-gray-400 text-sm">Kills</div>
                  </div>
                  <div>
                    <div className="text-red-400 font-bold">{player.deaths}</div>
                    <div className="text-gray-400 text-sm">Deaths</div>
                  </div>
                  {player.prize_won > 0 && (
                    <div>
                      <div className="text-yellow-400 font-bold">₹{player.prize_won}</div>
                      <div className="text-gray-400 text-sm">Prize</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Rules Tab Component
const RulesTab = ({ tournament }) => {
  const rules = tournament.rules || {}
  
  return (
    <div className="space-y-6">
      {rules.sections?.map((section, index) => (
        <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center space-x-2">
            <FaLock className="w-5 h-5 text-cyan-400" />
            <span>{section.title}</span>
          </h3>
          <ul className="text-gray-300 space-y-2">
            {section.rules?.map((rule, ruleIndex) => (
              <li key={ruleIndex} className="flex items-start space-x-3">
                <span className="text-cyan-400 mt-1">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      
      {!rules.sections && (
        <div className="text-center py-12">
          <FaLock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No Rules Available</h3>
          <p className="text-gray-400">Tournament rules will be added soon.</p>
        </div>
      )}
    </div>
  )
}

// Teams Tab Component - NEW COMPONENT
const TeamsTab = ({ tournament, teams, userTeam, loading, enrollment, onCreateTeam, onJoinTeam }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTeams, setFilteredTeams] = useState(teams)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    filterTeams()
  }, [teams, searchTerm, activeFilter])

  const filterTeams = () => {
    let filtered = teams

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.team_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.owner.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by active filter
    if (activeFilter === 'open') {
      filtered = filtered.filter(team => team.privacy === 'open')
    } else if (activeFilter === 'closed') {
      filtered = filtered.filter(team => team.privacy === 'closed')
    } else if (activeFilter === 'available') {
      filtered = filtered.filter(team => team.team_members.length < getMaxTeamSize(tournament.match_type))
    } else if (activeFilter === 'full') {
      filtered = filtered.filter(team => team.team_members.length >= getMaxTeamSize(tournament.match_type))
    }

    setFilteredTeams(filtered)
  }

  const getMaxTeamSize = (matchType) => {
    const sizes = {
      solo: 1,
      duo: 2,
      squad: 4
    }
    return sizes[matchType] || 1
  }

  const getTeamStatus = (team) => {
    const maxSize = getMaxTeamSize(tournament.match_type)
    const currentSize = team.team_members.length
    
    if (currentSize >= maxSize) {
      return { status: 'full', color: 'text-red-400', bg: 'bg-red-500/20' }
    } else if (team.privacy === 'closed') {
      return { status: 'closed', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    } else {
      return { status: 'open', color: 'text-green-400', bg: 'bg-green-500/20' }
    }
  }

  const maxTeamSize = getMaxTeamSize(tournament.match_type)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-cyan-400 font-semibold">Loading Teams...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Tournament Teams</h3>
          <p className="text-gray-400">
            {tournament.match_type.toUpperCase()} • Max {maxTeamSize} players per team
          </p>
        </div>

        {enrollment ? (
          userTeam ? (
            <div className="flex items-center space-x-2 mt-4 lg:mt-0">
              <div className="bg-green-500/20 border border-green-500/50 text-green-400 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="w-4 h-4" />
                  <span>You're in {userTeam.team_name}</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onCreateTeam}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 mt-4 lg:mt-0"
            >
              <FaPlus className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          )
        ) : (
          <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-3 rounded-lg mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <IoMdAlert className="w-4 h-4" />
              <span>Enroll in the tournament to create or join a team</span>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-cyan-500/30">
          <GiTeamUpgrade className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">{teams.length}</div>
          <div className="text-gray-400 text-sm">Total Teams</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-green-500/30">
          <FaUsers className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">
            {teams.reduce((acc, team) => acc + team.team_members.length, 0)}
          </div>
          <div className="text-gray-400 text-sm">Players</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-yellow-500/30">
          <FaRegClock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">
            {teams.filter(t => t.team_members.length < maxTeamSize).length}
          </div>
          <div className="text-gray-400 text-sm">With Spots</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-4 text-center border border-red-500/30">
          <GiTeamDowngrade className="w-6 h-6 text-red-400 mx-auto mb-2" />
          <div className="text-xl font-bold text-white">
            {teams.filter(t => t.team_members.length >= maxTeamSize).length}
          </div>
          <div className="text-gray-400 text-sm">Full Teams</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teams by name, tag, or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', name: 'All', icon: FaUsers },
              { id: 'open', name: 'Open', icon: FaUnlock },
              { id: 'closed', name: 'Closed', icon: FaLock },
              { id: 'available', name: 'Available', icon: FaUserPlus },
              { id: 'full', name: 'Full', icon: FaUserTimes }
            ].map((filter) => {
              const Icon = filter.icon
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                      : 'bg-gray-700/50 border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{filter.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Teams Grid */}
      {filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              tournament={tournament}
              enrollment={enrollment}
              userTeam={userTeam}
              maxTeamSize={maxTeamSize}
              onJoin={onJoinTeam}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <GiTeamIdea className="w-24 h-24 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-bold text-white mb-2">No Teams Found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || activeFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Be the first to create a team for this tournament!'}
          </p>
          {!searchTerm && activeFilter === 'all' && enrollment && !userTeam && (
            <button
              onClick={onCreateTeam}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Create First Team
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Team Card Component
const TeamCard = ({ team, tournament, enrollment, userTeam, maxTeamSize, onJoin }) => {
  const teamStatus = getTeamStatus(team)
  const isFull = team.team_members.length >= maxTeamSize
  const canJoin = enrollment && !userTeam && !isFull && team.privacy === 'open'

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
      {/* Team Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {team.team_logo ? (
            <img 
              src={team.team_logo} 
              alt={team.team_name}
              className="w-12 h-12 rounded-lg border border-cyan-500/30"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg border border-cyan-500/30 flex items-center justify-center">
              <FaUsers className="w-6 h-6 text-white" />
            </div>
          )}
          
          <div>
            <h3 className="text-white font-bold text-lg">{team.team_name}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-cyan-400 font-mono text-sm bg-cyan-500/20 px-2 py-1 rounded">
                {team.team_tag}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${teamStatus.bg} ${teamStatus.color}`}>
                {teamStatus.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right leading-tight">
  <div className="flex items-center justify-end space-x-0.5 text-yellow-400 text-[10px] mb-0.5">
    <FaCrown className="w-2.5 h-2.5" />
    <span className="truncate max-w-[70px]">{team.owner.username}</span>
  </div>
  <div className="text-gray-400 text-[10px]">
    {team.team_members.length}/{maxTeamSize} members
  </div>
</div>

      </div>

      {/* Team Description */}
      {team.team_description && (
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {team.team_description}
        </p>
      )}

      {/* Team Members Preview */}
      <div className="flex items-center space-x-2 mb-4">
        {team.team_members.slice(0, 3).map((member) => (
          <div key={member.id} className="flex items-center space-x-1">
            {member.user.avatar_url ? (
              <img 
                src={member.user.avatar_url} 
                alt={member.user.username}
                className="w-6 h-6 rounded"
              />
            ) : (
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center">
                <FaUser className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
        {team.team_members.length > 3 && (
          <span className="text-gray-400 text-sm">
            +{team.team_members.length - 3} more
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => window.open(`/${tournament.id}/team/${team.id}`, '_blank')}
          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/50 hover:text-white transition-colors duration-300 text-sm"
        >
          <FaEye className="w-3 h-3" />
          <span>View</span>
        </button>
        
        {canJoin && (
          <button
            onClick={() => onJoin(team)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 text-sm"
          >
            <FaUserPlus className="w-3 h-3" />
            <span>Join</span>
          </button>
        )}
        
        {isFull && (
          <button
            disabled
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg cursor-not-allowed text-sm"
          >
            <FaUserTimes className="w-3 h-3" />
            <span>Full</span>
          </button>
        )}
      </div>
    </div>
  )
}

// MyTeam Tab Component
const MyTeamTab = ({ enrollment }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-xl p-6 border border-cyan-500/30">
          <h3 className="text-white font-bold text-lg mb-4">Your Team Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Status:</span>
              <span className={`font-semibold capitalize ${
                enrollment.payment_status === 'completed' ? 'text-green-400' :
                enrollment.payment_status === 'rejected' ? 'text-red-400' :
                'text-yellow-400'
              }`}>
                {enrollment.payment_status}
              </span>
            </div>
            {enrollment.team_id && (
              <div className="flex justify-between">
                <span className="text-gray-400">Team ID:</span>
                <span className="text-cyan-400 font-mono font-bold">{enrollment.team_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">In-Game Name:</span>
              <span className="text-white font-semibold">{enrollment.in_game_nickname}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Game UID:</span>
              <span className="text-white font-semibold">{enrollment.game_uid}</span>
            </div>
            {enrollment.referral_code && (
              <div className="flex justify-between">
                <span className="text-gray-400">Referral Code:</span>
                <span className="text-purple-400 font-semibold">{enrollment.referral_code}</span>
              </div>
            )}
            {enrollment.referral_discount && (
              <div className="flex justify-between">
                <span className="text-gray-400">Referral Discount:</span>
                <span className="text-green-400 font-semibold">₹{enrollment.referral_discount}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-xl p-6 border border-purple-500/30">
          <h3 className="text-white font-bold text-lg mb-4">Match Room</h3>
          {enrollment.room_details ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Room ID:</span>
                <span className="text-purple-400 font-mono font-bold">{enrollment.room_details.room_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Password:</span>
                <span className="text-purple-400 font-mono font-bold">{enrollment.room_details.password}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned:</span>
                <span className="text-white text-sm">
                  {new Date(enrollment.room_details.assigned_at).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <FaClock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400">Room details will be available 15-30 minutes before match</p>
            </div>
          )}
        </div>
      </div>

      {enrollment.payment_status === 'pending' && (
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl p-6 border border-yellow-500/30">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
            <FaHourglassHalf className="w-5 h-5 text-yellow-400" />
            <span>Enrollment Under Review</span>
          </h3>
          <p className="text-gray-300 mb-4">
            Your enrollment is currently under review. We are verifying your payment. 
            You will receive your Team ID and confirmation within 24 hours.
          </p>
        </div>
      )}

      {enrollment.room_details && (
        <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-xl p-6 border border-green-500/30">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
            <FaCheckCircle className="w-5 h-5 text-green-400" />
            <span>Ready to Play!</span>
          </h3>
          <p className="text-gray-300 mb-4">
            Your match room is ready. Join the room using the details above 10 minutes before the scheduled time.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300">
            Join Match Room
          </button>
        </div>
      )}
    </div>
  )
}

// Create Team Modal Component
const CreateTeamModal = ({ tournament, userEnrollment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')
  const [formData, setFormData] = useState({
    team_name: '',
    team_tag: '',
    team_description: '',
    team_logo: '',
    privacy: 'open'
  })
  const fileInputRef = useRef(null)

  const getMaxTeamSize = (matchType) => {
    const sizes = {
      solo: 1,
      duo: 2,
      squad: 4
    }
    return sizes[matchType] || 1
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB')
      return
    }

    setUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `team-logos/${fileName}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('tournaments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tournaments')
        .getPublicUrl(filePath)

      // Update form data and preview
      setFormData(prev => ({ ...prev, team_logo: publicUrl }))
      setLogoPreview(publicUrl)

    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error uploading logo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, team_logo: '' }))
    setLogoPreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create team
      const { data: team, error } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: tournament.id,
          owner_id: userEnrollment.user_id,
          team_name: formData.team_name,
          team_tag: formData.team_tag.toUpperCase(),
          team_description: formData.team_description,
          team_logo: formData.team_logo,
          privacy: formData.privacy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Add owner as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userEnrollment.user_id,
          role: 'owner',
          joined_at: new Date().toISOString()
        })

      if (memberError) throw memberError

      onSuccess()
      alert('Team created successfully! You can now invite other players.')
    } catch (error) {
      console.error('Error creating team:', error)
      alert('Error creating team: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 md:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg sm:rounded-xl md:rounded-2xl shadow-xl sm:shadow-2xl shadow-cyan-500/20 w-full max-w-2xl mx-2 sm:mx-3 md:mx-4 my-2 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-3 sm:p-4 md:p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Create New Team</h2>
              <p className="text-cyan-400 text-xs sm:text-sm md:text-base mt-1">
                Create your team for {tournament.title}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-6">
          {/* Logo Upload Section */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <label className="block text-white font-semibold text-xs sm:text-sm md:text-base">
              Team Logo (Optional)
            </label>
            
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-6">
              {/* Logo Preview */}
              <div className="w-full sm:w-auto flex flex-col items-center">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/50 flex items-center justify-center overflow-hidden">
                    {logoPreview ? (
                      <>
                        <img 
                          src={logoPreview} 
                          alt="Team logo preview" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <FaEye className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                    )}
                  </div>
                  
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    >
                      <FaTimesCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                    </button>
                  )}
                </div>
                
                {logoPreview && (
                  <p className="text-gray-400 text-xs sm:text-sm mt-2 text-center truncate max-w-full">
                    Logo uploaded
                  </p>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                <div className="space-y-1 sm:space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-cyan-500/50 transition-colors duration-300 disabled:opacity-50 text-xs sm:text-sm md:text-base"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border border-gray-400 border-t-white rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </span>
                    ) : (
                      'Choose Logo Image'
                    )}
                  </button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  
                  <p className="text-gray-500 text-xs sm:text-sm">
                    JPEG, PNG, GIF, WebP • Max 5MB
                  </p>
                </div>
                
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 text-xs sm:text-sm"
                  >
                    Change Logo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Team Name & Tag */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label className="block text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                Team Name *
              </label>
              <input
                type="text"
                required
                value={formData.team_name}
                onChange={(e) => setFormData(prev => ({ ...prev, team_name: e.target.value }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300 text-sm sm:text-base"
                placeholder="Enter your team name"
                maxLength={50}
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.team_name.length}/50 characters
              </p>
            </div>

            <div>
              <label className="block text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
                Team Tag *
              </label>
              <input
                type="text"
                required
                maxLength={4}
                value={formData.team_tag}
                onChange={(e) => setFormData(prev => ({ ...prev, team_tag: e.target.value.toUpperCase() }))}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300 font-mono text-center text-sm sm:text-base md:text-lg"
                placeholder="TAG"
              />
              <p className="text-gray-500 text-xs mt-1 text-center">
                4 characters max • Will be displayed in uppercase
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
              Team Description (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.team_description}
              onChange={(e) => setFormData(prev => ({ ...prev, team_description: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300 resize-none text-sm sm:text-base"
              placeholder="Describe your team's playstyle, goals, requirements, etc."
              maxLength={500}
            />
            <p className="text-gray-500 text-xs mt-1 text-right">
              {formData.team_description?.length || 0}/500 characters
            </p>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
              Privacy Settings
            </label>
            <select
              value={formData.privacy}
              onChange={(e) => setFormData(prev => ({ ...prev, privacy: e.target.value }))}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 transition-colors duration-300 text-sm sm:text-base"
            >
              <option value="open">Open - Anyone can join</option>
              <option value="closed">Closed - Approval required</option>
            </select>
            <p className="text-gray-400 text-xs mt-1">
              {formData.privacy === 'open' 
                ? 'Players can join immediately without approval.' 
                : 'You must approve all join requests.'}
            </p>
          </div>

          {/* Tournament Info */}
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 sm:p-4">
            <h4 className="text-white font-semibold text-xs sm:text-sm md:text-base mb-2">
              Tournament Details
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
              <div>
                <p className="text-gray-400">Type:</p>
                <p className="text-white font-semibold">{tournament.match_type.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-gray-400">Max Team Size:</p>
                <p className="text-white font-semibold">
                  {getMaxTeamSize(tournament.match_type)} players
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 order-2 sm:order-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors duration-300 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 order-1 sm:order-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Team...</span>
                </span>
              ) : (
                'Create Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Join Team Modal Component
const JoinTeamModal = ({ team, tournament, enrollment, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)

  const handleJoin = async () => {
    setLoading(true)

    try {
      // Check if team has space
      const maxTeamSize = getMaxTeamSize(tournament.match_type)
      if (team.team_members.length >= maxTeamSize) {
        alert('This team is already full!')
        return
      }

      // Add user to team
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: enrollment.user_id,
          role: 'member',
          status: team.privacy === 'open' ? 'accepted' : 'pending',
          joined_at: new Date().toISOString()
        })

      if (error) throw error

      // Create notification for team owner if approval required
      if (team.privacy === 'closed') {
        await supabase
          .from('notifications')
          .insert({
            user_id: team.owner_id,
            title: 'Team Join Request',
            message: `${enrollment.in_game_nickname} wants to join your team "${team.team_name}"`,
            type: 'info',
            related_team_id: team.id,
            related_user_id: enrollment.user_id
          })
      }

      onSuccess()
      alert(
        team.privacy === 'open' 
          ? 'Successfully joined the team!' 
          : 'Join request sent! Waiting for team owner approval.'
      )
    } catch (error) {
      console.error('Error joining team:', error)
      alert('Error joining team: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-md">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Join Team</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaTimesCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            {team.team_logo ? (
              <img 
                src={team.team_logo} 
                alt={team.team_name}
                className="w-20 h-20 rounded-xl border border-cyan-500/30 mx-auto mb-4"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl border border-cyan-500/30 flex items-center justify-center mx-auto mb-4">
                <FaUsers className="w-8 h-8 text-white" />
              </div>
            )}
            
            <h3 className="text-white font-bold text-lg mb-2">{team.team_name}</h3>
            <div className="text-cyan-400 font-mono bg-cyan-500/20 px-3 py-1 rounded-lg inline-block mb-2">
              {team.team_tag}
            </div>
            <p className="text-gray-400 text-sm">
              Owned by {team.owner.username}
            </p>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Team Size:</span>
              <span className="text-white font-semibold">
                {team.team_members.length}/{getMaxTeamSize(tournament.match_type)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Privacy:</span>
              <span className={`font-semibold ${
                team.privacy === 'open' ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {team.privacy === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Your Status:</span>
              <span className="text-cyan-400 font-semibold">
                {enrollment.in_game_nickname}
              </span>
            </div>
          </div>

          {team.privacy === 'closed' && (
            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-2 text-yellow-400 mb-2">
                <FaLock className="w-4 h-4" />
                <span className="font-semibold">Approval Required</span>
              </div>
              <p className="text-yellow-300 text-sm">
                This team requires owner approval. Your request will be pending until the team owner accepts it.
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Joining...' : team.privacy === 'open' ? 'Join Team' : 'Request to Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enroll Modal Component - UPDATED WITH REFERRAL CODE
const EnrollModal = ({ tournament, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    in_game_nickname: '',
    game_uid: '',
    mobile_number: '',
    address: '',
    referral_code: ''
  })
  const [referralValid, setReferralValid] = useState(null)
  const [checkingReferral, setCheckingReferral] = useState(false)
  const [referralData, setReferralData] = useState(null)

  const validateReferralCode = async (code) => {
    if (!code || code.length < 3) {
      setReferralValid(null)
      setReferralData(null)
      return
    }

    setCheckingReferral(true)
    try {
      const { data, error } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) throw error
      
      setReferralValid(!!data)
      setReferralData(data)
    } catch (error) {
      console.error('Error validating referral code:', error)
      setReferralValid(false)
      setReferralData(null)
    } finally {
      setCheckingReferral(false)
    }
  }

  const handleReferralCodeChange = (e) => {
    const code = e.target.value
    setFormData(prev => ({ ...prev, referral_code: code }))
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateReferralCode(code)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Include referral validation in form data
    onSubmit({
      ...formData,
      referralValid: referralValid,
      referralData: referralData
    })
  }

  // Calculate discount for display
  const discountAmount = referralValid ? tournament.joining_fee * 0.1 : 0
  const finalAmount = tournament.joining_fee - discountAmount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl mx-4 my-12 sm:my-16">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Join Tournament</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
          <p className="text-cyan-400 text-sm sm:text-base mt-1 sm:mt-2">
            Complete your registration for {tournament.title}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* In-Game Nickname */}
            <div>
              <label className="block text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                In-Game Nickname *
              </label>
              <input
                type="text"
                required
                value={formData.in_game_nickname}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, in_game_nickname: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="Enter your in-game name"
              />
            </div>

            {/* Game UID */}
            <div>
              <label className="block text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                Game UID *
              </label>
              <input
                type="text"
                required
                value={formData.game_uid}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, game_uid: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="Your game user ID"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile_number}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mobile_number: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            {/* Referral Code */}
            <div>
              <label className="block text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.referral_code}
                  onChange={handleReferralCodeChange}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                  placeholder="Enter referral code for 10% OFF"
                />
                {checkingReferral && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                  </div>
                )}
                {referralValid === true && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <FaCheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                )}
                {referralValid === false && formData.referral_code.length > 2 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <IoMdAlert className="w-4 h-4 text-red-400" />
                  </div>
                )}
              </div>
              
              {/* Referral Status Messages */}
              {referralValid === true && (
                <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                  <p className="text-green-400 text-sm">
                    ✅ Valid code! You'll get 10% OFF (Save ₹{discountAmount})
                  </p>
                  <p className="text-green-300 text-xs mt-1">
                    Final amount: ₹{finalAmount} instead of ₹{tournament.joining_fee}
                  </p>
                </div>
              )}
              {referralValid === false && formData.referral_code.length > 2 && (
                <p className="text-red-400 text-xs mt-1">
                  Invalid referral code. Please check and try again.
                </p>
              )}
              {formData.referral_code && referralValid === null && !checkingReferral && (
                <p className="text-yellow-400 text-xs mt-1">
                  Enter at least 3 characters to validate referral code
                </p>
              )}
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-white font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                Address *
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-lg sm:rounded-xl text-white placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:border-cyan-500 transition-colors duration-300 resize-none"
                placeholder="Your complete address"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-600 text-sm sm:text-base text-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-sm sm:text-base text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              {referralValid ? `Proceed - ₹${finalAmount}` : `Proceed - ₹${tournament.joining_fee}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Payment Modal Component - COMPLETE UPDATED VERSION WITH REFERRAL
const PaymentModal = ({ tournament, enrollmentData, onClose, onSuccess }) => {
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Calculate final amount after referral discount
  const calculateFinalAmount = () => {
    const baseAmount = tournament.joining_fee
    
    // Apply 10% discount if referral code is valid
    if (enrollmentData.referral_code && enrollmentData.referralValid) {
      return baseAmount * 0.9 // 10% discount
    }
    
    return baseAmount
  }

  // Generate QR code data for UPI payment
  const generateQRCodeData = () => {
    const upiId = 'rushx@ptaxis'
    const amount = calculateFinalAmount()
    const name = 'RushX Esports'
    const note = `Tournament: ${tournament.title}${enrollmentData.referral_code ? ` | Ref: ${enrollmentData.referral_code}` : ''}`
    
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}`
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First, check if referral code is still valid
      let referralData = null
      if (enrollmentData.referral_code) {
        const { data: referralCheck, error: referralError } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('code', enrollmentData.referral_code.toUpperCase())
          .eq('is_active', true)
          .single()

        if (referralError) {
          console.warn('Referral code no longer valid:', referralError)
        } else {
          referralData = referralCheck
        }
      }

      // Calculate final amount with referral discount
      const finalAmount = calculateFinalAmount()
      const discountAmount = tournament.joining_fee - finalAmount

      // Create enrollment with pending status
      const { data: enrollment, error } = await supabase
        .from('tournament_enrollments')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          transaction_id: transactionId,
          payment_status: 'pending',
          in_game_nickname: enrollmentData.in_game_nickname,
          game_uid: enrollmentData.game_uid,
          mobile_number: enrollmentData.mobile_number,
          address: enrollmentData.address,
          referral_code: enrollmentData.referral_code || null,
          referral_discount: discountAmount > 0 ? discountAmount : null,
          final_amount_paid: finalAmount,
          team_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Process referral if code was provided and valid
      if (enrollmentData.referral_code && referralData) {
        await processReferral(
          enrollmentData.referral_code, 
          user.id, 
          tournament.id, 
          enrollment.id,
          finalAmount
        )
      }

      // Update tournament participant count
      await supabase
        .from('tournaments')
        .update({
          current_participants: tournament.current_participants + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', tournament.id)

      // Create notification for admin review
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Payment Verification Required',
          message: `New enrollment for ${tournament.title}. UTR: ${transactionId}${enrollmentData.referral_code ? ` | Referral: ${enrollmentData.referral_code}` : ''}`,
          type: 'warning',
          related_tournament_id: tournament.id,
          related_enrollment_id: enrollment.id
        })

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Enrollment Submitted Successfully',
          message: `Your enrollment for ${tournament.title} is under review. We will verify your payment and assign Team ID within 24 hours.`,
          type: 'info',
          related_tournament_id: tournament.id,
          related_enrollment_id: enrollment.id
        })

      // Notify referrer if referral was used
      if (enrollmentData.referral_code && referralData) {
        await supabase
          .from('notifications')
          .insert({
            user_id: referralData.user_id,
            title: 'Referral Used!',
            message: `Your referral code was used by ${enrollmentData.in_game_nickname} for ${tournament.title}. You'll earn ₹${(tournament.joining_fee * 0.1).toFixed(0)} after payment verification.`,
            type: 'success',
            related_tournament_id: tournament.id
          })
      }

      onSuccess()
      onClose()

      // Show success message
      alert('Enrollment submitted successfully! Your payment is under verification. You will receive your Team ID within 24 hours.')

    } catch (error) {
      console.error('Payment submission error:', error)
      alert('Error submitting enrollment: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Process referral code usage - FIXED VERSION
  const processReferral = async (referralCode, userId, tournamentId, enrollmentId, finalAmount) => {
    try {
      // Get referrer_id from referral_codes table
      const { data: codeData, error: codeError } = await supabase
        .from('referral_codes')
        .select('user_id, current_uses')
        .eq('code', referralCode.toUpperCase())
        .single()

      if (codeError) throw codeError

      // Record referral usage
      const referralUsagePayload = {
        referral_code: referralCode.toUpperCase(),
        used_by: userId,
        tournament_id: tournamentId,
        enrollment_id: enrollmentId,
        discount_applied: tournament.joining_fee - finalAmount,
        referrer_id: codeData.user_id,
        used_at: new Date().toISOString()
      }

      const { data: referralUsage, error: usageError } = await supabase
        .from('referral_usage')
        .insert(referralUsagePayload)
        .select()
        .single()

      if (usageError) throw usageError

      // Create pending referral earnings
      const commissionAmount = tournament.joining_fee * 0.1 // 10% commission
      
      const { error: earningsError } = await supabase
        .from('referral_earnings')
        .insert({
          referrer_id: codeData.user_id,
          referral_usage_id: referralUsage.id,
          amount: commissionAmount,
          status: 'pending',
          created_at: new Date().toISOString()
        })

      if (earningsError) throw earningsError

      // Update referral code usage count - FIXED: Use increment approach
      const newUsesCount = (codeData.current_uses || 0) + 1
      const { error: updateError } = await supabase
        .from('referral_codes')
        .update({
          current_uses: newUsesCount,
          updated_at: new Date().toISOString()
        })
        .eq('code', referralCode.toUpperCase())

      if (updateError) throw updateError

      console.log(`Referral code ${referralCode} processed successfully. New uses count: ${newUsesCount}`)

    } catch (error) {
      console.error('Error processing referral:', error)
      // Don't throw error here - we don't want referral processing to block enrollment
    }
  }

  const finalAmount = calculateFinalAmount()
  const discountAmount = tournament.joining_fee - finalAmount

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl mx-2 sm:mx-4 my-6 sm:my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-cyan-500/20 sticky top-0 bg-gray-900/95 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
          <p className="text-cyan-400 text-xs sm:text-sm mt-1 sm:mt-2">
            Pay entry fee to join {tournament.title}
          </p>
          
          {/* Referral Info */}
          {enrollmentData.referral_code && enrollmentData.referralValid && (
            <div className="flex items-center space-x-2 mt-2">
              <FaGift className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs">Referral code applied! 10% discount active.</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* QR Code Section */}
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="bg-white p-2 sm:p-5 rounded-2xl inline-block">
                <div className="w-40 h-40 sm:w-60 sm:h-60 bg-white flex items-center justify-center rounded-lg border-2 border-gray-300">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateQRCodeData())}`}
                    alt="UPI Payment QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <p className="text-gray-300 text-xs sm:text-sm">
                  Scan QR code to pay <span className="text-cyan-400 font-bold">₹{finalAmount}</span>
                </p>

                <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-2 sm:p-3">
                  <p className="text-cyan-400 font-mono text-xs sm:text-sm break-all">
                    UPI ID: rushx@ptaxis
                  </p>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-2 sm:p-3">
                  <div className="flex items-center justify-center space-x-2 mb-1">
                    <IoMdAlert className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    <h4 className="text-yellow-400 font-semibold text-xs sm:text-sm">Manual Payment</h4>
                  </div>
                  <p className="text-yellow-300 text-xs sm:text-sm">
                    If QR doesn't work, send ₹{finalAmount} to rushx@ptaxis
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Form */}
            <div className="space-y-3 sm:space-y-4">
              <form onSubmit={handlePaymentSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-white font-semibold mb-1 text-xs sm:text-sm">
                    UTR / UPI Ref ID (12-digit code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300 text-xs sm:text-sm"
                    placeholder="Enter UPI UTR / UPI Ref ID"
                    pattern="[A-Za-z0-9]{12}"
                    title="Please enter 12-digit UTR/UPI Reference ID"
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    After payment, you'll get a UTR / UPI Ref ID (12-digit code) in your UPI app.
                  </p>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
                  <h4 className="text-white font-semibold text-sm mb-3">Payment Summary</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Entry Fee:</span>
                      <span className="text-white font-semibold">₹{tournament.joining_fee}</span>
                    </div>

                    {enrollmentData.referral_code && enrollmentData.referralValid && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 text-sm">Referral Discount (10%):</span>
                          <span className="text-green-400 font-semibold">-₹{discountAmount}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-green-400">
                          <span>Using code: {enrollmentData.referral_code}</span>
                        </div>
                      </>
                    )}

                    <div className="border-t border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">Total Amount:</span>
                        <span className="text-cyan-400 font-bold text-lg">₹{finalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Benefits Info */}
                {enrollmentData.referral_code && enrollmentData.referralValid && (
                  <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaGift className="w-4 h-4 text-green-400" />
                      <h4 className="text-green-400 font-semibold text-sm">Referral Benefits Applied</h4>
                    </div>
                    <div className="text-green-300 text-xs space-y-1">
                      <p>• You saved ₹{discountAmount} with referral discount</p>
                      <p>• Referrer will earn 10% commission after payment verification</p>
                      <p>• Both parties benefit from this referral</p>
                    </div>
                  </div>
                )}

                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-2 sm:p-3">
                  <div className="flex items-start space-x-2 mb-1">
                    <IoMdAlert className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-yellow-400 font-semibold text-xs sm:text-sm mb-1">
                        Important Instructions
                      </h4>
                      <ul className="text-yellow-300 text-xs sm:text-sm space-y-1">
                        <li>• Payment must be done via UPI only</li>
                        <li>• Save UTR / UPI Ref ID (12-digit code) for verification</li>
                        <li>• Enrollment will be under review until payment verification</li>
                        <li>• Team ID will be assigned after successful verification</li>
                        <li>• No refunds after successful registration</li>
                        {enrollmentData.referral_code && (
                          <li>• Referral discount is applied only once per tournament</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors duration-300 text-xs sm:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 text-xs sm:text-sm"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : (
                      `Submit Enrollment - ₹${finalAmount}`
                    )}
                  </button>
                </div>
              </form>

              {/* Payment Steps */}
              <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700/50">
                <h4 className="text-white font-semibold text-xs sm:text-sm mb-2">Payment Steps:</h4>
                <ol className="text-gray-300 text-xs sm:text-sm space-y-1">
                  <li className="flex items-start space-x-2">
                    <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                    <span>Scan QR code with any UPI app</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                    <span>Pay ₹{finalAmount} to RushX Esports</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">3</span>
                    <span>Copy UTR / UPI Ref ID (12-digit code) from payment receipt</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="bg-cyan-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">4</span>
                    <span>Paste UTR / UPI Ref ID and submit form</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function
const getMaxTeamSize = (matchType) => {
  const sizes = {
    solo: 1,
    duo: 2,
    squad: 4
  }
  return sizes[matchType] || 1
}

// Helper function for team status
const getTeamStatus = (team) => {
  const maxSize = getMaxTeamSize(team.tournament?.match_type || 'solo')
  const currentSize = team.team_members.length
  
  if (currentSize >= maxSize) {
    return { status: 'full', color: 'text-red-400', bg: 'bg-red-500/20' }
  } else if (team.privacy === 'closed') {
    return { status: 'closed', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  } else {
    return { status: 'open', color: 'text-green-400', bg: 'bg-green-500/20' }
  }
}

export default TournamentDetail