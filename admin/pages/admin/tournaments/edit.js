import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../../context/AuthContext'
import { supabase } from '../../../lib/supabase'
import { 
  FaSave, 
  FaTimes,
  FaImage,
  FaLink,
  FaCalendarAlt,
  FaClock,
  FaMoneyBillWave,
  FaUsers,
  FaTrophy,
  FaGamepad,
  FaList,
  FaLock,
  FaEye,
  FaArrowLeft,
  FaEdit
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const EditTournamentPage = () => {
  const router = useRouter()
  const { id } = router.query
  const { user, isAdmin, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tournament, setTournament] = useState(null)
  
  // Tournament form state
  const [formData, setFormData] = useState(null)

  useEffect(() => {
    if (!authLoading && user) {
      if (!isAdmin) {
        router.push('/')
        return
      }
      if (id) {
        loadTournament()
      }
    }
  }, [user, isAdmin, authLoading, router, id])

  const loadTournament = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setTournament(data)
      
      // Initialize form data with tournament data
      setFormData({
        // Basic Information
        title: data.title || '',
        slug: data.slug || '',
        game_name: data.game_name || '',
        description: data.description || '',
        short_description: data.short_description || '',
        
        // Visuals
        banner_urls: data.banner_urls || [''],
        thumbnail_url: data.thumbnail_url || '',
        
        // Tournament Details
        match_type: data.match_type || 'solo',
        platform: data.platform || 'mobile',
        game_mode: data.game_mode || 'battle_royale',
        max_participants: data.max_participants || 100,
        current_participants: data.current_participants || 0,
        joining_fee: data.joining_fee || 0,
        status: data.status || 'upcoming',
        
        // Schedule
        schedule: data.schedule || {
          registration_start: '',
          registration_end: '',
          start_date: '',
          end_date: '',
          check_in_time: '30 minutes before'
        },
        
        // Prize Pool
        prize_pool: data.prize_pool || {
          winner: 0,
          runnerUp: 0,
          thirdPlace: 0,
          total: 0
        },
        
        // About Sections
        about: data.about || {
          sections: [
            {
              type: 'heading',
              content: 'Tournament Overview'
            },
            {
              type: 'paragraph',
              content: 'Describe your tournament in detail...'
            }
          ]
        },
        
        // Rules
        rules: data.rules || {
          sections: [
            {
              title: 'General Rules',
              rules: [
                'All participants must follow fair play guidelines',
                'Any form of cheating will result in immediate disqualification',
                'Players must have stable internet connection'
              ]
            }
          ]
        },
        
        // Additional Settings
        is_featured: data.is_featured || false,
        is_public: data.is_public !== undefined ? data.is_public : true,
        stream_url: data.stream_url || '',
        discord_url: data.discord_url || '',
        organizer: data.organizer || 'RushX Esports'
      })

    } catch (error) {
      console.error('Error loading tournament:', error)
      alert('Error loading tournament: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // All the same helper functions as in NewTournamentPage...
  const handleInputChange = (path, value) => {
    if (path.includes('.')) {
      const [parent, child] = path.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [path]: value
      }))
    }
  }

  const handleArrayChange = (path, index, value) => {
    const [parent, child] = path.split('.')
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].map((item, i) => i === index ? value : item)
      }
    }))
  }

  const addArrayItem = (path) => {
    const [parent, child] = path.split('.')
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: [...prev[parent][child], '']
      }
    }))
  }

  const removeArrayItem = (path, index) => {
    const [parent, child] = path.split('.')
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: prev[parent][child].filter((_, i) => i !== index)
      }
    }))
  }

  const handleAboutSectionChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        sections: prev.about.sections.map((section, i) => 
          i === index ? { ...section, [field]: value } : section
        )
      }
    }))
  }

  const addAboutSection = (type = 'paragraph') => {
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        sections: [
          ...prev.about.sections,
          { type, content: type === 'heading' ? 'New Section' : 'Add content here...' }
        ]
      }
    }))
  }

  const removeAboutSection = (index) => {
    setFormData(prev => ({
      ...prev,
      about: {
        ...prev.about,
        sections: prev.about.sections.filter((_, i) => i !== index)
      }
    }))
  }

  const handleRulesSectionChange = (sectionIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: prev.rules.sections.map((section, i) => 
          i === sectionIndex ? { ...section, [field]: value } : section
        )
      }
    }))
  }

  const handleRuleChange = (sectionIndex, ruleIndex, value) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: prev.rules.sections.map((section, i) => 
          i === sectionIndex ? {
            ...section,
            rules: section.rules.map((rule, j) => j === ruleIndex ? value : rule)
          } : section
        )
      }
    }))
  }

  const addRulesSection = () => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: [
          ...prev.rules.sections,
          { title: 'New Rules Section', rules: ['Add rule here...'] }
        ]
      }
    }))
  }

  const removeRulesSection = (index) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: prev.rules.sections.filter((_, i) => i !== index)
      }
    }))
  }

  const addRule = (sectionIndex) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: prev.rules.sections.map((section, i) => 
          i === sectionIndex ? {
            ...section,
            rules: [...section.rules, 'New rule...']
          } : section
        )
      }
    }))
  }

  const removeRule = (sectionIndex, ruleIndex) => {
    setFormData(prev => ({
      ...prev,
      rules: {
        ...prev.rules,
        sections: prev.rules.sections.map((section, i) => 
          i === sectionIndex ? {
            ...section,
            rules: section.rules.filter((_, j) => j !== ruleIndex)
          } : section
        )
      }
    }))
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const calculateTotalPrize = () => {
    const { winner, runnerUp, thirdPlace } = formData.prize_pool
    return winner + runnerUp + thirdPlace
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert('Tournament title is required')
      return false
    }
    if (!formData.slug.trim()) {
      alert('Tournament slug is required')
      return false
    }
    if (!formData.game_name.trim()) {
      alert('Game name is required')
      return false
    }
    if (formData.max_participants < 2) {
      alert('Maximum participants must be at least 2')
      return false
    }
    if (!formData.schedule.registration_start) {
      alert('Registration start date is required')
      return false
    }
    if (!formData.schedule.registration_end) {
      alert('Registration end date is required')
      return false
    }
    if (!formData.schedule.start_date) {
      alert('Tournament start date is required')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setSaving(true)

      // Calculate total prize pool
      const totalPrize = calculateTotalPrize()
      const submissionData = {
        ...formData,
        prize_pool: {
          ...formData.prize_pool,
          total: totalPrize
        },
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('tournaments')
        .update(submissionData)
        .eq('id', id)

      if (error) throw error

      // Create notification for tournament update
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Tournament Updated!',
          message: `Tournament "${formData.title}" has been updated successfully.`,
          type: 'info',
          related_tournament_id: id
        })

      alert('Tournament updated successfully!')
      router.push('/admin/tournaments')

    } catch (error) {
      console.error('Error updating tournament:', error)
      alert('Error updating tournament: ' + error.message)
    } finally {
      setSaving(false)
    }
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
          <IoMdAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <IoMdAlert className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h1>
          <p className="text-gray-400">The tournament you're trying to edit doesn't exist.</p>
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
                <FaEdit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Edit Tournament</h1>
                <p className="text-cyan-400">Update tournament details</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/tournaments')}
                className="px-4 py-2 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-300 flex items-center space-x-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* All the same form sections as NewTournamentPage */}
          {/* Basic Information */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaGamepad className="w-6 h-6 text-cyan-400" />
              <span>Basic Information</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }))
                    if (!formData.slug) {
                      setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter tournament title"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="tournament-slug"
                />
              </div>

              {/* ... Include all other form fields from NewTournamentPage ... */}
              {/* Game Name, Match Type, Description, etc. */}
              
              <div>
                <label className="block text-white font-semibold mb-2">
                  Game Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.game_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, game_name: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="e.g., BGMI, Free Fire, Valorant"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Match Type
                </label>
                <select
                  value={formData.match_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, match_type: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="solo">Solo</option>
                  <option value="duo">Duo</option>
                  <option value="squad">Squad</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Brief description for tournament cards"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Full Description *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                  placeholder="Detailed description of the tournament"
                />
              </div>
            </div>
          </div>

          {/* Visual Assets Section */}
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaImage className="w-6 h-6 text-purple-400" />
              <span>Visual Assets</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Thumbnail URL
                </label>
                <input
                  type="url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="https://example.com/thumbnail.jpg"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-white font-semibold mb-2">
                  Banner URLs
                </label>
                <div className="space-y-3">
                  {formData.banner_urls.map((url, index) => (
                    <div key={index} className="flex space-x-3">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleArrayChange('banner_urls', index, e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        placeholder="https://example.com/banner.jpg"
                      />
                      {formData.banner_urls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem('banner_urls', index)}
                          className="px-4 py-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                        >
                          <FaTimes className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('banner_urls')}
                    className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Banner URL</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Continue with all other sections from NewTournamentPage */}
          {/* Tournament Settings, Schedule, Prize Pool, About Content, Rules, Additional Links */}

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/tournaments')}
              className="flex-1 px-6 py-4 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-colors duration-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating Tournament...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-5 h-5" />
                  <span>Update Tournament</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditTournamentPage