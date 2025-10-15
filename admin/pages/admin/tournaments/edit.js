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

        {/* Tournament Settings */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaList className="w-6 h-6 text-green-400" />
                      <span>Tournament Settings</span>
                    </h2>
        
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Platform
                        </label>
                        <select
                          value={formData.platform}
                          onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="mobile">Mobile</option>
                          <option value="pc">PC</option>
                          <option value="console">Console</option>
                          <option value="cross-platform">Cross-Platform</option>
                        </select>
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Game Mode
                        </label>
                        <select
                          value={formData.game_mode}
                          onChange={(e) => setFormData(prev => ({ ...prev, game_mode: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="battle_royale">Battle Royale</option>
                          <option value="tdm">Team Deathmatch</option>
                          <option value="clash_squad">Clash Squad</option>
                          <option value="ranked">Ranked</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Status
                        </label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="upcoming">Upcoming</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Max Participants *
                        </label>
                        <input
                          type="number"
                          required
                          min="2"
                          value={formData.max_participants}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Joining Fee (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.joining_fee}
                          onChange={(e) => setFormData(prev => ({ ...prev, joining_fee: parseFloat(e.target.value) }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                        />
                        <label htmlFor="is_featured" className="text-white font-semibold">
                          Featured Tournament
                        </label>
                      </div>
        
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="is_public"
                          checked={formData.is_public}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                        />
                        <label htmlFor="is_public" className="text-white font-semibold">
                          Public Tournament
                        </label>
                      </div>
                    </div>
                  </div>
        
                  {/* Schedule */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaCalendarAlt className="w-6 h-6 text-yellow-400" />
                      <span>Schedule</span>
                    </h2>
        
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Registration Start *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.schedule.registration_start}
                          onChange={(e) => handleInputChange('schedule.registration_start', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Registration End *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.schedule.registration_end}
                          onChange={(e) => handleInputChange('schedule.registration_end', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Tournament Start *
                        </label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.schedule.start_date}
                          onChange={(e) => handleInputChange('schedule.start_date', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Tournament End
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.schedule.end_date}
                          onChange={(e) => handleInputChange('schedule.end_date', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div className="lg:col-span-2">
                        <label className="block text-white font-semibold mb-2">
                          Check-in Time
                        </label>
                        <input
                          type="text"
                          value={formData.schedule.check_in_time}
                          onChange={(e) => handleInputChange('schedule.check_in_time', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="e.g., 30 minutes before match"
                        />
                      </div>
                    </div>
                  </div>
        
                  {/* Prize Pool */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaTrophy className="w-6 h-6 text-yellow-400" />
                      <span>Prize Pool</span>
                    </h2>
        
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Winner Prize (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.prize_pool.winner}
                          onChange={(e) => handleInputChange('prize_pool.winner', parseFloat(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Runner-up Prize (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.prize_pool.runnerUp}
                          onChange={(e) => handleInputChange('prize_pool.runnerUp', parseFloat(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Third Place Prize (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.prize_pool.thirdPlace}
                          onChange={(e) => handleInputChange('prize_pool.thirdPlace', parseFloat(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                      </div>
        
                      <div className="lg:col-span-3">
                        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-xl p-4 border border-yellow-500/30">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-semibold">Total Prize Pool:</span>
                            <span className="text-yellow-400 font-bold text-xl">
                              ₹{calculateTotalPrize().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
        
                  {/* About Content */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaEye className="w-6 h-6 text-blue-400" />
                      <span>About Content</span>
                    </h2>
        
                    <div className="space-y-4">
                      {formData.about.sections.map((section, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                          <div className="flex items-center justify-between mb-4">
                            <select
                              value={section.type}
                              onChange={(e) => handleAboutSectionChange(index, 'type', e.target.value)}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                            >
                              <option value="heading">Heading</option>
                              <option value="paragraph">Paragraph</option>
                              <option value="bullet_list">Bullet List</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => removeAboutSection(index)}
                              className="px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {section.type === 'bullet_list' ? (
                            <div className="space-y-2">
                              <textarea
                                value={section.content}
                                onChange={(e) => handleAboutSectionChange(index, 'content', e.target.value)}
                                rows={4}
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                                placeholder="Enter bullet points (one per line)"
                              />
                              <p className="text-gray-400 text-sm">
                                Enter each bullet point on a new line
                              </p>
                            </div>
                          ) : (
                            <textarea
                              value={section.content}
                              onChange={(e) => handleAboutSectionChange(index, 'content', e.target.value)}
                              rows={section.type === 'heading' ? 2 : 4}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 resize-none"
                              placeholder={section.type === 'heading' ? 'Enter heading...' : 'Enter content...'}
                            />
                          )}
                        </div>
                      ))}
                      
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={() => addAboutSection('heading')}
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300"
                        >
                          Add Heading
                        </button>
                        <button
                          type="button"
                          onClick={() => addAboutSection('paragraph')}
                          className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                        >
                          Add Paragraph
                        </button>
                        <button
                          type="button"
                          onClick={() => addAboutSection('bullet_list')}
                          className="px-4 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300"
                        >
                          Add Bullet List
                        </button>
                      </div>
                    </div>
                  </div>
        
                  {/* Rules */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaLock className="w-6 h-6 text-red-400" />
                      <span>Tournament Rules</span>
                    </h2>
        
                    <div className="space-y-6">
                      {formData.rules.sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                          <div className="flex items-center justify-between mb-4">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleRulesSectionChange(sectionIndex, 'title', e.target.value)}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white font-semibold text-lg focus:outline-none focus:border-cyan-500"
                              placeholder="Section Title"
                            />
                            <button
                              type="button"
                              onClick={() => removeRulesSection(sectionIndex)}
                              className="ml-3 px-3 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="space-y-2">
                            {section.rules.map((rule, ruleIndex) => (
                              <div key={ruleIndex} className="flex items-center space-x-3">
                                <span className="text-cyan-400 w-4">•</span>
                                <input
                                  type="text"
                                  value={rule}
                                  onChange={(e) => handleRuleChange(sectionIndex, ruleIndex, e.target.value)}
                                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                                  placeholder="Enter rule..."
                                />
                                <button
                                  type="button"
                                  onClick={() => removeRule(sectionIndex, ruleIndex)}
                                  className="px-2 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={() => addRule(sectionIndex)}
                              className="px-3 py-2 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors duration-300 text-sm"
                            >
                              + Add Rule
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addRulesSection}
                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors duration-300 flex items-center space-x-2"
                      >
                        <FaPlus className="w-4 h-4" />
                        <span>Add Rules Section</span>
                      </button>
                    </div>
                  </div>
        
                  {/* Additional Links */}
                  <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                      <FaLink className="w-6 h-6 text-purple-400" />
                      <span>Additional Links</span>
                    </h2>
        
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Stream URL
                        </label>
                        <input
                          type="url"
                          value={formData.stream_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, stream_url: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="https://twitch.tv/your-channel"
                        />
                      </div>
        
                      <div>
                        <label className="block text-white font-semibold mb-2">
                          Discord URL
                        </label>
                        <input
                          type="url"
                          value={formData.discord_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, discord_url: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="https://discord.gg/your-server"
                        />
                      </div>
        
                      <div className="lg:col-span-2">
                        <label className="block text-white font-semibold mb-2">
                          Organizer
                        </label>
                        <input
                          type="text"
                          value={formData.organizer}
                          onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                          placeholder="Tournament organizer name"
                        />
                      </div>
                    </div>
                  </div>
        
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