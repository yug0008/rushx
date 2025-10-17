import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaPlay,
  FaPause,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaEye,
  FaYoutube,
  FaUsers,
  FaCalendar,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const AdminWatchPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [watchSessions, setWatchSessions] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [filters, setFilters] = useState({
    tournament: 'all',
    streamType: 'all',
    status: 'all',
    search: ''
  })

  useEffect(() => {
    if (!authLoading && user) {
      if (!isAdmin) {
        window.location.href = '/'
        return
      }
      loadData()
    }
  }, [user, isAdmin, authLoading])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, title, game_name, slug')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load watch sessions with tournament data
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('watch_sessions')
        .select(`
          *,
          tournament:tournaments (
            id,
            title,
            game_name,
            slug
          )
        `)
        .order('created_at', { ascending: false })

      if (sessionsError) throw sessionsError

      setTournaments(tournamentsData || [])
      setWatchSessions(sessionsData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this watch session? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('watch_sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error

      await loadData()
      alert('✅ Watch session deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('❌ Error deleting session: ' + error.message)
    }
  }

  const handleCreateSession = async (sessionData) => {
    try {
      const { error } = await supabase
        .from('watch_sessions')
        .insert([sessionData])

      if (error) throw error

      await loadData()
      setShowCreateModal(false)
      alert('✅ Watch session created successfully!')
      
    } catch (error) {
      console.error('Error creating session:', error)
      alert('❌ Error creating session: ' + error.message)
    }
  }

  const handleUpdateSession = async (sessionId, updates) => {
    try {
      const { error } = await supabase
        .from('watch_sessions')
        .update(updates)
        .eq('id', sessionId)

      if (error) throw error

      await loadData()
      setEditingSession(null)
      alert('✅ Watch session updated successfully!')
      
    } catch (error) {
      console.error('Error updating session:', error)
      alert('❌ Error updating session: ' + error.message)
    }
  }

  const toggleSessionStatus = async (sessionId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('watch_sessions')
        .update({ is_live: !currentStatus })
        .eq('id', sessionId)

      if (error) throw error

      await loadData()
      alert(`✅ Session ${!currentStatus ? 'set as LIVE' : 'set as offline'}!`)
      
    } catch (error) {
      console.error('Error updating session status:', error)
      alert('❌ Error updating session status: ' + error.message)
    }
  }

  // Filter sessions
  const filteredSessions = watchSessions.filter(session => {
    if (filters.tournament !== 'all' && session.tournament_id !== filters.tournament) {
      return false
    }
    if (filters.streamType !== 'all' && session.stream_type !== filters.streamType) {
      return false
    }
    if (filters.status !== 'all') {
      if (filters.status === 'live' && !session.is_live) return false
      if (filters.status === 'offline' && session.is_live) return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        session.title?.toLowerCase().includes(searchTerm) ||
        session.tournament?.title?.toLowerCase().includes(searchTerm) ||
        session.tournament?.game_name?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: watchSessions.length,
    live: watchSessions.filter(session => session.is_live).length,
    youtube: watchSessions.filter(session => session.youtube_url).length,
    totalViewers: watchSessions.reduce((sum, session) => sum + (session.live_viewers_count || 0), 0)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Watch Sessions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <IoMdAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
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
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4 mb-4 lg:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaYoutube className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Watch Sessions Management</h1>
                <p className="text-cyan-400">Manage tournament streams and videos</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={loadData}
                className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaSync className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Session</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sessions</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaYoutube className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Live Now</p>
                <p className="text-3xl font-bold text-white">{stats.live}</p>
              </div>
              <FaPlay className="w-8 h-8 text-red-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">YouTube Videos</p>
                <p className="text-3xl font-bold text-white">{stats.youtube}</p>
              </div>
              <FaYoutube className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Viewers</p>
                <p className="text-3xl font-bold text-white">{stats.totalViewers}</p>
              </div>
              <FaUsers className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaFilter className="w-4 h-4 inline mr-2" />
                Tournament
              </label>
              <select
                value={filters.tournament}
                onChange={(e) => setFilters(prev => ({ ...prev, tournament: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Tournaments</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaFilter className="w-4 h-4 inline mr-2" />
                Stream Type
              </label>
              <select
                value={filters.streamType}
                onChange={(e) => setFilters(prev => ({ ...prev, streamType: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Types</option>
                <option value="live">Live Stream</option>
                <option value="recording">Recording</option>
                <option value="highlight">Highlight</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaFilter className="w-4 h-4 inline mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="live">Live</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaSearch className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Search by title, tournament, or game..."
              />
            </div>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Session</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Tournament</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Type</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Viewers</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Duration</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Date</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">
                      <FaYoutube className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No watch sessions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map(session => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      onViewDetails={() => {
                        setSelectedSession(session)
                        setShowDetailsModal(true)
                      }}
                      onEdit={() => setEditingSession(session)}
                      onDelete={() => deleteSession(session.id)}
                      onToggleStatus={() => toggleSessionStatus(session.id, session.is_live)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {showDetailsModal && selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          onClose={() => setShowDetailsModal(false)}
          onEdit={() => {
            setShowDetailsModal(false)
            setEditingSession(selectedSession)
          }}
          onDelete={() => {
            setShowDetailsModal(false)
            deleteSession(selectedSession.id)
          }}
          onToggleStatus={() => toggleSessionStatus(selectedSession.id, selectedSession.is_live)}
        />
      )}

      {/* Create/Edit Session Modal */}
      {(showCreateModal || editingSession) && (
        <SessionFormModal
          session={editingSession}
          tournaments={tournaments}
          onClose={() => {
            setShowCreateModal(false)
            setEditingSession(null)
          }}
          onSubmit={editingSession ? 
            (data) => handleUpdateSession(editingSession.id, data) :
            handleCreateSession
          }
        />
      )}
    </div>
  )
}

// Session Row Component
const SessionRow = ({ session, onViewDetails, onEdit, onDelete, onToggleStatus }) => {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaYoutube className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold line-clamp-1">
              {session.title}
            </div>
            <div className="text-gray-400 text-sm line-clamp-1">
              {session.description}
            </div>
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div>
          <div className="text-white font-medium">
            {session.tournament?.title || 'Unknown Tournament'}
          </div>
          <div className="text-gray-400 text-sm">{session.tournament?.game_name}</div>
        </div>
      </td>
      
      <td className="p-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          session.stream_type === 'live' ? 'bg-red-500/20 text-red-400' :
          session.stream_type === 'recording' ? 'bg-blue-500/20 text-blue-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {session.stream_type}
        </span>
      </td>
      
      <td className="p-4">
        <button
          onClick={onToggleStatus}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            session.is_live 
              ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
              : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
          }`}
        >
          {session.is_live ? (
            <>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Live
            </>
          ) : (
            <>
              <FaPause className="w-3 h-3 mr-2" />
              Offline
            </>
          )}
        </button>
      </td>
      
      <td className="p-4">
        <div className="flex items-center space-x-1 text-white">
          <FaUsers className="w-4 h-4 text-gray-400" />
          <span>{session.live_viewers_count || 0}</span>
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-gray-300">
          {session.duration_minutes ? 
            `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m` : 
            'N/A'
          }
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-gray-300 text-sm">
          {new Date(session.created_at).toLocaleDateString()}
        </div>
      </td>
      
      <td className="p-4">
        <div className="flex space-x-2">
          <button
            onClick={onViewDetails}
            className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
            title="View Details"
          >
            <FaEye className="w-3 h-3" />
          </button>
          
          <button
            onClick={onEdit}
            className="w-8 h-8 flex items-center justify-center bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
            title="Edit"
          >
            <FaEdit className="w-3 h-3" />
          </button>
          
          <a
            href={`/watch/${session.tournament?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
            title="View on Site"
          >
            <FaExternalLinkAlt className="w-3 h-3" />
          </a>
          
          <button
            onClick={onDelete}
            className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
            title="Delete"
          >
            <FaTrash className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// Session Details Modal Component
const SessionDetailsModal = ({ session, onClose, onEdit, onDelete, onToggleStatus }) => {
  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const youtubeId = extractYouTubeId(session.youtube_url)
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Session Details</h2>
              <p className="text-cyan-400">{session.title}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Video Preview */}
          {youtubeId && (
            <div className="mb-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={session.title}
                ></iframe>
              </div>
            </div>
          )}

          {/* Session Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Session Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-400 text-sm">Title</label>
                  <p className="text-white font-semibold">{session.title}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Description</label>
                  <p className="text-white">{session.description || 'No description'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">YouTube URL</label>
                  <p className="text-cyan-400 break-all">
                    {session.youtube_url ? (
                      <a href={session.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {session.youtube_url}
                      </a>
                    ) : 'No URL'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Stream Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tournament</span>
                  <span className="text-white font-semibold">{session.tournament?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stream Type</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.stream_type === 'live' ? 'bg-red-500/20 text-red-400' :
                    session.stream_type === 'recording' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {session.stream_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <span className={`flex items-center ${session.is_live ? 'text-green-400' : 'text-gray-400'}`}>
                    {session.is_live ? (
                      <>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                        Live
                      </>
                    ) : (
                      <>
                        <FaPause className="w-3 h-3 mr-2" />
                        Offline
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Viewers</span>
                  <span className="text-white">{session.live_viewers_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">
                    {session.duration_minutes ? 
                      `${Math.floor(session.duration_minutes / 60)}h ${session.duration_minutes % 60}m` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Created</span>
                  <span className="text-white">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-cyan-500/20 bg-gray-800/50">
          <div className="flex space-x-4">
            <button
              onClick={onDelete}
              className="flex-1 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Delete Session
            </button>
            
            <button
              onClick={onToggleStatus}
              className="flex-1 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 text-yellow-400 rounded-xl font-semibold transition-colors duration-300"
            >
              {session.is_live ? 'Set Offline' : 'Set Live'}
            </button>
            
            <button
              onClick={onEdit}
              className="flex-1 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 text-blue-400 rounded-xl font-semibold transition-colors duration-300"
            >
              Edit Session
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Session Form Modal Component
const SessionFormModal = ({ session, tournaments, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    tournament_id: session?.tournament_id || '',
    title: session?.title || '',
    description: session?.description || '',
    youtube_url: session?.youtube_url || '',
    stream_type: session?.stream_type || 'live',
    is_live: session?.is_live || false,
    live_viewers_count: session?.live_viewers_count || 0,
    duration_minutes: session?.duration_minutes || 0,
    thumbnail_url: session?.thumbnail_url || '',
    actual_start: session?.actual_start ? new Date(session.actual_start).toISOString().split('T')[0] : '',
    actual_end: session?.actual_end ? new Date(session.actual_end).toISOString().split('T')[0] : ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Prepare data for submission
    const submissionData = {
      ...formData,
      live_viewers_count: parseInt(formData.live_viewers_count) || 0,
      duration_minutes: parseInt(formData.duration_minutes) || 0,
      // Convert empty strings to null
      thumbnail_url: formData.thumbnail_url || null,
      actual_start: formData.actual_start || null,
      actual_end: formData.actual_end || null
    }

    // Validate required fields
    if (!submissionData.tournament_id) {
      alert('Please select a tournament')
      return
    }
    if (!submissionData.title) {
      alert('Please enter a title')
      return
    }
    if (!submissionData.youtube_url) {
      alert('Please enter a YouTube URL')
      return
    }

    onSubmit(submissionData)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {session ? 'Edit Session' : 'Add New Session'}
              </h2>
              <p className="text-cyan-400">Enter watch session details</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimesCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Tournament Selection */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Tournament *
              </label>
              <select
                required
                value={formData.tournament_id}
                onChange={(e) => handleInputChange('tournament_id', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="">Select Tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title} - {tournament.game_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Session title"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Stream Type *
                </label>
                <select
                  required
                  value={formData.stream_type}
                  onChange={(e) => handleInputChange('stream_type', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="live">Live Stream</option>
                  <option value="recording">Recording</option>
                  <option value="highlight">Highlight</option>
                </select>
              </div>
            </div>

            {/* YouTube URL */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                YouTube URL *
              </label>
              <input
                type="url"
                required
                value={formData.youtube_url}
                onChange={(e) => handleInputChange('youtube_url', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows="3"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Session description..."
              />
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Live Viewers
                </label>
                <input
                  type="number"
                  value={formData.live_viewers_count}
                  onChange={(e) => handleInputChange('live_viewers_count', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={formData.duration_minutes}
                  onChange={(e) => handleInputChange('duration_minutes', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_live}
                    onChange={(e) => handleInputChange('is_live', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500 focus:ring-2"
                  />
                  <span className="text-gray-300 text-sm font-medium">Live Status</span>
                </label>
              </div>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Actual Start Date
                </label>
                <input
                  type="date"
                  value={formData.actual_start}
                  onChange={(e) => handleInputChange('actual_start', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600 text-gray-300 rounded-xl font-semibold transition-colors duration-300"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 rounded-xl font-semibold transition-colors duration-300"
            >
              {session ? 'Update Session' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminWatchPage