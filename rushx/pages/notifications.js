import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  FaBell, 
  FaCheck, 
  FaTrash, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
  FaGamepad,
  FaTrophy
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const NotificationsPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    if (user) {
      fetchNotifications()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          tournament:related_tournament_id (
            title,
            slug
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => !notif.read)
      const unreadIds = unreadNotifications.map(notif => notif.id)

      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      )
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      info: <FaInfoCircle className="w-5 h-5 text-cyan-400" />,
      success: <FaCheckCircle className="w-5 h-5 text-green-400" />,
      warning: <FaExclamationTriangle className="w-5 h-5 text-yellow-400" />,
      match: <FaGamepad className="w-5 h-5 text-purple-400" />,
      tournament: <GiTrophyCup className="w-5 h-5 text-yellow-400" />
    }
    return icons[type] || icons.info
  }

  const filteredNotifications = notifications.filter(notif => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'unread') return !notif.read
    return notif.type === activeFilter
  })

  const unreadCount = notifications.filter(notif => !notif.read).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Notifications...</p>
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
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
                <p className="text-cyan-400">
                  {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
                >
                  <FaCheck className="w-4 h-4" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'info', 'success', 'warning', 'match', 'tournament'].map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 capitalize ${
                  activeFilter === filter
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-12 text-center">
              <FaBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Notifications</h3>
              <p className="text-gray-400">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-gray-900/80 backdrop-blur-xl rounded-2xl border transition-all duration-300 ${
                  notification.read 
                    ? 'border-gray-700/50' 
                    : 'border-cyan-500/50 bg-cyan-500/5'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg mb-2">
                          {notification.title}
                        </h3>
                        <p className="text-gray-300 mb-3">
                          {notification.message}
                        </p>
                        
                        {notification.tournament && (
                          <div className="flex items-center space-x-2 text-cyan-400 text-sm">
                            <GiTrophyCup className="w-4 h-4" />
                            <span>Related to: {notification.tournament.title}</span>
                          </div>
                        )}
                        
                        <div className="text-gray-500 text-sm mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
                          title="Mark as read"
                        >
                          <FaCheck className="w-3 h-3" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="w-8 h-8 flex items-center justify-center bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                        title="Delete notification"
                      >
                        <FaTrash className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage