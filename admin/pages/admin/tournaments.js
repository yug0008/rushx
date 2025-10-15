import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import Layout from '../../components/Layout'
import TournamentModal from '../../components/TournamentModal'
import { FaEdit, FaTrash, FaPlus, FaEye } from 'react-icons/fa'

const AdminTournaments = () => {
  const { isAdmin } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTournament, setEditingTournament] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      fetchTournaments()
    }
  }, [isAdmin])

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTournaments(data || [])
    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tournament) => {
    setEditingTournament(tournament)
    setShowModal(true)
  }

  const handleDelete = async (tournamentId) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId)

      if (error) throw error
      fetchTournaments()
    } catch (error) {
      console.error('Error deleting tournament:', error)
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTournament(null)
  }

  const handleModalSuccess = () => {
    fetchTournaments()
    handleModalClose()
  }

  if (!isAdmin) {
    return <div>Access Denied</div>
  }

  return (
   
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tournaments Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Tournament</span>
          </button>
        </div>

        {/* Tournaments Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tournament
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prize Pool
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournaments.map((tournament) => (
                  <tr key={tournament.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {tournament.title.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {tournament.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ₹{tournament.joining_fee} entry
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.game_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tournament.status === 'ongoing' 
                          ? 'bg-green-100 text-green-800'
                          : tournament.status === 'upcoming'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tournament.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tournament.current_participants} / {tournament.max_participants}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{tournament.prize_pool?.winner + tournament.prize_pool?.runnerUp || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(tournament)}
                        className="text-cyan-600 hover:text-cyan-900"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tournament.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <TournamentModal
            tournament={editingTournament}
            onClose={handleModalClose}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    
  )
}

export default AdminTournaments