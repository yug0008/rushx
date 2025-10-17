import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaExpand,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaDownload,
  FaList,
  FaClock,
  FaEye,
  FaUsers,
  FaArrowLeft,
  FaYoutube
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const TournamentWatchPage = () => {
  const router = useRouter()
  const { tournament: tournamentSlug } = router.query
  const { user } = useAuth()
  
  const [tournament, setTournament] = useState(null)
  const [watchSessions, setWatchSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('live')

  useEffect(() => {
    if (tournamentSlug) {
      fetchTournamentData()
    }
  }, [tournamentSlug])

  const fetchTournamentData = async () => {
    try {
      setLoading(true)

      // Fetch tournament
      const { data: tournamentData, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('slug', tournamentSlug)
        .single()

      if (error) throw error
      setTournament(tournamentData)

      // Fetch watch sessions for this tournament
      const { data: sessionsData } = await supabase
        .from('watch_sessions')
        .select('*')
        .eq('tournament_id', tournamentData.id)
        .order('created_at', { ascending: false })

      setWatchSessions(sessionsData || [])
      
      // Set current session (prioritize live streams)
      const liveSession = sessionsData?.find(session => session.is_live)
      setCurrentSession(liveSession || sessionsData?.[0] || null)

    } catch (error) {
      console.error('Error fetching tournament watch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const filteredSessions = watchSessions.filter(session => 
    activeTab === 'all' || session.stream_type === activeTab
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading Tournament...</p>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <GiTrophyCup className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Tournament Not Found</h2>
          <p className="text-gray-400 mb-6">The tournament you're looking for doesn't exist.</p>
          <button 
            onClick={() => router.push('/watch')}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Watch
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Header */}
      <div className="border-b border-gray-800 sticky top-20 bg-black z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-4 py-4">
            <button
              onClick={() => router.push('/watch')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{tournament.title}</h1>
              <p className="text-gray-400">{tournament.game_name}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-8">
            {[
              { id: 'live', name: 'Live Streams' },
              { id: 'recording', name: 'Recordings' },
              { id: 'highlight', name: 'Highlights' },
              { id: 'all', name: 'All Videos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 font-semibold border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-red-600 border-red-600'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-3">
            {currentSession ? (
              <VideoPlayer 
                session={currentSession}
                extractYouTubeId={extractYouTubeId}
              />
            ) : (
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaYoutube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Videos Available</h3>
                  <p className="text-gray-400">Check back later for tournament streams</p>
                </div>
              </div>
            )}

            {/* Video Info */}
            {currentSession && (
              <div className="mt-6 bg-gray-900 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {currentSession.title}
                    </h2>
                    <div className="flex items-center space-x-4 text-gray-400">
                      {currentSession.is_live && (
                        <div className="flex items-center space-x-2 text-red-500">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="font-semibold">LIVE</span>
                          <span>{currentSession.live_viewers_count} watching</span>
                        </div>
                      )}
                      <span>{new Date(currentSession.created_at).toLocaleDateString()}</span>
                      {currentSession.duration_minutes && (
                        <span>{Math.floor(currentSession.duration_minutes / 60)}h {currentSession.duration_minutes % 60}m</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaRegHeart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaShare className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <FaDownload className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {currentSession.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Video List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold flex items-center space-x-2">
                  <FaList className="w-4 h-4" />
                  <span>Tournament Videos</span>
                </h3>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredSessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No {activeTab} videos available
                  </div>
                ) : (
                  filteredSessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => setCurrentSession(session)}
                      className={`p-4 border-b border-gray-800 cursor-pointer transition-colors ${
                        currentSession?.id === session.id
                          ? 'bg-red-600/20 border-red-600/50'
                          : 'hover:bg-gray-800'
                      }`}
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0 w-16 h-12 bg-gray-700 rounded relative">
                          {session.thumbnail_url ? (
                            <img
                              src={session.thumbnail_url}
                              alt={session.title}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
                              <FaPlay className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          {session.is_live && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 mb-1">
                            {session.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>{session.stream_type}</span>
                            {session.duration_minutes && (
                              <>
                                <span>•</span>
                                <span>{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tournament Info */}
            <div className="mt-6 bg-gray-900 rounded-lg p-4">
              <h3 className="text-white font-bold mb-3">Tournament Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Game:</span>
                  <span className="text-white">{tournament.game_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={`font-semibold ${
                    tournament.status === 'ongoing' ? 'text-green-400' :
                    tournament.status === 'completed' ? 'text-gray-400' :
                    'text-yellow-400'
                  }`}>
                    {tournament.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Videos:</span>
                  <span className="text-white">{watchSessions.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Video Player Component
const VideoPlayer = ({ session, extractYouTubeId }) => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const youtubeId = extractYouTubeId(session.youtube_url)
  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      {/* YouTube Embed */}
      <div className="aspect-video relative">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={session.title}
        ></iframe>

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isPlaying ? <FaPause className="w-5 h-5" /> : <FaPlay className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-red-500 transition-colors"
                >
                  {isMuted || volume === 0 ? <FaVolumeMute className="w-5 h-5" /> : <FaVolumeUp className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 accent-red-600"
                />
              </div>
            </div>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:text-red-500 transition-colors"
            >
              <FaExpand className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Stream Info */}
      {session.is_live && (
        <div className="p-4 bg-red-600/20 border-b border-red-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-red-400">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">LIVE NOW</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-300">
                <FaEye className="w-4 h-4" />
                <span>{session.live_viewers_count} viewers</span>
              </div>
            </div>
            <div className="text-gray-300 text-sm">
              Started {new Date(session.actual_start).toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TournamentWatchPage