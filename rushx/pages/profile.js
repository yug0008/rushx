import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase' // make sure you have supabase client
import { 
  FaUser, 
  FaGamepad, 
  FaTrophy, 
  FaUsers, 
  FaCalendarAlt,
  FaCrown,
  FaEdit,
  FaSignOutAlt,
  FaTwitch,
  FaDiscord,
  FaTwitter
} from 'react-icons/fa'
import { GiTrophyCup, GiRank3 } from 'react-icons/gi'

const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    gamerTag: '',
    bio: '',
    favoriteGame: '',
    discord: '',
    twitch: '',
    twitter: ''
  })
  const [userTournaments, setUserTournaments] = useState([])

  // Load profile data
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    setProfileData({
      username: user.user_metadata?.username || '',
      gamerTag: user.user_metadata?.gamer_tag || '',
      bio: user.user_metadata?.bio || 'No bio yet. Tell us about yourself!',
      favoriteGame: user.user_metadata?.favorite_game || 'Not specified',
      discord: user.user_metadata?.discord || '',
      twitch: user.user_metadata?.twitch || '',
      twitter: user.user_metadata?.twitter || ''
    })
  }, [user, router])

  // Load user tournaments
  useEffect(() => {
    if (user) fetchUserTournaments()
  }, [user])

  const fetchUserTournaments = async () => {
    const { data } = await supabase
      .from('tournament_enrollments')
      .select(`
        *,
        tournament:tournament_id (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setUserTournaments(data || [])
  }

  if (!user) return null

  const stats = [
    { label: 'Tournaments', value: '12', icon: <GiTrophyCup className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Wins', value: '8', icon: <FaCrown className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Win Rate', value: '67%', icon: <GiRank3 className="w-5 h-5" />, color: 'text-cyan-400' },
    { label: 'Team', value: 'Solo', icon: <FaUsers className="w-5 h-5" />, color: 'text-purple-400' }
  ]

  const recentMatches = [
    { game: 'Valorant', result: 'Win', score: '13-8', date: '2 hours ago' },
    { game: 'CS2', result: 'Loss', score: '12-16', date: '1 day ago' },
    { game: 'Valorant', result: 'Win', score: '13-5', date: '2 days ago' }
  ]

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-16">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-cyan-500/20 to-purple-600/20"></div>
          <div className="px-8 pb-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between -mt-16 mb-6">
              <div className="flex flex-col lg:flex-row items-center lg:items-end space-y-4 lg:space-y-0 lg:space-x-6">
                <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl border-4 border-gray-900 shadow-2xl flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-white" />
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profileData.username || 'Player'}
                  </h1>
                  <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                    <FaGamepad className="w-4 h-4" />
                    <span className="font-semibold">{profileData.gamerTag || 'No gamer tag'}</span>
                  </div>
                  <p className="text-gray-400 max-w-md">{profileData.bio}</p>
                </div>
              </div>
              <div className="flex space-x-3 mt-4 lg:mt-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
                >
                  <FaEdit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                >
                  <FaSignOutAlt className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700/50">
                  <div className={`flex justify-center mb-2 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <FaCalendarAlt className="w-5 h-5 text-cyan-400" />
                <span>Recent Matches</span>
              </h2>
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        match.result === 'Win' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <div className="text-white font-semibold">{match.game}</div>
                        <div className="text-gray-400 text-sm">{match.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        match.result === 'Win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {match.result}
                      </div>
                      <div className="text-gray-400 text-sm">{match.score}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Tournaments */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <GiTrophyCup className="w-5 h-5 text-cyan-400" />
                <span>My Tournaments</span>
              </h2>
              <div className="space-y-4">
                {userTournaments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                    <div>
                      <h3 className="text-white font-semibold">{enrollment.tournament.title}</h3>
                      <p className="text-gray-400 text-sm">Team ID: {enrollment.team_id}</p>
                    </div>
                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        enrollment.tournament.status === 'completed' ? 'bg-gray-500 text-white' :
                        enrollment.tournament.status === 'ongoing' ? 'bg-green-500 text-white' :
                        'bg-yellow-500 text-white'
                      }`}>
                        {enrollment.tournament.status}
                      </div>
                      {enrollment.room_details && (
                        <p className="text-cyan-400 text-sm mt-1">Room: {enrollment.room_details.room_id}</p>
                      )}
                    </div>
                  </div>
                ))}
                {userTournaments.length === 0 && (
                  <p className="text-gray-400 text-sm">You haven't joined any tournaments yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Social Links */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-400">
                  <FaDiscord className="w-5 h-5" />
                  <span>{profileData.discord || 'Not connected'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <FaTwitch className="w-5 h-5" />
                  <span>{profileData.twitch || 'Not connected'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                  <FaTwitter className="w-5 h-5" />
                  <span>{profileData.twitter || 'Not connected'}</span>
                </div>
              </div>
            </div>

            {/* Favorite Game */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Favorite Game</h3>
              <div className="flex items-center space-x-3">
                <FaGamepad className="w-6 h-6 text-cyan-400" />
                <span className="text-white font-semibold">{profileData.favoriteGame}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
