import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaUsers, 
  FaTrophy, 
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
  FaHourglassHalf
} from 'react-icons/fa'
import { GiTrophyCup, GiPodium } from 'react-icons/gi'
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

    } catch (error) {
      console.error('Error fetching tournament:', error)
    } finally {
      setLoading(false)
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
              index === currentBanner ? 'opacity-100' : 'opacity-0'
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
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-4">
                  {getStatusBadge(tournament.status)}
                  {isTournamentFull && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Tournament Full
                    </span>
                  )}
                  <span className="text-cyan-400 font-semibold flex items-center space-x-2">
                    <FaGamepad className="w-4 h-4" />
                    <span>{tournament.game_name}</span>
                  </span>
                  <span className="text-gray-300 flex items-center space-x-2">
                    <FaUsers className="w-4 h-4" />
                    <span>{tournament.current_participants}/{tournament.max_participants} Players</span>
                  </span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {tournament.title}
                </h1>
                
                <p className="text-xl text-gray-300 max-w-3xl mb-6">
                  {tournament.description}
                </p>
              </div>

              <div className="flex space-x-4 mt-6 lg:mt-0">
                {enrollment ? (
                  getEnrollmentStatus()
                ) : (
                  <button
                    onClick={onJoinClick}
                    disabled={tournament.status !== 'upcoming' || isTournamentFull}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-lg"
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
const TournamentTabs = ({ activeTab, setActiveTab, tournament, enrollment, leaderboard }) => {
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <FaEye className="w-4 h-4" /> },
    { id: 'about', name: 'About', icon: <FaBookmark className="w-4 h-4" /> },
    { id: 'leaderboard', name: 'Leaderboard', icon: <GiPodium className="w-4 h-4" /> },
    { id: 'rules', name: 'Rules', icon: <FaLock className="w-4 h-4" /> },
  ]

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
        {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
        {activeTab === 'rules' && <RulesTab tournament={tournament} />}
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
            ₹{(tournament.prize_pool?.winner + tournament.prize_pool?.runnerUp).toLocaleString()}
          </p>
          <p className="text-gray-400 text-sm">Winner + Runner Up</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-xl p-6 border border-cyan-500/20">
        <h3 className="text-white font-bold text-xl mb-4">Tournament Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Match Structure</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• {tournament.match_type} matches</li>
              <li>• Best of 3 series</li>
              <li>• Single elimination bracket</li>
              <li>• Grand finals: Best of 5</li>
            </ul>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold mb-2">Requirements</h4>
            <ul className="text-gray-300 space-y-2">
              <li>• Stable internet connection</li>
              <li>• Discord for communication</li>
              <li>• Screen recording enabled</li>
              <li>• Fair play agreement</li>
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
const LeaderboardTab = ({ leaderboard }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-xl">Tournament Leaderboard</h3>
        <div className="flex items-center space-x-2 text-cyan-400">
          <GiPodium className="w-5 h-5" />
          <span>Live Rankings</span>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <GiPodium className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Leaderboard Data</h3>
            <p className="text-gray-400">Leaderboard will be updated once the tournament starts.</p>
          </div>
        ) : (
          leaderboard.map((player, index) => (
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
          ))
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

// Enroll Modal Component with Margins
const EnrollModal = ({ tournament, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    in_game_nickname: '',
    game_uid: '',
    mobile_number: '',
    address: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl mx-4 my-8">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Join Tournament</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <p className="text-cyan-400">Complete your registration for {tournament.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-semibold mb-2">In-Game Nickname *</label>
              <input
                type="text"
                required
                value={formData.in_game_nickname}
                onChange={(e) => setFormData(prev => ({...prev, in_game_nickname: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="Enter your in-game name"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Game UID *</label>
              <input
                type="text"
                required
                value={formData.game_uid}
                onChange={(e) => setFormData(prev => ({...prev, game_uid: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="Your game user ID"
              />
            </div>

            <div>
              <label className="block text-white font-semibold mb-2">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.mobile_number}
                onChange={(e) => setFormData(prev => ({...prev, mobile_number: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-white font-semibold mb-2">Address *</label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => setFormData(prev => ({...prev, address: e.target.value}))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300 resize-none"
                placeholder="Your complete address"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Proceed to Payment - ₹{tournament.joining_fee}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Payment Modal Component
const PaymentModal = ({ tournament, enrollmentData, onClose, onSuccess }) => {
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create enrollment with pending status
      const { data, error } = await supabase
        .from('tournament_enrollments')
        .insert({
          tournament_id: tournament.id,
          user_id: user.id,
          transaction_id: transactionId,
          payment_status: 'pending', // Set to pending for review
          in_game_nickname: enrollmentData.in_game_nickname,
          game_uid: enrollmentData.game_uid,
          mobile_number: enrollmentData.mobile_number,
          address: enrollmentData.address,
          team_id: null // Team ID will be assigned after verification
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for admin review
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Payment Verification Required',
          message: `New enrollment for ${tournament.title}. Transaction ID: ${transactionId}`,
          type: 'warning',
          related_tournament_id: tournament.id
        })

      // Create notification for user
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Enrollment Submitted',
          message: `Your enrollment for ${tournament.title} is under review. We will verify your payment and assign Team ID soon.`,
          type: 'info',
          related_tournament_id: tournament.id
        })

      onSuccess()
      onClose()

    } catch (error) {
      console.error('Payment submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl mx-4 my-8">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <p className="text-cyan-400">Pay entry fee to join {tournament.title}</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="text-center">
              <div className="bg-white p-6 rounded-2xl inline-block mb-4">
                <div className="w-64 h-64 bg-gray-200 flex items-center justify-center rounded-lg">
                  <FaQrcode className="w-32 h-32 text-gray-400" />
                  {/* Replace with actual QR code */}
                </div>
              </div>
              <p className="text-gray-300 mb-2">Scan QR code to pay ₹{tournament.joining_fee}</p>
              <div className="bg-cyan-500/20 border border-cyan-500/50 rounded-xl p-4">
                <p className="text-cyan-400 font-mono text-lg">UPI ID: rushx-esports@paytm</p>
              </div>
            </div>

            {/* Transaction Form */}
            <div>
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Transaction ID *</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                    placeholder="Enter UPI transaction ID"
                  />
                  <p className="text-gray-400 text-sm mt-1">
                    Find this in your UPI app after payment
                  </p>
                </div>

                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <IoMdAlert className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-yellow-400 font-semibold">Important Instructions</h4>
                  </div>
                  <ul className="text-yellow-300 text-sm space-y-1">
                    <li>• Payment must be done via UPI only</li>
                    <li>• Save transaction ID for verification</li>
                    <li>• Enrollment will be under review until payment verification</li>
                    <li>• Team ID will be assigned after successful verification</li>
                    <li>• No refunds after successful registration</li>
                  </ul>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Submit Enrollment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TournamentDetail