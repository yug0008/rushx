import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
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
  FaTwitter,
  FaSave,
  FaTimes,
  FaUpload,
  FaEnvelope
} from 'react-icons/fa'
import { GiTrophyCup, GiRank3 } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    username: '',
    gamer_tag: '',
    email: '',
    bio: '',
    favorite_game: '',
    discord: '',
    twitch: '',
    twitter: '',
    avatar_url: ''
  })
  const [userTournaments, setUserTournaments] = useState([])
  const [userStats, setUserStats] = useState({
    tournaments: 0,
    wins: 0,
    winRate: '0%',
    teamType: 'Solo'
  })

  // Load profile data
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadProfileData()
  }, [user, router])

  const loadProfileData = async () => {
    try {
      setLoading(true)
      
      // Load profile from users table
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      if (profile) {
        setProfileData({
          username: profile.username || '',
          gamer_tag: profile.gamer_tag || '',
          email: user.email || '',
          bio: profile.bio || 'No bio yet. Tell us about yourself!',
          favorite_game: profile.favorite_game || 'Not specified',
          discord: profile.discord || '',
          twitch: profile.twitch || '',
          twitter: profile.twitter || '',
          avatar_url: profile.avatar_url || ''
        })
      }

      await fetchUserTournaments()
      await calculateUserStats()

    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_enrollments')
        .select(`
          *,
          tournament:tournament_id (
            id,
            title,
            slug,
            game_name,
            status,
            joining_fee
          )
        `)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed') // Only show approved enrollments
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    }
  }

  const calculateUserStats = async () => {
    try {
      // Get completed tournaments count
      const { data: completedTournaments, error } = await supabase
        .from('tournament_enrollments')
        .select('id')
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')

      if (error) throw error

      // For now, using placeholder stats - you can implement real stats based on your data
      const tournamentsCount = completedTournaments?.length || 0
      const wins = Math.floor(tournamentsCount * 0.6) // Placeholder - replace with actual win calculation
      const winRate = tournamentsCount > 0 ? `${Math.round((wins / tournamentsCount) * 100)}%` : '0%'

      setUserStats({
        tournaments: tournamentsCount,
        wins: wins,
        winRate: winRate,
        teamType: 'Solo' // You can calculate this based on tournament match types
      })

    } catch (error) {
      console.error('Error calculating stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)

      const { error } = await supabase
        .from('users')
        .update({
          username: profileData.username,
          gamer_tag: profileData.gamer_tag,
          bio: profileData.bio,
          favorite_game: profileData.favorite_game,
          discord: profileData.discord,
          twitch: profileData.twitch,
          twitter: profileData.twitter,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) throw error

      setIsEditing(false)
      alert('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setSaving(true)

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars') // Make sure this bucket exists
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      setProfileData(prev => ({ ...prev, avatar_url: publicUrl }))

    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const stats = [
    { label: 'Tournaments', value: userStats.tournaments.toString(), icon: <GiTrophyCup className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Wins', value: userStats.wins.toString(), icon: <FaCrown className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Win Rate', value: userStats.winRate, icon: <GiRank3 className="w-5 h-5" />, color: 'text-cyan-400' },
    { label: 'Team', value: userStats.teamType, icon: <FaUsers className="w-5 h-5" />, color: 'text-purple-400' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

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
                {/* Avatar Section */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl border-4 border-gray-900 shadow-2xl flex items-center justify-center overflow-hidden">
                    {profileData.avatar_url ? (
                      <img 
                        src={profileData.avatar_url} 
                        alt={profileData.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUser className="w-12 h-12 text-white" />
                    )}
                  </div>
                  
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-600 transition-colors duration-300">
                      <FaUpload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="text-center lg:text-left">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Enter your username"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">Gamer Tag</label>
                        <input
                          type="text"
                          value={profileData.gamer_tag}
                          onChange={(e) => handleInputChange('gamer_tag', e.target.value)}
                          className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Enter your gamer tag"
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className="text-3xl font-bold text-white mb-2">
                        {profileData.username || 'Player'}
                      </h1>
                      <div className="flex items-center space-x-2 text-cyan-400 mb-2">
                        <FaGamepad className="w-4 h-4" />
                        <span className="font-semibold">{profileData.gamer_tag || 'No gamer tag'}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400 mb-2">
                        <FaEnvelope className="w-4 h-4" />
                        <span>{profileData.email}</span>
                      </div>
                      <p className="text-gray-400 max-w-md">{profileData.bio}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex space-x-3 mt-4 lg:mt-0">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-300"
                    >
                      <FaTimes className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 disabled:opacity-50"
                    >
                      <FaSave className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
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
                  </>
                )}
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
            {/* Bio Section (Editable) */}
            {isEditing && (
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <FaUser className="w-5 h-5 text-cyan-400" />
                  <span>About Me</span>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Favorite Game</label>
                    <input
                      type="text"
                      value={profileData.favorite_game}
                      onChange={(e) => handleInputChange('favorite_game', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="What's your favorite game?"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* User Tournaments */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <GiTrophyCup className="w-5 h-5 text-cyan-400" />
                <span>My Tournaments</span>
              </h2>
              <div className="space-y-4">
                {userTournaments.length > 0 ? (
                  userTournaments.map((enrollment) => (
                    <div 
                      key={enrollment.id} 
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-colors duration-300 cursor-pointer"
                      onClick={() => router.push(`/tournaments/${enrollment.tournament.slug}`)}
                    >
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{enrollment.tournament.title}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-cyan-400 text-sm">{enrollment.tournament.game_name}</span>
                          {enrollment.team_id && (
                            <span className="text-gray-400 text-sm">Team: {enrollment.team_id}</span>
                          )}
                          <span className="text-gray-400 text-sm">₹{enrollment.tournament.joining_fee}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          enrollment.tournament.status === 'completed' ? 'bg-gray-500 text-white' :
                          enrollment.tournament.status === 'ongoing' ? 'bg-green-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {enrollment.tournament.status}
                        </div>
                        <div className="text-green-400 text-sm mt-1 font-semibold">
                          Approved
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <GiTrophyCup className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 mb-4">You haven't joined any tournaments yet.</p>
                    <button
                      onClick={() => router.push('/tournaments')}
                      className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                    >
                      Browse Tournaments
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Social Links */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Social Links</h3>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Discord</label>
                    <input
                      type="text"
                      value={profileData.discord}
                      onChange={(e) => handleInputChange('discord', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Your Discord username"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Twitch</label>
                    <input
                      type="text"
                      value={profileData.twitch}
                      onChange={(e) => handleInputChange('twitch', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Your Twitch channel"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Twitter</label>
                    <input
                      type="text"
                      value={profileData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                      placeholder="Your Twitter handle"
                    />
                  </div>
                </div>
              ) : (
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
              )}
            </div>

            {/* Favorite Game */}
            {!isEditing && (
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Favorite Game</h3>
                <div className="flex items-center space-x-3">
                  <FaGamepad className="w-6 h-6 text-cyan-400" />
                  <span className="text-white font-semibold">{profileData.favorite_game}</span>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member since:</span>
                  <span className="text-white">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last updated:</span>
                  <span className="text-white">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage