import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { 
  FaEnvelope,
  FaUser,
  FaPhone,
  FaPaperPlane,
  FaCheck,
  FaTimes,
  FaEye,
  FaTrash,
  FaSync,
  FaSearch,
  FaFilter,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaReply,
  FaExternalLinkAlt
} from 'react-icons/fa'
import { IoMdAlert } from 'react-icons/io'

const AdminContactPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [filters, setFilters] = useState({
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
      
      // Load contact submissions
      const { data: contactsData, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setContacts(contactsData || [])

    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteContact = async (contactId) => {
    if (!confirm('Are you sure you want to delete this contact submission? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', contactId)

      if (error) throw error

      await loadData()
      alert('✅ Contact submission deleted successfully!')
      
    } catch (error) {
      console.error('Error deleting contact:', error)
      alert('❌ Error deleting contact: ' + error.message)
    }
  }

  const updateContactStatus = async (contactId, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ status: newStatus })
        .eq('id', contactId)

      if (error) throw error

      await loadData()
      alert(`✅ Status updated to ${newStatus}!`)
      
    } catch (error) {
      console.error('Error updating contact status:', error)
      alert('❌ Error updating contact status: ' + error.message)
    }
  }

  // Filter contacts
  const filteredContacts = contacts.filter(contact => {
    if (filters.status !== 'all' && contact.status !== filters.status) {
      return false
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      return (
        contact.name?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.subject?.toLowerCase().includes(searchTerm) ||
        contact.message?.toLowerCase().includes(searchTerm)
      )
    }
    return true
  })

  // Stats
  const stats = {
    total: contacts.length,
    new: contacts.filter(contact => contact.status === 'new').length,
    inProgress: contacts.filter(contact => contact.status === 'in_progress').length,
    resolved: contacts.filter(contact => contact.status === 'resolved').length
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { 
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        icon: FaExclamationCircle,
        text: 'New'
      },
      in_progress: { 
        color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        icon: FaClock,
        text: 'In Progress'
      },
      resolved: { 
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        icon: FaCheckCircle,
        text: 'Resolved'
      }
    }
    
    const config = statusConfig[status] || statusConfig.new
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    )
  }

  const getPriorityBadge = (createdAt) => {
    const created = new Date(createdAt)
    const now = new Date()
    const hoursDiff = (now - created) / (1000 * 60 * 60)
    
    if (hoursDiff > 48) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">High</span>
    } else if (hoursDiff > 24) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">Medium</span>
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">Low</span>
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Contact Submissions...</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FaEnvelope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Contact Management</h1>
                <p className="text-cyan-400">Manage customer inquiries and support requests</p>
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
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaEnvelope className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">New</p>
                <p className="text-3xl font-bold text-white">{stats.new}</p>
              </div>
              <FaExclamationCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">In Progress</p>
                <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
              </div>
              <FaClock className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved</p>
                <p className="text-3xl font-bold text-white">{stats.resolved}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <option value="new">New</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-gray-300 text-sm font-medium mb-2">
                <FaSearch className="w-4 h-4 inline mr-2" />
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors"
                placeholder="Search by name, email, subject, or message..."
              />
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20">
                  <th className="text-left p-4 text-cyan-400 font-semibold">Contact</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Subject</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Status</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Priority</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Date</th>
                  <th className="text-left p-4 text-cyan-400 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-400">
                      <FaEnvelope className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No contact submissions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map(contact => (
                    <ContactRow
                      key={contact.id}
                      contact={contact}
                      onViewDetails={() => {
                        setSelectedContact(contact)
                        setShowDetailsModal(true)
                      }}
                      onDelete={() => deleteContact(contact.id)}
                      onUpdateStatus={(newStatus) => updateContactStatus(contact.id, newStatus)}
                      getStatusBadge={getStatusBadge}
                      getPriorityBadge={getPriorityBadge}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contact Details Modal */}
      {showDetailsModal && selectedContact && (
        <ContactDetailsModal
          contact={selectedContact}
          onClose={() => setShowDetailsModal(false)}
          onDelete={() => {
            setShowDetailsModal(false)
            deleteContact(selectedContact.id)
          }}
          onUpdateStatus={(newStatus) => {
            updateContactStatus(selectedContact.id, newStatus)
            setShowDetailsModal(false)
          }}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}
    </div>
  )
}

// Contact Row Component
const ContactRow = ({ contact, onViewDetails, onDelete, onUpdateStatus, getStatusBadge, getPriorityBadge, formatDate }) => {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-800/50 transition-colors duration-300">
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <FaUser className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-semibold">{contact.name}</div>
            <div className="text-gray-400 text-sm">{contact.email}</div>
            {contact.phone && (
              <div className="text-gray-400 text-sm flex items-center space-x-1">
                <FaPhone className="w-3 h-3" />
                <span>{contact.phone}</span>
              </div>
            )}
          </div>
        </div>
      </td>
      
      <td className="p-4">
        <div className="text-white font-medium line-clamp-2">
          {contact.subject}
        </div>
        <div className="text-gray-400 text-sm line-clamp-1">
          {contact.message}
        </div>
      </td>
      
      <td className="p-4">
        {getStatusBadge(contact.status)}
      </td>
      
      <td className="p-4">
        {getPriorityBadge(contact.created_at)}
      </td>
      
      <td className="p-4">
        <div className="text-gray-300 text-sm">
          {formatDate(contact.created_at)}
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
          
          <a
            href={`mailto:${contact.email}?subject=Re: ${contact.subject}`}
            className="w-8 h-8 flex items-center justify-center bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
            title="Reply via Email"
          >
            <FaReply className="w-3 h-3" />
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

// Contact Details Modal Component
const ContactDetailsModal = ({ contact, onClose, onDelete, onUpdateStatus, getStatusBadge, formatDate }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Contact Details</h2>
              <p className="text-cyan-400">Submission from {contact.name}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Full Name</label>
                  <p className="text-white font-semibold">{contact.name}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email Address</label>
                  <p className="text-cyan-400">
                    <a href={`mailto:${contact.email}`} className="hover:underline">
                      {contact.email}
                    </a>
                  </p>
                </div>
                {contact.phone && (
                  <div>
                    <label className="text-gray-400 text-sm">Phone Number</label>
                    <p className="text-white">{contact.phone}</p>
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm">Submitted On</label>
                  <p className="text-white">{formatDate(contact.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-white font-bold text-lg mb-4">Submission Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Subject</label>
                  <p className="text-white font-semibold">{contact.subject}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Current Status</label>
                  <div className="mt-1">
                    {getStatusBadge(contact.status)}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Update Status</label>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => onUpdateStatus('new')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        contact.status === 'new' 
                          ? 'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50' 
                          : 'bg-gray-700/50 text-gray-400 hover:bg-yellow-500/20 hover:text-yellow-400'
                      }`}
                    >
                      New
                    </button>
                    <button
                      onClick={() => onUpdateStatus('in_progress')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        contact.status === 'in_progress' 
                          ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50' 
                          : 'bg-gray-700/50 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => onUpdateStatus('resolved')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        contact.status === 'resolved' 
                          ? 'bg-green-500/30 text-green-400 border border-green-500/50' 
                          : 'bg-gray-700/50 text-gray-400 hover:bg-green-500/20 hover:text-green-400'
                      }`}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className="mt-6 bg-gray-800/50 rounded-xl p-6 border border-green-500/30">
            <h3 className="text-white font-bold text-lg mb-4">Message</h3>
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {contact.message}
              </p>
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
              Delete Submission
            </button>
            
            <a
              href={`mailto:${contact.email}?subject=Re: ${contact.subject}&body=Dear ${contact.name},%0D%0A%0D%0AThank you for contacting us regarding: "${contact.subject}"%0D%0A%0D%0A`}
              className="flex-1 px-6 py-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl font-semibold transition-colors duration-300 text-center"
            >
              Reply via Email
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminContactPage