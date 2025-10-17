import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import {
  FaPlay,
  FaEye,
  FaUsers,
  FaFire,
  FaHistory,
  FaClock,
  FaSearch,
  FaFilter,
  FaYoutube,
  FaCrown,
  FaTrophy,
  FaRegClock,
  FaRegHeart,
  FaHeart
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const WatchPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [activeCategory, setActiveCategory] = useState('featured')
  const [watchSessions, setWatchSessions] = useState([])
  const [liveStreams, setLiveStreams] = useState([])
  const [featuredStream, setFeaturedStream] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [watchHistory, setWatchHistory] = useState([])

  const categories = [
    { id: 'featured', name: 'Featured', icon: <FaCrown /> },
    { id: 'live', name: 'Live Now', icon: <FaFire /> },
    { id: 'popular', name: 'Popular', icon: <FaUsers /> },
    { id: 'recent', name: 'Recent', icon: <FaHistory /> },
    { id: 'tournaments', name: 'Tournaments', icon: <GiTrophyCup /> }
  ]

  useEffect(() => {
    fetchWatchData()
    if (user) {
      fetchWatchHistory()
    }
  }, [user, activeCategory])

  const fetchWatchData = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('watch_sessions')
        .select(`
          *,
          tournaments (
            title,
            slug,
            game_name,
            banner_urls
          )
        `)

      switch (activeCategory) {
        case 'live':
          query = query.eq('is_live', true)
          break
        case 'popular':
          query = query.order('live_viewers_count', { ascending: false })
          break
        case 'recent':
          query = query.order('created_at', { ascending: false })
          break
        case 'featured':
          query = query.eq('is_live', true).order('live_viewers_count', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) throw error

      setWatchSessions(data || [])
      
      // Set featured stream (most viewed live stream)
      const liveSessions = data?.filter(session => session.is_live) || []
      setLiveStreams(liveSessions)
      setFeaturedStream(liveSessions[0] || null)

    } catch (error) {
      console.error('Error fetching watch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWatchHistory = async () => {
    const { data } = await supabase
      .from('watch_history')
      .select(`
        *,
        watch_sessions (
          *,
          tournaments (
            title,
            slug,
            game_name
          )
        )
      `)
      .eq('user_id', user.id)
      .order('last_watched_at', { ascending: false })

    setWatchHistory(data || [])
  }

  const extractYouTubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
    return match ? match[1] : null
  }

  const filteredSessions = watchSessions.filter(session => 
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.tournaments?.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-semibold">Loading Streams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black pt-20">
      {/* Featured Stream Banner */}
      {featuredStream && (
        <FeaturedBanner 
          stream={featuredStream} 
          extractYouTubeId={extractYouTubeId}
        />
      )}

      {/* Categories Navigation */}
      <div className="border-b border-gray-800 sticky top-20 bg-black z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {category.icon}
                <span className="font-semibold">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search streams and tournaments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition-colors"
          />
        </div>
      </div>

      {/* Live Streams Count */}
      {liveStreams.length > 0 && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-red-500">
            <FaFire className="w-5 h-5 animate-pulse" />
            <span className="font-bold text-lg">{liveStreams.length} Live Streams</span>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="container mx-auto px-4 pb-12">
        {activeCategory === 'featured' && (
          <StreamGrid
            sessions={filteredSessions}
            title="Featured Streams"
            extractYouTubeId={extractYouTubeId}
          />
        )}

        {activeCategory === 'live' && (
          <StreamGrid
            sessions={liveStreams}
            title="Live Now"
            extractYouTubeId={extractYouTubeId}
          />
        )}

        {activeCategory === 'popular' && (
          <StreamGrid
            sessions={filteredSessions.slice(0, 20)}
            title="Popular Streams"
            extractYouTubeId={extractYouTubeId}
          />
        )}

        {activeCategory === 'recent' && (
          <StreamGrid
            sessions={filteredSessions}
            title="Recent Streams"
            extractYouTubeId={extractYouTubeId}
          />
        )}

        {activeCategory === 'tournaments' && (
          <TournamentGrid
            sessions={filteredSessions}
            extractYouTubeId={extractYouTubeId}
          />
        )}

        {filteredSessions.length === 0 && (
          <div className="text-center py-16">
            <FaYoutube className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No Streams Found</h3>
            <p className="text-gray-400">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new streams'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Featured Banner Component
const FeaturedBanner = ({ stream, extractYouTubeId }) => {
  const router = useRouter()
  const youtubeId = extractYouTubeId(stream.youtube_url)

  return (
    <div className="relative h-96 lg:h-[500px] bg-gradient-to-r from-black via-gray-900 to-black">
      {/* Background Image */}
      {stream.thumbnail_url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${stream.thumbnail_url})` }}
        ></div>
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
      
      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl">
          {/* Live Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center space-x-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="font-bold text-sm">LIVE</span>
            </div>
            <div className="flex items-center space-x-1 text-gray-300">
              <FaEye className="w-4 h-4" />
              <span className="text-sm">{stream.live_viewers_count} watching</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {stream.title}
          </h1>

          {/* Tournament Info */}
          {stream.tournaments && (
            <div className="flex items-center space-x-4 mb-6">
              <span className="text-red-400 font-semibold">{stream.tournaments.game_name}</span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-300">{stream.tournaments.title}</span>
            </div>
          )}

          {/* Description */}
          <p className="text-gray-300 text-lg mb-8 line-clamp-2">
            {stream.description}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={() => router.push(`/watch/${stream.tournaments?.slug}`)}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-300"
            >
              <FaPlay className="w-4 h-4" />
              <span>Watch Now</span>
            </button>
            <button className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300">
              <FaRegHeart className="w-4 h-4" />
              <span>Add to Watchlist</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Stream Grid Component
const StreamGrid = ({ sessions, title, extractYouTubeId }) => {
  const router = useRouter()

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
            onClick={() => router.push(`/watch/${session.tournaments?.slug}`)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800 mb-3">
              {session.thumbnail_url ? (
                <img
                  src={session.thumbnail_url}
                  alt={session.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <FaYoutube className="w-12 h-12 text-gray-600" />
                </div>
              )}
              
              {/* Live Badge */}
              {session.is_live && (
                <div className="absolute top-2 left-2 flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              )}
              
              {/* Viewers Count */}
              {session.is_live && (
                <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  <FaEye className="w-3 h-3 inline mr-1" />
                  {session.live_viewers_count}
                </div>
              )}
              
              {/* Duration */}
              {!session.is_live && session.duration_minutes && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  {Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-red-600 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform">
                  <FaPlay className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            {/* Stream Info */}
            <div className="space-y-1">
              <h3 className="text-white font-semibold line-clamp-2 group-hover:text-red-400 transition-colors">
                {session.title}
              </h3>
              {session.tournaments && (
                <p className="text-gray-400 text-sm line-clamp-1">
                  {session.tournaments.title}
                </p>
              )}
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <span>{session.tournaments?.game_name}</span>
                {session.is_live ? (
                  <span className="text-red-500">• Live Now</span>
                ) : (
                  <span className="flex items-center space-x-1">
                    <FaRegClock className="w-3 h-3" />
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Tournament Grid Component
const TournamentGrid = ({ sessions, extractYouTubeId }) => {
  const router = useRouter()
  
  // Group sessions by tournament
  const tournamentsMap = sessions.reduce((acc, session) => {
    if (!session.tournaments) return acc
    
    const tournamentId = session.tournaments.slug
    if (!acc[tournamentId]) {
      acc[tournamentId] = {
        tournament: session.tournaments,
        sessions: []
      }
    }
    acc[tournamentId].sessions.push(session)
    return acc
  }, {})

  const tournaments = Object.values(tournamentsMap)

  return (
    <div className="space-y-8">
      {tournaments.map(({ tournament, sessions }) => (
        <div key={tournament.slug} className="bg-gray-900 rounded-xl overflow-hidden">
          {/* Tournament Header */}
          <div 
            className="h-48 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${tournament.banner_urls?.[0]})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center space-x-3 mb-2">
                <GiTrophyCup className="w-6 h-6 text-yellow-400" />
                <h2 className="text-2xl font-bold text-white">{tournament.title}</h2>
              </div>
              <p className="text-gray-300">{tournament.game_name}</p>
            </div>
          </div>

          {/* Sessions Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="group cursor-pointer bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-all duration-300"
                  onClick={() => router.push(`/watch/${tournament.slug}`)}
                >
                  <div className="aspect-video relative">
                    {session.thumbnail_url ? (
                      <img
                        src={session.thumbnail_url}
                        alt={session.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                        <FaYoutube className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    
                    {/* Play Button */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-3">
                        <FaPlay className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-white font-semibold line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                      {session.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>{session.stream_type}</span>
                      {session.duration_minutes && (
                        <span>{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WatchPage