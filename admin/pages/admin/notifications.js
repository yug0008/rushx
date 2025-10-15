import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaBell, 
  FaPaperPlane, 
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaGamepad,
  FaTrophy,
  FaUser,
  FaEnvelope
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const AdminNotificationsPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [users, setUsers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [notificationStats, setNotificationStats] = useState({
    total: 0,
    unread: 0,
    sentToday: 0
  })

  // Notification form state
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info',
    targetUsers: 'all', // 'all', 'selected', 'tournament_participants'
    selectedUserIds: [],
    relatedTournamentId: ''
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
      
      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, email, created_at')
        .order('created_at', { ascending: false })

      if (usersError) throw usersError

      // Load tournaments
      const { data: tournamentsData, error: tournamentsError } = await supabase
        .from('tournaments')
        .select('id, title, slug')
        .order('created_at', { ascending: false })

      if (tournamentsError) throw tournamentsError

      // Load notification stats
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')

      if (notificationsError) throw notificationsError

      const today = new Date().toISOString().split('T')[0]
      const sentToday = notificationsData.filter(notif => 
        notif.created_at.split('T')[0] === today
      ).length

      setNotificationStats({
        total: notificationsData.length,
        unread: notificationsData.filter(notif => !notif.read).length,
        sentToday
      })

      setUsers(usersData || [])
      setTournaments(tournamentsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUserSelection = (userId) => {
    setNotificationForm(prev => {
      const isSelected = prev.selectedUserIds.includes(userId)
      return {
        ...prev,
        selectedUserIds: isSelected
          ? prev.selectedUserIds.filter(id => id !== userId)
          : [...prev.selectedUserIds, userId]
      }
    })
  }

  const selectAllUsers = () => {
    setNotificationForm(prev => ({
      ...prev,
      selectedUserIds: users.map(user => user.id)
    }))
  }

  const clearUserSelection = () => {
    setNotificationForm(prev => ({
      ...prev,
      selectedUserIds: []
    }))
  }

  const sendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      alert('Please fill in both title and message')
      return
    }

    if (notificationForm.targetUsers === 'selected' && notificationForm.selectedUserIds.length === 0) {
      alert('Please select at least one user')
      return
    }

    if (notificationForm.targetUsers === 'tournament_participants' && !notificationForm.relatedTournamentId) {
      alert('Please select a tournament')
      return
    }

    try {
      setSending(true)

      let targetUserIds = []

      if (notificationForm.targetUsers === 'all') {
        targetUserIds = users.map(user => user.id)
      } else if (notificationForm.targetUsers === 'selected') {
        targetUserIds = notificationForm.selectedUserIds
      } else if (notificationForm.targetUsers === 'tournament_participants') {
        // You'll need to implement this based on your tournament participants structure
        // This is a placeholder - adjust according to your schema
        const { data: participants, error } = await supabase
          .from('tournament_participants') // Adjust table name as needed
          .select('user_id')
          .eq('tournament_id', notificationForm.relatedTournamentId)

        if (error) throw error
        targetUserIds = participants.map(p => p.user_id)
      }

      // Create notifications for all target users
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        related_tournament_id: notificationForm.relatedTournamentId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      // Reset form
      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        targetUsers: 'all',
        selectedUserIds: [],
        relatedTournamentId: ''
      })

      // Reload stats
      await loadData()

      alert(`Successfully sent notification to ${targetUserIds.length} users!`)
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Error sending notification: ' + error.message)
    } finally {
      setSending(false)
    }
  }

  const getNotificationTypeIcon = (type) => {
    const icons = {
      info: <FaInfoCircle className="w-5 h-5 text-blue-400" />,
      success: <FaCheckCircle className="w-5 h-5 text-green-400" />,
      warning: <FaExclamationTriangle className="w-5 h-5 text-yellow-400" />,
      match: <FaGamepad className="w-5 h-5 text-purple-400" />,
      tournament: <GiTrophyCup className="w-5 h-5 text-yellow-400" />
    }
    return icons[type] || icons.info
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaBell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Notifications</h1>
                <p className="text-cyan-400">Send notifications to users</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Notifications</p>
                <p className="text-3xl font-bold text-white">{notificationStats.total}</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Unread Notifications</p>
                <p className="text-3xl font-bold text-white">{notificationStats.unread}</p>
              </div>
              <FaBell className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Sent Today</p>
                <p className="text-3xl font-bold text-white">{notificationStats.sentToday}</p>
              </div>
              <FaPaperPlane className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Notification Form */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaPaperPlane className="w-6 h-6 text-cyan-400" />
              <span>Send Notification</span>
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter notification title"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows="4"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter notification message"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Type
                </label>
                <select
                  value={notificationForm.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="match">Match Update</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>

              {/* Target Users */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Target Users
                </label>
                <select
                  value={notificationForm.targetUsers}
                  onChange={(e) => handleInputChange('targetUsers', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="all">All Users</option>
                  <option value="selected">Selected Users</option>
                  <option value="tournament_participants">Tournament Participants</option>
                </select>
              </div>

              {/* Tournament Selection (if tournament participants) */}
              {notificationForm.targetUsers === 'tournament_participants' && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Select Tournament
                  </label>
                  <select
                    value={notificationForm.relatedTournamentId}
                    onChange={(e) => handleInputChange('relatedTournamentId', e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="">Select a tournament</option>
                    {tournaments.map(tournament => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Send Button */}
              <button
                onClick={sendNotification}
                disabled={sending}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="w-4 h-4" />
                    <span>Send Notification</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User Selection & Preview */}
          <div className="space-y-6">
            {/* User Selection */}
            {notificationForm.targetUsers === 'selected' && (
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                    <FaUsers className="w-5 h-5 text-cyan-400" />
                    <span>Select Users</span>
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={selectAllUsers}
                      className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      onClick={clearUserSelection}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <input
                        type="checkbox"
                        checked={notificationForm.selectedUserIds.includes(user.id)}
                        onChange={() => handleUserSelection(user.id)}
                        className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                      />
                      <FaUser className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium">{user.username || 'No username'}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 text-cyan-400 text-sm">
                  Selected: {notificationForm.selectedUserIds.length} users
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                <FaBell className="w-5 h-5 text-cyan-400" />
                <span>Preview</span>
              </h3>
              
              {notificationForm.title || notificationForm.message ? (
                <div className="bg-gray-800/50 rounded-xl border border-cyan-500/30 p-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationTypeIcon(notificationForm.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg">
                        {notificationForm.title || 'Notification Title'}
                      </h4>
                      <p className="text-gray-300 mt-2">
                        {notificationForm.message || 'Notification message will appear here...'}
                      </p>
                      <div className="text-gray-500 text-sm mt-3">
                        {new Date().toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <FaBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Notification preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminNotificationsPage