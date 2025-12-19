import { useState, useEffect, useRef } from 'react' // Added useRef
import { useRouter } from 'next/router'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import {
  FaUsers,
  FaPlus,
  FaSearch,
  FaFilter,
  FaCrown,
  FaUserPlus,
  FaLock,
  FaUnlock,
  FaCalendarAlt,
  FaGamepad,
  FaTrophy,
  FaUserCheck,
  FaUserTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaEdit,
  FaTrash,
  FaShare,
  FaQrcode,
  FaCopy,
  FaDiscord,
  FaWhatsapp,
  FaTwitter,
  FaArrowLeft,
  FaUsers as FaTeam,
  FaShieldAlt,
  FaStar,
  FaMedal,
  FaAward,
  FaRegClock,
  FaRegCheckCircle,
  FaRegTimesCircle,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa'
import { GiTeamIdea, GiTeamDowngrade, GiTeamUpgrade } from 'react-icons/gi'

const TeamIndex = () => {
  const router = useRouter()
  const { tournamentid } = router.query
  const { user } = useAuth()
  
  const [tournament, setTournament] = useState(null)
  const [userEnrollment, setUserEnrollment] = useState(null)
  const [userTeam, setUserTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [filteredTeams, setFilteredTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)

  useEffect(() => {
    if (tournamentid && user) {
      fetchTournamentData()
    }
  }, [tournamentid, user])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)
      
      // Fetch tournament
      const { data: tournamentData, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentid)
        .single()

      if (error) throw error
      setTournament(tournamentData)

      // Fetch user enrollment
      const { data: enrollmentData } = await supabase
        .from('tournament_enrollments')
        .select('*')
        .eq('tournament_id', tournamentid)
        .eq('user_id', user.id)
        .eq('payment_status', 'completed')
        .single()

      setUserEnrollment(enrollmentData)

      if (enrollmentData) {
        // Fetch user's team
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
          .eq('tournament_id', tournamentid)
          .contains('team_members.user_id', [user.id])
          .single()

        setUserTeam(teamData)
      }

      // Fetch all teams for this tournament
      await fetchTeams(tournamentid)

    } catch (error) {
      console.error('Error fetching tournament data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async (tournamentId) => {
    try {
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
      setFilteredTeams(teamsData || [])
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
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
    if (!tournament) return { status: 'unknown', color: 'text-gray-400', bg: 'bg-gray-500/20' }
    
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

  const filterTeams = (tab = activeTab, search = searchTerm) => {
    let filtered = teams

    // Filter by tab
    if (tab === 'open') {
      filtered = filtered.filter(team => team.privacy === 'open')
    } else if (tab === 'closed') {
      filtered = filtered.filter(team => team.privacy === 'closed')
    } else if (tab === 'full') {
      filtered = filtered.filter(team => 
        team.team_members.length >= getMaxTeamSize(tournament.match_type)
      )
    } else if (tab === 'available') {
      filtered = filtered.filter(team => 
        team.team_members.length < getMaxTeamSize(tournament.match_type)
      )
    }

    // Filter by search
    if (search) {
      filtered = filtered.filter(team =>
        team.team_name.toLowerCase().includes(search.toLowerCase()) ||
        team.team_tag.toLowerCase().includes(search.toLowerCase()) ||
        (team.owner && team.owner.username.toLowerCase().includes(search.toLowerCase()))
      )
    }

    setFilteredTeams(filtered)
  }

  const handleCreateTeam = () => {
    if (!userEnrollment) {
      alert('You need to be enrolled in this tournament to create a team')
      return
    }
    
    if (userTeam) {
      alert('You are already in a team for this tournament')
      return
    }
    
    setShowCreateModal(true)
  }

  const handleJoinTeam = (team) => {
    if (!userEnrollment) {
      alert('You need to be enrolled in this tournament to join a team')
      return
    }
    
    if (userTeam) {
      alert('You are already in a team for this tournament')
      return
    }
    
    setSelectedTeam(team)
    setShowJoinModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Teams...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
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

  // Check if team feature is available for this tournament
  const isTeamTournament = ['duo', 'squad'].includes(tournament.match_type)
  const maxTeamSize = getMaxTeamSize(tournament.match_type)

  if (!isTeamTournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <GiTeamIdea className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Team Feature Not Available</h1>
            <p className="text-gray-400 text-lg mb-8">
              Team creation is only available for Duo and Squad tournaments.<br />
              This is a {tournament.match_type} tournament.
            </p>
            <button 
              onClick={() => router.push(`/tournaments/${tournament.slug}`)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
            >
              Back to Tournament
            </button>
          </div>
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
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="flex items-center space-x-4 mb-4 lg:mb-0">
            <button
              onClick={() => router.push(`/tournaments/${tournament.slug}`)}
              className="flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
            >
              <FaArrowLeft className="w-5 h-5" />
              <span>Back to Tournament</span>
            </button>
          </div>
          
          <div className="text-center lg:text-left mb-5">
            <h1 className="text-xl lg:text-3xl font-bold text-white mb-2">
              Teams - {tournament.title}
            </h1>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-gray-400">
              <div className="flex items-center space-x-2">
                <FaGamepad className="w-4 h-4" />
                <span>{tournament.match_type.toUpperCase()} • Max {maxTeamSize} players</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaUsers className="w-4 h-4" />
                <span>{teams.length} Teams Created</span>
              </div>
            </div>
          </div>

          {userEnrollment && !userTeam && (
            <button
              onClick={handleCreateTeam}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300"
            >
              <FaPlus className="w-5 h-5" />
              <span>Create Team</span>
            </button>
          )}
        </div>

        {/* User Team Card */}
        {userTeam && (
          <div className="mb-8">
            <YourTeamCard 
              team={userTeam} 
              tournament={tournament}
              maxTeamSize={maxTeamSize}
              onUpdate={fetchTournamentData}
            />
          </div>
        )}

        {/* Stats Cards */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-cyan-500/30 p-4 md:p-6 text-center">
    <GiTeamUpgrade className="w-6 h-6 md:w-8 md:h-8 text-cyan-400 mx-auto mb-2 md:mb-3" />
    <div className="text-lg md:text-2xl font-bold text-white">{teams.length}</div>
    <div className="text-xs md:text-sm text-gray-400">Total Teams</div>
  </div>
  
  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-green-500/30 p-4 md:p-6 text-center">
    <FaUsers className="w-6 h-6 md:w-8 md:h-8 text-green-400 mx-auto mb-2 md:mb-3" />
    <div className="text-lg md:text-2xl font-bold text-white">
      {teams.reduce((acc, team) => acc + team.team_members.length, 0)}
    </div>
    <div className="text-xs md:text-sm text-gray-400">Players in Teams</div>
  </div>
  
  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-yellow-500/30 p-4 md:p-6 text-center">
    <FaRegClock className="w-6 h-6 md:w-8 md:h-8 text-yellow-400 mx-auto mb-2 md:mb-3" />
    <div className="text-lg md:text-2xl font-bold text-white">
      {teams.filter(t => t.team_members.length < maxTeamSize).length}
    </div>
    <div className="text-xs md:text-sm text-gray-400">Teams with Spots</div>
  </div>
  
  <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-red-500/30 p-4 md:p-6 text-center">
    <GiTeamDowngrade className="w-6 h-6 md:w-8 md:h-8 text-red-400 mx-auto mb-2 md:mb-3" />
    <div className="text-lg md:text-2xl font-bold text-white">
      {teams.filter(t => t.team_members.length >= maxTeamSize).length}
    </div>
    <div className="text-xs md:text-sm text-gray-400">Full Teams</div>
  </div>
</div>
       {/* Search and Filter */}
<div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-cyan-500/30 p-4 md:p-6 mb-6 md:mb-8">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
    <div className="flex-1 max-w-md">
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 md:w-4 md:h-4" />
        <input
          type="text"
          placeholder="Search teams by name, tag, or owner..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            filterTeams(activeTab, e.target.value)
          }}
          className="w-full pl-8 md:pl-10 pr-4 py-2 md:py-3 bg-gray-800/50 border border-gray-700 rounded-lg md:rounded-xl text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
        />
      </div>
    </div>

    <div className="relative">
      {/* Horizontal scroll container for mobile */}
      <div className="flex md:flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 md:mx-0 md:px-0 md:pb-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {[
          { id: 'all', name: 'All Teams', icon: FaUsers },
          { id: 'open', name: 'Open', icon: FaUnlock },
          { id: 'closed', name: 'Closed', icon: FaLock },
          { id: 'available', name: 'Available', icon: FaUserPlus },
          { id: 'full', name: 'Full', icon: FaUserTimes }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                filterTeams(tab.id, searchTerm)
              }}
              className={`flex-shrink-0 flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              <Icon className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm whitespace-nowrap">{tab.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  </div>
</div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTeams.length > 0 ? (
            filteredTeams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                tournament={tournament}
                userEnrollment={userEnrollment}
                userTeam={userTeam}
                maxTeamSize={maxTeamSize}
                getTeamStatus={getTeamStatus}
                onJoin={handleJoinTeam}
                onView={() => router.push(`/tournaments/${tournamentid}/team/${team.id}`)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <GiTeamIdea className="w-24 h-24 text-gray-400 mx-auto mb-4 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-2">No Teams Found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || activeTab !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a team for this tournament!'}
              </p>
              {!searchTerm && activeTab === 'all' && userEnrollment && !userTeam && (
                <button
                  onClick={handleCreateTeam}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                >
                  Create First Team
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateTeamModal
          tournament={tournament}
          userEnrollment={userEnrollment}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            fetchTournamentData()
          }}
        />
      )}

      {showJoinModal && selectedTeam && (
        <JoinTeamModal
          team={selectedTeam}
          tournament={tournament}
          userEnrollment={userEnrollment}
          onClose={() => {
            setShowJoinModal(false)
            setSelectedTeam(null)
          }}
          onSuccess={() => {
            setShowJoinModal(false)
            setSelectedTeam(null)
            fetchTournamentData()
          }}
          getMaxTeamSize={getMaxTeamSize}
        />
      )}
    </div>
  )
}

// Your Team Card Component
const YourTeamCard = ({ team, tournament, maxTeamSize, onUpdate }) => {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const isOwner = team.owner_id === team.team_members.find(m => m.user_id === team.owner_id)?.user_id

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id)
        .eq('user_id', team.team_members.find(m => m.user_id === team.owner_id)?.user_id)

      if (error) throw error

      // If owner leaves and there are other members, transfer ownership
      if (isOwner && team.team_members.length > 1) {
        const newOwner = team.team_members.find(m => m.user_id !== team.owner_id)
        if (newOwner) {
          await supabase
            .from('tournament_teams')
            .update({ owner_id: newOwner.user_id })
            .eq('id', team.id)
        }
      }

      onUpdate()
    } catch (error) {
      console.error('Error leaving team:', error)
      alert('Error leaving team: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl border border-cyan-500/30 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
          {team.team_logo ? (
            <img 
              src={team.team_logo} 
              alt={team.team_name}
              className="w-16 h-16 rounded-xl border-2 border-cyan-500/50"
            />
          ) : (
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl border-2 border-cyan-500/50 flex items-center justify-center">
              <FaUsers className="w-8 h-8 text-white" />
            </div>
          )}
          
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-white">{team.team_name}</h2>
              <span className="text-cyan-400 font-mono bg-cyan-500/20 px-2 py-1 rounded-lg text-sm">
                {team.team_tag}
              </span>
              {isOwner && (
                <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg text-sm">
                  <FaCrown className="w-3 h-3" />
                  <span>Owner</span>
                </span>
              )}
            </div>
            <p className="text-gray-300">{team.team_description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
          >
            <FaUserPlus className="w-4 h-4" />
            <span>Invite Players</span>
          </button>
          
          <button
            onClick={() => window.open(`/tournaments/${tournament.id}/team/${team.id}`, '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors duration-300"
          >
            <FaEye className="w-4 h-4" />
            <span>View Team</span>
          </button>
          
          <button
            onClick={handleLeaveTeam}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300 disabled:opacity-50"
          >
            <FaSignOutAlt className="w-4 h-4" />
            <span>{loading ? 'Leaving...' : 'Leave Team'}</span>
          </button>
        </div>
      </div>

      {/* Team Members */}
      <div>
        <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
          <FaUsers className="w-4 h-4 text-cyan-400" />
          <span>Team Members ({team.team_members.length}/{maxTeamSize})</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {team.team_members.map((member) => (
            <div
              key={member.id}
              className={`bg-gray-800/50 rounded-xl p-4 border ${
                member.user_id === team.owner_id
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                {member.user.avatar_url ? (
                  <img 
                    src={member.user.avatar_url} 
                    alt={member.user.username}
                    className="w-10 h-10 rounded-lg"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FaUser className="w-5 h-5 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-semibold text-sm">
                      {member.user.username}
                    </span>
                    {member.user_id === team.owner_id && (
                      <FaCrown className="w-3 h-3 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-cyan-400 text-xs">
                    {member.user.gamer_tag}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty slots */}
          {Array.from({ length: maxTeamSize - team.team_members.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-gray-800/30 rounded-xl p-4 border border-dashed border-gray-600/50 flex items-center justify-center"
            >
              <div className="text-center">
                <FaUserPlus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <span className="text-gray-400 text-sm">Empty Slot</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteModal
          team={team}
          tournament={tournament}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

// Team Card Component
const TeamCard = ({ team, tournament, userEnrollment, userTeam, maxTeamSize, getTeamStatus, onJoin, onView }) => {
  const teamStatus = getTeamStatus(team)
  const isFull = team.team_members.length >= maxTeamSize
  const canJoin = userEnrollment && !userTeam && !isFull && team.privacy === 'open'

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-xl md:rounded-2xl border border-cyan-500/30 p-4 md:p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
  {/* Team Header */}
  <div className="flex items-start justify-between mb-3 md:mb-4">
    <div className="flex items-center space-x-2 md:space-x-3">
      {team.team_logo ? (
        <img 
          src={team.team_logo} 
          alt={team.team_name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg border border-cyan-500/30"
        />
      ) : (
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg border border-cyan-500/30 flex items-center justify-center">
          <FaUsers className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      )}
      
      <div className="min-w-0 flex-1">
        <h3 className="text-white font-bold text-sm md:text-lg truncate">{team.team_name}</h3>
        <div className="flex flex-wrap gap-1 md:gap-2 mt-0.5 md:mt-1">
          <span className="text-cyan-400 font-mono text-xs md:text-sm bg-cyan-500/20 px-1.5 md:px-2 py-0.5 md:py-1 rounded">
            {team.team_tag}
          </span>
          <span className={`text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded-full ${teamStatus.bg} ${teamStatus.color} whitespace-nowrap`}>
            {teamStatus.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <div className="text-right ml-2">
      <div className="flex items-center justify-end space-x-1 text-yellow-400 text-xs md:text-sm mb-0.5 md:mb-1">
        <FaCrown className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span className="truncate max-w-[80px] md:max-w-none">{team.owner?.username || 'Unknown'}</span>
      </div>
      <div className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
        {team.team_members.length}/{maxTeamSize} members
      </div>
    </div>
  </div>

  {/* Team Description */}
  {team.team_description && (
    <p className="text-gray-300 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
      {team.team_description}
    </p>
  )}

  {/* Team Members Preview */}
  <div className="flex items-center space-x-1 md:space-x-2 mb-3 md:mb-4">
    {team.team_members.slice(0, 3).map((member) => (
      <div key={member.id} className="flex items-center space-x-1">
        {member.user.avatar_url ? (
          <img 
            src={member.user.avatar_url} 
            alt={member.user.username}
            className="w-5 h-5 md:w-6 md:h-6 rounded"
          />
        ) : (
          <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-cyan-500 to-purple-600 rounded flex items-center justify-center">
            <FaUser className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
          </div>
        )}
      </div>
    ))}
    {team.team_members.length > 3 && (
      <span className="text-gray-400 text-xs md:text-sm whitespace-nowrap">
        +{team.team_members.length - 3} more
      </span>
    )}
  </div>

  {/* Action Buttons */}
  <div className="flex space-x-1.5 md:space-x-2">
    <button
      onClick={onView}
      className="flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 bg-gray-800/50 border border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700/50 hover:text-white transition-colors duration-300 text-xs md:text-sm"
    >
      <FaEye className="w-2.5 h-2.5 md:w-3 md:h-3" />
      <span>View</span>
    </button>
    
    {canJoin && (
      <button
        onClick={() => onJoin(team)}
        className="flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 text-xs md:text-sm"
      >
        <FaUserPlus className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span>Join</span>
      </button>
    )}
    
    {isFull && (
      <button
        disabled
        className="flex-1 flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg cursor-not-allowed text-xs md:text-sm"
      >
        <FaUserTimes className="w-2.5 h-2.5 md:w-3 md:h-3" />
        <span>Full</span>
      </button>
    )}
  </div>
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
const JoinTeamModal = ({ team, tournament, userEnrollment, onClose, onSuccess, getMaxTeamSize }) => {
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
          user_id: userEnrollment.user_id,
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
            message: `${userEnrollment.in_game_nickname} wants to join your team "${team.team_name}"`,
            type: 'info',
            related_team_id: team.id,
            related_user_id: userEnrollment.user_id
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
              Owned by {team.owner?.username || 'Unknown'}
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
                {userEnrollment.in_game_nickname}
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

// Invite Modal Component
const InviteModal = ({ team, tournament, onClose }) => {
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Generate invite code (you can implement your own logic)
    setInviteCode(`${team.team_tag}-${tournament.id.slice(0, 8)}`)
  }, [team, tournament])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = {
    whatsapp: `https://wa.me/?text=Join my team "${team.team_name}" for ${tournament.title}! Use invite code: ${inviteCode}`,
    discord: `Join my team "${team.team_name}" for ${tournament.title}! Use invite code: ${inviteCode}`,
    twitter: `Join my team "${team.team_name}" for ${tournament.title}! Use invite code: ${inviteCode}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-md">
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Invite Players</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <FaTimesCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <FaShare className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-white font-bold text-lg mb-2">Invite to {team.team_name}</h3>
            <p className="text-gray-400">
              Share this code with players to join your team
            </p>
          </div>

          {/* Invite Code */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <label className="block text-gray-400 text-sm font-semibold mb-2">Invite Code</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                readOnly
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white font-mono text-center"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors duration-300"
              >
                {copied ? <FaCheckCircle className="w-5 h-5" /> : <FaCopy className="w-5 h-5" />}
              </button>
            </div>
            {copied && (
              <p className="text-green-400 text-sm mt-2 text-center">Copied to clipboard!</p>
            )}
          </div>

          {/* Quick Share */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-center mb-4">Quick Share</h4>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 p-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-xl hover:bg-green-500/30 transition-colors duration-300"
              >
                <FaWhatsapp className="w-6 h-6" />
                <span className="text-xs">WhatsApp</span>
              </a>
              
              <button
                onClick={() => navigator.clipboard.writeText(shareLinks.discord)}
                className="flex flex-col items-center space-y-2 p-3 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors duration-300"
              >
                <FaDiscord className="w-6 h-6" />
                <span className="text-xs">Discord</span>
              </button>
              
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareLinks.twitter)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 p-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-500/30 transition-colors duration-300"
              >
                <FaTwitter className="w-6 h-6" />
                <span className="text-xs">Twitter</span>
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 mt-6">
            <h4 className="text-cyan-400 font-semibold text-sm mb-2">How to Join:</h4>
            <ol className="text-cyan-300 text-sm space-y-1">
              <li>1. Share the invite code with players</li>
              <li>2. They must be enrolled in this tournament</li>
              <li>3. They can use the code to join your team</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeamIndex