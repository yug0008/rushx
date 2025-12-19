import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useRef } from "react";

import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import {
  FaUsers,
  FaCrown,
  FaUserPlus,
  FaUserTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEdit,
  FaTrash,
  FaShare,
  FaArrowLeft,
  FaTrophy,
  FaGamepad,
  FaCalendarAlt,
  FaDiscord,
  FaWhatsapp,
  FaCopy,
  FaQrcode,
  FaEye,
  FaRegEye,
  FaShieldAlt,
  FaAward,
  FaMedal,
  FaStar,
  FaRegStar,
  FaCog,
  FaSignOutAlt,
  FaExclamationTriangle
} from 'react-icons/fa'
import { GiTeamIdea, GiTeamUpgrade, GiRank3 } from 'react-icons/gi'

const TeamDetail = () => {
  const router = useRouter()
  const { tournamentid, teamid } = router.query
  const { user } = useAuth()
  
  const [team, setTeam] = useState(null)
  const [tournament, setTournament] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [pendingRequests, setPendingRequests] = useState([])

  useEffect(() => {
    if (tournamentid && teamid && user) {
      fetchTeamData()
    }
  }, [tournamentid, teamid, user])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      
      // Fetch team with members and owner details
      const { data: teamData, error } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          team_members:team_members(
            *,
            user:users(
              username,
              gamer_tag,
              avatar_url,
              discord,
              twitch,
              twitter
            )
          ),
          owner:users(
            username,
            gamer_tag,
            avatar_url,
            discord,
            twitch,
            twitter
          ),
          tournament:tournament_id(*)
        `)
        .eq('id', teamid)
        .single()

      if (error) throw error
      setTeam(teamData)
      setTournament(teamData.tournament)

      // Fetch pending join requests if user is owner
      if (teamData.owner_id === user.id) {
        await fetchPendingRequests(teamid)
      }

    } catch (error) {
      console.error('Error fetching team data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPendingRequests = async (teamId) => {
    try {
      const { data: requests, error } = await supabase
        .from('team_members')
        .select(`
          *,
          user:users(
            username,
            gamer_tag,
            avatar_url
          )
        `)
        .eq('team_id', teamId)
        .eq('status', 'pending')

      if (error) throw error
      setPendingRequests(requests || [])
    } catch (error) {
      console.error('Error fetching pending requests:', error)
    }
  }

  const handleAcceptRequest = async (requestId, userId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (error) throw error

      // Create notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Team Request Accepted',
          message: `Your request to join ${team.team_name} has been accepted!`,
          type: 'success',
          related_team_id: team.id
        })

      // Refresh data
      fetchTeamData()
      fetchPendingRequests(team.id)

    } catch (error) {
      console.error('Error accepting request:', error)
      alert('Error accepting request: ' + error.message)
    }
  }

  const handleRejectRequest = async (requestId, userId) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      // Create notification for the user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Team Request Rejected',
          message: `Your request to join ${team.team_name} has been rejected.`,
          type: 'warning',
          related_team_id: team.id
        })

      // Refresh data
      fetchPendingRequests(team.id)

    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Error rejecting request: ' + error.message)
    }
  }

  const handleRemoveMember = async (memberId, userId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      // Create notification for the removed user
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Removed from Team',
          message: `You have been removed from ${team.team_name}`,
          type: 'warning',
          related_team_id: team.id
        })

      // Refresh data
      fetchTeamData()

    } catch (error) {
      console.error('Error removing member:', error)
      alert('Error removing member: ' + error.message)
    }
  }

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id)
        .eq('user_id', user.id)

      if (error) throw error

      // If owner leaves and there are other members, transfer ownership
      if (team.owner_id === user.id && team.team_members.length > 1) {
        const newOwner = team.team_members.find(m => m.user_id !== user.id)
        if (newOwner) {
          await supabase
            .from('tournament_teams')
            .update({ owner_id: newOwner.user_id })
            .eq('id', team.id)
        }
      }

      router.push(`/tournaments/${tournamentid}/team`)

    } catch (error) {
      console.error('Error leaving team:', error)
      alert('Error leaving team: ' + error.message)
    }
  }

  const isOwner = team?.owner_id === user?.id
  const currentUserMember = team?.team_members?.find(m => m.user_id === user?.id)
  const maxTeamSize = getMaxTeamSize(tournament?.match_type)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Team...</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <GiTeamIdea className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Team Not Found</h2>
          <button 
            onClick={() => router.push(`/tournaments/${tournamentid}/team`)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
          >
            Back to Teams
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
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
      {/* Header */}
<div className="flex flex-wrap items-center justify-between mb-6 gap-2 sm:gap-4">
  {/* Back Button */}
  <button
    onClick={() => router.push(`/${tournamentid}/team`)}
    className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors duration-300 text-sm sm:text-base"
  >
    <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
    <span>Back to Teams</span>
  </button>

  {/* Action Buttons */}
  {currentUserMember && (
    <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end">
      {isOwner && (
        <button
          onClick={() => setShowEditModal(true)}
          className="flex items-center space-x-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-md hover:bg-cyan-500/30 transition-all duration-300 text-xs sm:text-sm"
        >
          <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Edit Team</span>
        </button>
      )}

      <button
        onClick={() => setShowInviteModal(true)}
        className="flex items-center space-x-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-md hover:bg-green-500/30 transition-all duration-300 text-xs sm:text-sm"
      >
        <FaShare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Invite</span>
      </button>

      <button
        onClick={handleLeaveTeam}
        className="flex items-center space-x-1 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-md hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-sm"
      >
        <FaSignOutAlt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>Leave</span>
      </button>
    </div>
  )}
</div>



        {/* Team Header */}
<div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
    {/* Left Section */}
    <div className="flex items-center space-x-4 sm:space-x-6 mb-4 lg:mb-0">
      {team.team_logo ? (
        <img 
          src={team.team_logo} 
          alt={team.team_name}
          className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl border-2 border-cyan-500/50"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl border-2 border-cyan-500/50 flex items-center justify-center">
          <FaUsers className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
        </div>
      )}
      
      <div>
        {/* Team Name & Tag */}
        <div className="flex items-center flex-wrap space-x-2 sm:space-x-4 mb-2 sm:mb-3">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white">{team.team_name}</h1>
          <span className="text-cyan-400 font-mono text-sm sm:text-base lg:text-xl bg-cyan-500/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg">
            {team.team_tag}
          </span>
        </div>
        
        {/* Info Line */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 text-xs sm:text-sm lg:text-base">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <FaCrown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            <span>Owned by {team.owner.username}</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <FaGamepad className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
            <span>{tournament.match_type.toUpperCase()} • Max {maxTeamSize} players</span>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <FaShieldAlt className={`w-3 h-3 sm:w-4 sm:h-4 ${
              team.privacy === 'open' ? 'text-green-400' : 'text-yellow-400'
            }`} />
            <span>{team.privacy === 'open' ? 'Open Team' : 'Closed Team'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Right Section */}
    <div className="text-center lg:text-right mt-2 sm:mt-0">
      <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">
        {team.team_members.length}/{maxTeamSize} Members
      </div>
      <div className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${
        team.team_members.length >= maxTeamSize
          ? 'bg-red-500/20 text-red-400 border border-red-500/50'
          : 'bg-green-500/20 text-green-400 border border-green-500/50'
      }`}>
        {team.team_members.length >= maxTeamSize ? 'Team Full' : 'Spots Available'}
      </div>
    </div>
  </div>

  {/* Description */}
  {team.team_description && (
    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
      <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
        {team.team_description}
      </p>
    </div>
  )}
</div>

        {/* Tabs */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden mb-8">
          <div className="border-b border-cyan-500/20">
            <div className="flex overflow-x-auto">
              {[
                { id: 'overview', name: 'Overview', icon: FaEye },
                { id: 'members', name: 'Members', icon: FaUsers },
                
                ...(isOwner ? [{ id: 'requests', name: 'Requests', icon: FaUserPlus }] : [])
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-semibold transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-cyan-400 border-b-2 border-cyan-400'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                    {tab.id === 'requests' && pendingRequests.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingRequests.length}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <OverviewTab team={team} tournament={tournament} />
            )}
            
            {activeTab === 'members' && (
              <MembersTab 
                team={team} 
                isOwner={isOwner}
                onRemoveMember={handleRemoveMember}
                maxTeamSize={maxTeamSize}
              />
            )}
            
            
            {activeTab === 'requests' && isOwner && (
              <RequestsTab 
                requests={pendingRequests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showInviteModal && (
        <InviteModal 
          team={team}
          tournament={tournament}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {showEditModal && (
        <EditTeamModal
          team={team}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchTeamData}
        />
      )}
    </div>
  )
}

// Tab Components
const OverviewTab = ({ team, tournament }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700/50">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <FaTrophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
            <h3 className="text-white font-semibold text-sm md:text-base">Tournament</h3>
          </div>
          <p className="text-lg md:text-2xl font-bold text-white truncate">{tournament.title}</p>
          <p className="text-gray-400 text-xs md:text-sm truncate">{tournament.game_name}</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700/50">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <FaGamepad className="w-5 h-5 md:w-6 md:h-6 text-cyan-400" />
            <h3 className="text-white font-semibold text-sm md:text-base">Match Type</h3>
          </div>
          <p className="text-lg md:text-2xl font-bold text-white capitalize">{tournament.match_type}</p>
          <p className="text-gray-400 text-xs md:text-sm">Max {getMaxTeamSize(tournament.match_type)} players</p>
        </div>

        <div className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-6 border border-gray-700/50">
          <div className="flex items-center space-x-2 md:space-x-3 mb-3 md:mb-4">
            <FaShieldAlt className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
            <h3 className="text-white font-semibold text-sm md:text-base">Team Status</h3>
          </div>
          <p className="text-lg md:text-2xl font-bold text-white capitalize">{team.privacy}</p>
          <p className="text-gray-400 text-xs md:text-sm">
            {team.privacy === 'open' ? 'Anyone can join' : 'Approval required'}
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-lg md:rounded-xl p-4 md:p-6 border border-cyan-500/20">
        <h3 className="text-white font-bold text-lg md:text-xl mb-3 md:mb-4">Team Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <h4 className="text-cyan-400 font-semibold text-sm md:text-base mb-2 md:mb-3">Created</h4>
            <p className="text-gray-300 text-sm">
              {new Date(team.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              <span className="block md:inline"> at </span>
              {new Date(team.created_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
          <div>
            <h4 className="text-cyan-400 font-semibold text-sm md:text-base mb-2 md:mb-3">Last Updated</h4>
            <p className="text-gray-300 text-sm">
              {new Date(team.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              <span className="block md:inline"> at </span>
              {new Date(team.updated_at).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const MembersTab = ({ team, isOwner, onRemoveMember, maxTeamSize }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.team_members.map((member) => (
          <div
            key={member.id}
            className={`bg-gray-800/50 rounded-xl p-6 border ${
              member.user_id === team.owner_id
                ? 'border-yellow-500/50 bg-yellow-500/10'
                : 'border-gray-700/50'
            }`}
          >
            <div className="flex items-center space-x-4 mb-4">
              {member.user.avatar_url ? (
                <img 
                  src={member.user.avatar_url} 
                  alt={member.user.username}
                  className="w-16 h-16 rounded-xl"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FaUsers className="w-8 h-8 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-white font-bold text-lg">{member.user.username}</h3>
                  {member.user_id === team.owner_id && (
                    <FaCrown className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <p className="text-cyan-400 text-sm">{member.user.gamer_tag}</p>
                <p className="text-gray-400 text-sm capitalize">{member.role}</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-2 mb-4">
              {member.user.discord && (
                <a
                  href={`https://discord.com/users/${member.user.discord}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-colors duration-300"
                >
                  <FaDiscord className="w-4 h-4" />
                </a>
              )}
              {member.user.twitch && (
                <a
                  href={`https://twitch.tv/${member.user.twitch}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-purple-500/20 rounded-lg text-purple-400 hover:bg-purple-500/30 transition-colors duration-300"
                >
                  <FaGamepad className="w-4 h-4" />
                </a>
              )}
              {member.user.twitter && (
                <a
                  href={`https://twitter.com/${member.user.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors duration-300"
                >
                  <FaTwitter className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Actions */}
            {isOwner && member.user_id !== team.owner_id && (
              <button
                onClick={() => onRemoveMember(member.id, member.user_id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
              >
                <FaUserTimes className="w-4 h-4" />
                <span>Remove</span>
              </button>
            )}
          </div>
        ))}
        
        {/* Empty slots */}
        {Array.from({ length: maxTeamSize - team.team_members.length }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="bg-gray-800/30 rounded-xl p-6 border border-dashed border-gray-600/50 flex flex-col items-center justify-center text-center"
          >
            <FaUserPlus className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-gray-400 font-semibold mb-1">Empty Slot</h3>
            <p className="text-gray-500 text-sm">Waiting for player to join</p>
          </div>
        ))}
      </div>
    </div>
  )
}


const RequestsTab = ({ requests, onAccept, onReject }) => {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FaUserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-2xl font-bold text-white mb-2">No Pending Requests</h3>
        <p className="text-gray-400">You don't have any pending join requests.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-6">
        <div className="flex items-center space-x-2 text-yellow-400 mb-2">
          <FaExclamationTriangle className="w-5 h-5" />
          <span className="font-semibold">Pending Join Requests</span>
        </div>
        <p className="text-yellow-300 text-sm">
          These players want to join your team. Review and accept or reject their requests.
        </p>
      </div>

      {requests.map((request) => (
        <div
          key={request.id}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {request.user.avatar_url ? (
                <img 
                  src={request.user.avatar_url} 
                  alt={request.user.username}
                  className="w-12 h-12 rounded-lg"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaUser className="w-6 h-6 text-white" />
                </div>
              )}
              
              <div>
                <h3 className="text-white font-bold">{request.user.username}</h3>
                <p className="text-cyan-400 text-sm">{request.user.gamer_tag}</p>
                <p className="text-gray-400 text-sm">
                  Requested {new Date(request.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => onAccept(request.id, request.user_id)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
              >
                <FaCheckCircle className="w-4 h-4" />
                <span>Accept</span>
              </button>
              
              <button
                onClick={() => onReject(request.id, request.user_id)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
              >
                <FaTimesCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Edit Team Modal Component
const EditTeamModal = ({ team, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    team_name: team.team_name,
    team_tag: team.team_tag,
    team_description: team.team_description,
    team_logo: team.team_logo,
    privacy: team.privacy
  })
  const [logoPreview, setLogoPreview] = useState(team.team_logo)
  const fileInputRef = useRef(null)

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
      const fileName = `${team.id}_${Date.now()}.${fileExt}`
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
      const { error } = await supabase
        .from('tournament_teams')
        .update({
          team_name: formData.team_name,
          team_tag: formData.team_tag.toUpperCase(),
          team_description: formData.team_description,
          team_logo: formData.team_logo,
          privacy: formData.privacy,
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id)

      if (error) throw error

      onSuccess()
      onClose()
      alert('Team updated successfully!')
    } catch (error) {
      console.error('Error updating team:', error)
      alert('Error updating team: ' + error.message)
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
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white">Edit Team</h2>
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
            <label className="block text-white font-semibold text-xs sm:text-sm md:text-base">Team Logo</label>
            
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
                4 characters max
              </p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">
              Team Description
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
              Privacy
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
                  <span>Saving...</span>
                </span>
              ) : (
                'Update Team'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// Invite Modal Component (reuse from previous implementation)
const InviteModal = ({ team, tournament, onClose }) => {
  const [inviteCode, setInviteCode] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setInviteCode(`${team.team_tag}-${tournament.id.slice(0, 8)}`)
  }, [team, tournament])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
          </div>

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

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
            <h4 className="text-cyan-400 font-semibold text-sm mb-2">How to Join:</h4>
            <ol className="text-cyan-300 text-sm space-y-1">
              <li>1. Share the invite code with players</li>
              <li>2. They must be enrolled in {tournament.title}</li>
              <li>3. They can use the code to join your team</li>
            </ol>
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

export default TeamDetail