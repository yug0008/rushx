import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import { 
  FaBell, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch,
  FaFilter,
  FaUsers,
  FaUser,
  FaGlobe,
  FaPaperPlane,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaGamepad,
  FaTrophy,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const AdminNotifications = () => {
  const { user, isAdmin } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [users, setUsers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    type: 'all',
    audience: 'all',
    readStatus: 'all'
  })

  useEffect(() => {
    if (user && isAdmin) {
      fetchData()
    }
  }, [user, isAdmin])

  const fetchData = async () => {
    try {
      const [
        { data: notificationsData },
        { data: usersData },
        { data: tournamentsData }
      ] = await Promise.all([
        supabase
          .from('notifications')
          .select(`
            *,
            user:profiles!user_id(username, email),
            tournament:related_tournament_id(title, slug)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('profiles')
          .select('id, username, email, created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('tournaments')
          .select('id, title, slug, status')
          .order('created_at', { ascending: false })
      ])

      setNotifications(notificationsData || [])
      setUsers(usersData || [])
      setTournaments(tournamentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNotification = async (notificationData) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()

      if (error) throw error
      
      // If sending to multiple users, create notifications for each
      if (notificationData.audience === 'multiple' && notificationData.user_ids) {
        const userNotifications = notificationData.user_ids.map(userId => ({
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          audience: 'individual',
          user_id: userId,
          related_tournament_id: notificationData.related_tournament_id,
          created_by: user.id
        }))

        await supabase
          .from('notifications')
          .insert(userNotifications)
      }

      fetchData()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating notification:', error)
      throw error
    }
  }

  const handleUpdateNotification = async (notificationData) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update(notificationData)
        .eq('id', editingNotification.id)

      if (error) throw error
      
      fetchData()
      setEditingNotification(null)
    } catch (error) {
      console.error('Error updating notification:', error)
      throw error
    }
  }

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm('Are you sure you want to delete this notification?')) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleBulkDelete = async (notificationIds) => {
    if (!confirm(`Are you sure you want to delete ${notificationIds.length} notifications?`)) return

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error bulk deleting notifications:', error)
    }
  }

  const getNotificationStats = () => {
    const total = notifications.length
    const read = notifications.filter(n => n.read).length
    const unread = total - read
    const global = notifications.filter(n => n.audience === 'global').length
    const individual = notifications.filter(n => n.audience === 'individual').length

    return { total, read, unread, global, individual }
  }

  const filteredNotifications = notifications.filter(notification => {
    // Search filter
    if (searchTerm && !notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.message.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !notification.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Type filter
    if (filters.type !== 'all' && notification.type !== filters.type) {
      return false
    }

    // Audience filter
    if (filters.audience !== 'all' && notification.audience !== filters.audience) {
      return false
    }

    // Read status filter
    if (filters.readStatus !== 'all') {
      if (filters.readStatus === 'read' && !notification.read) return false
      if (filters.readStatus === 'unread' && notification.read) return false
    }

    return true
  })

  const stats = getNotificationStats()

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications Management</h1>
            <p className="text-gray-600">Manage and send notifications to users</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Notification</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard
            title="Total Notifications"
            value={stats.total}
            icon={FaBell}
            color="blue"
          />
          <StatCard
            title="Unread"
            value={stats.unread}
            icon={FaEyeSlash}
            color="yellow"
          />
          <StatCard
            title="Read"
            value={stats.read}
            icon={FaEye}
            color="green"
          />
          <StatCard
            title="Global"
            value={stats.global}
            icon={FaGlobe}
            color="purple"
          />
          <StatCard
            title="Individual"
            value={stats.individual}
            icon={FaUser}
            color="cyan"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="tournament">Tournament</option>
                <option value="match">Match</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
              <select
                value={filters.audience}
                onChange={(e) => setFilters(prev => ({ ...prev, audience: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Audience</option>
                <option value="global">Global</option>
                <option value="individual">Individual</option>
                <option value="multiple">Multiple Users</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.readStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, readStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audience
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onEdit={setEditingNotification}
                    onDelete={handleDeleteNotification}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <FaBell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && (
          <NotificationModal
            onClose={() => setShowCreateModal(false)}
            onSave={handleCreateNotification}
            users={users}
            tournaments={tournaments}
            currentUser={user}
          />
        )}

        {editingNotification && (
          <NotificationModal
            notification={editingNotification}
            onClose={() => setEditingNotification(null)}
            onSave={handleUpdateNotification}
            users={users}
            tournaments={tournaments}
            currentUser={user}
            isEditing
          />
        )}
      </div>
    
  )
}

const NotificationRow = ({ notification, onEdit, onDelete }) => {
  const getTypeIcon = (type) => {
    const icons = {
      info: <FaInfoCircle className="w-4 h-4 text-blue-500" />,
      success: <FaCheckCircle className="w-4 h-4 text-green-500" />,
      warning: <FaExclamationTriangle className="w-4 h-4 text-yellow-500" />,
      tournament: <GiTrophyCup className="w-4 h-4 text-purple-500" />,
      match: <FaGamepad className="w-4 h-4 text-indigo-500" />
    }
    return icons[type] || icons.info
  }

  const getAudienceIcon = (audience) => {
    const icons = {
      global: <FaGlobe className="w-4 h-4 text-gray-500" />,
      individual: <FaUser className="w-4 h-4 text-blue-500" />,
      multiple: <FaUsers className="w-4 h-4 text-green-500" />
    }
    return icons[audience] || icons.individual
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-start space-x-3">
          {getTypeIcon(notification.type)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </div>
            <div className="text-sm text-gray-500 truncate">
              {notification.message}
            </div>
            {notification.user && (
              <div className="text-xs text-gray-400">
                To: {notification.user.username || notification.user.email}
              </div>
            )}
            {notification.tournament && (
              <div className="text-xs text-cyan-600">
                Tournament: {notification.tournament.title}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {getAudienceIcon(notification.audience)}
          <span className="text-sm text-gray-900 capitalize">{notification.audience}</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' :
          notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
          notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {notification.type}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          notification.read 
            ? 'bg-gray-100 text-gray-800' 
            : 'bg-cyan-100 text-cyan-800'
        }`}>
          {notification.read ? 'Read' : 'Unread'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(notification.created_at).toLocaleDateString()}
        <div className="text-xs text-gray-400">
          {new Date(notification.created_at).toLocaleTimeString()}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
        <button
          onClick={() => onEdit(notification)}
          className="text-cyan-600 hover:text-cyan-900 transition-colors duration-200"
        >
          <FaEdit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(notification.id)}
          className="text-red-600 hover:text-red-900 transition-colors duration-200"
        >
          <FaTrash className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

const NotificationModal = ({ 
  notification, 
  onClose, 
  onSave, 
  users, 
  tournaments, 
  currentUser,
  isEditing = false 
}) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    audience: 'global',
    user_id: null,
    user_ids: [],
    related_tournament_id: null
  })

  useEffect(() => {
    if (notification) {
      setFormData({
        title: notification.title || '',
        message: notification.message || '',
        type: notification.type || 'info',
        audience: notification.audience || 'global',
        user_id: notification.user_id || null,
        user_ids: notification.user_ids || [],
        related_tournament_id: notification.related_tournament_id || null
      })
    }
  }, [notification])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const submitData = {
        ...formData,
        created_by: currentUser.id
      }

      // Clean up data based on audience
      if (submitData.audience === 'global') {
        submitData.user_id = null
        submitData.user_ids = []
      } else if (submitData.audience === 'individual') {
        submitData.user_ids = []
      }

      await onSave(submitData)
    } catch (error) {
      console.error('Error saving notification:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUserSelect = (userId) => {
    if (formData.audience === 'multiple') {
      const updatedUserIds = formData.user_ids.includes(userId)
        ? formData.user_ids.filter(id => id !== userId)
        : [...formData.user_ids, userId]
      handleChange('user_ids', updatedUserIds)
    } else {
      handleChange('user_id', userId)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Notification' : 'Create New Notification'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Enter notification message"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="info">Information</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="tournament">Tournament</option>
                  <option value="match">Match</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Audience *
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => handleChange('audience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="global">All Users (Global)</option>
                  <option value="individual">Single User</option>
                  <option value="multiple">Multiple Users</option>
                </select>
              </div>
            </div>

            {formData.audience === 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User *
                </label>
                <select
                  value={formData.user_id || ''}
                  onChange={(e) => handleChange('user_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username || user.email} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.audience === 'multiple' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users *
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        checked={formData.user_ids.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span className="text-sm text-gray-700">
                        {user.username || user.email} ({user.email})
                      </span>
                    </label>
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Selected: {formData.user_ids.length} users
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Tournament (Optional)
              </label>
              <select
                value={formData.related_tournament_id || ''}
                onChange={(e) => handleChange('related_tournament_id', e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">No tournament</option>
                {tournaments.map(tournament => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.title} ({tournament.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              <FaPaperPlane className="w-4 h-4" />
              <span>{loading ? 'Sending...' : isEditing ? 'Update Notification' : 'Send Notification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].replace('bg-', 'text-')}`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default AdminNotifications