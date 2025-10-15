import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TournamentModal = ({ tournament, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    game_name: '',
    match_type: 'solo',
    joining_fee: 0,
    max_participants: 100,
    status: 'upcoming',
    banner_urls: [],
    prize_pool: { winner: 0, runnerUp: 0 },
    schedule: {
      registration_end: '',
      start_date: '',
      end_date: ''
    },
    rules: { sections: [] },
    about: { sections: [] }
  })

  useEffect(() => {
    if (tournament) {
      setFormData(tournament)
    }
  }, [tournament])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (tournament) {
        // Update tournament
        const { error } = await supabase
          .from('tournaments')
          .update(formData)
          .eq('id', tournament.id)

        if (error) throw error
      } else {
        // Create new tournament
        const { error } = await supabase
          .from('tournaments')
          .insert([formData])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving tournament:', error)
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

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {tournament ? 'Edit Tournament' : 'Create New Tournament'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tournament Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game Name *
              </label>
              <input
                type="text"
                required
                value={formData.game_name}
                onChange={(e) => handleChange('game_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Match Type *
              </label>
              <select
                value={formData.match_type}
                onChange={(e) => handleChange('match_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Joining Fee (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.joining_fee}
                onChange={(e) => handleChange('joining_fee', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Participants *
              </label>
              <input
                type="number"
                required
                value={formData.max_participants}
                onChange={(e) => handleChange('max_participants', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Winner Prize (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.prize_pool.winner}
                onChange={(e) => handleNestedChange('prize_pool', 'winner', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Runner-up Prize (₹) *
              </label>
              <input
                type="number"
                required
                value={formData.prize_pool.runnerUp}
                onChange={(e) => handleNestedChange('prize_pool', 'runnerUp', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
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
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium rounded-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Saving...' : tournament ? 'Update Tournament' : 'Create Tournament'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TournamentModal