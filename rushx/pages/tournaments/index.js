import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import Head from 'next/head'
import { 
  FaUsers, 
  FaTrophy, 
  FaCalendarAlt, 
  FaClock,
  FaCheck, 
  FaGamepad,
  FaSearch,
  FaFilter,
  FaFire,
  FaCrown,
  FaMedal,
  FaPlayCircle,
  FaRegClock,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaEye
} from 'react-icons/fa'
import { GiTrophyCup, GiPodium } from 'react-icons/gi'
import { IoMdTrendingUp } from 'react-icons/io'

const TournamentsPage = () => {
  const router = useRouter()
  const [tournaments, setTournaments] = useState([])
  const [filteredTournaments, setFilteredTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [featuredTournaments, setFeaturedTournaments] = useState([])
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0)

  // SEO Metadata
  const seoData = {
    title: "Esports Tournaments | Free Fire, BGMI, Valorant Competitions | RushX.Live",
    description: "Join competitive esports tournaments with massive prize pools. Free Fire, BGMI, Valorant competitions with real-time updates. Register now and win big!",
    canonical: "https://www.rushx.live/tournaments",
    keywords: "esports tournaments, Free Fire competitions, BGMI tournaments, Valorant competitions, online gaming tournaments, prize pool tournaments, competitive gaming India",
    ogImage: "https://www.rushx.live/og-image.jpg"
  }

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Esports Tournaments - RushX.Live",
    "description": seoData.description,
    "url": seoData.canonical,
    "numberOfItems": tournaments.length,
    "itemListElement": tournaments.slice(0, 10).map((tournament, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SportsEvent",
        "name": tournament.title,
        "description": tournament.description,
        "startDate": tournament.schedule?.start_date,
        "endDate": tournament.schedule?.end_date,
        "location": {
          "@type": "VirtualLocation",
          "name": "Online Tournament"
        },
        "offers": {
          "@type": "Offer",
          "price": tournament.joining_fee,
          "priceCurrency": "INR"
        },
        "performer": {
          "@type": "SportsTeam",
          "name": tournament.game_name
        }
      }
    }))
  }

  // Status utility functions
  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      ongoing: 'bg-gradient-to-r from-green-500 to-emerald-600',
      completed: 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
    return colors[status] || colors.upcoming
  }

  const getStatusText = (status) => {
    const texts = {
      upcoming: 'Upcoming',
      ongoing: 'Live Now',
      completed: 'Completed'
    }
    return texts[status] || 'Upcoming'
  }

  const getCardStatusColor = (status) => {
    const colors = {
      upcoming: 'from-yellow-500 to-amber-600',
      ongoing: 'from-green-500 to-emerald-600',
      completed: 'from-gray-500 to-gray-600'
    }
    return colors[status] || colors.upcoming
  }

  useEffect(() => {
    fetchTournaments()
  }, [])

  useEffect(() => {
    filterTournaments()
  }, [searchTerm, activeFilter, tournaments])

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      
      const { data: tournamentsData, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTournaments(tournamentsData || [])
      
      // Set featured tournaments (first 3 with highest prize pools)
      const featured = [...tournamentsData]
        .sort((a, b) => (b.prize_pool?.winner || 0) - (a.prize_pool?.winner || 0))
        .slice(0, 3)
      setFeaturedTournaments(featured)

    } catch (error) {
      console.error('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTournaments = () => {
    let filtered = tournaments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tournament =>
        tournament.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tournament.game_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === activeFilter)
    }

    setFilteredTournaments(filtered)
  }

  const nextFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === featuredTournaments.length - 1 ? 0 : prev + 1
    )
  }

  const prevFeatured = () => {
    setCurrentFeaturedIndex((prev) => 
      prev === 0 ? featuredTournaments.length - 1 : prev - 1
    )
  }

  // Auto-rotate featured tournaments
  useEffect(() => {
    if (featuredTournaments.length > 1) {
      const interval = setInterval(nextFeatured, 5000)
      return () => clearInterval(interval)
    }
  }, [featuredTournaments.length])

  return (
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>{seoData.title}</title>
        <meta name="title" content={seoData.title} />
        <meta name="description" content={seoData.description} />
        <meta name="keywords" content={seoData.keywords} />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="RushX.Live" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seoData.canonical} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={seoData.canonical} />
        <meta property="og:title" content={seoData.title} />
        <meta property="og:description" content={seoData.description} />
        <meta property="og:image" content={seoData.ogImage} />
        <meta property="og:site_name" content="RushX.Live - Elite Esports Platform" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={seoData.canonical} />
        <meta property="twitter:title" content={seoData.title} />
        <meta property="twitter:description" content={seoData.description} />
        <meta property="twitter:image" content={seoData.ogImage} />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-20">
        {/* Animated Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Hero Section with Featured Tournaments */}
          <FeaturedTournaments 
            tournaments={featuredTournaments}
            currentIndex={currentFeaturedIndex}
            onNext={nextFeatured}
            onPrev={prevFeatured}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            router={router}
          />

          {/* Main Content */}
          <main className="container mx-auto px-4 py-12">
            {/* Header */}
            <header className="text-center mb-12">
              <h1 className="text-3xl lg:text-6xl font-bold text-white mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                  Esports Tournaments
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Compete in the most thrilling e-sports tournaments. Show your skills, win massive prize pools, and become a champion.
              </p>
            </header>

            {/* SEO Content Section - Added for better crawling */}
            <section className="max-w-6xl mx-auto mb-16 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Premier Esports Tournaments Platform
                  </h2>
                  <div className="space-y-4 text-gray-300 text-lg">
                    <p>
                      <strong>RushX.Live</strong> is India's leading platform for competitive esports tournaments. 
                      We host daily competitions across popular games like <strong>Free Fire</strong>, <strong>BGMI</strong>, 
                      and <strong>Valorant</strong> with guaranteed prize pools and professional organization.
                    </p>
                    <p>
                      Whether you're a casual player or aspiring pro, our tournaments provide the perfect 
                      stage to showcase your skills, compete against the best, and earn real rewards.
                    </p>
                    <div className="flex flex-wrap gap-4 mt-6">
                      <div className="flex items-center space-x-2 text-cyan-400">
                        <FaTrophy className="w-5 h-5" />
                        <span>Guaranteed Prize Pools</span>
                      </div>
                      <div className="flex items-center space-x-2 text-green-400">
                        <FaUsers className="w-5 h-5" />
                        <span>Thousands of Players</span>
                      </div>
                      <div className="flex items-center space-x-2 text-purple-400">
                        <FaGamepad className="w-5 h-5" />
                        <span>Multiple Games</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl p-6 border border-cyan-500/20">
                  <h3 className="text-xl font-bold text-white mb-4">Why Choose RushX Tournaments?</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-center space-x-3">
                      <FaCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Instant prize distribution within 24 hours</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <FaCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Fair play with anti-cheat monitoring</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <FaCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>24/7 customer support</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <FaCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Real-time tournament updates</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <FaCheck className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>Secure payment processing</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Popular Games Section - SEO Keywords */}
            <section className="max-w-4xl mx-auto mb-16 text-center">
              <h2 className="text-2xl font-bold text-white mb-8">Popular Tournament Games</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Free Fire', matches: '50+ Tournaments', color: 'from-red-500 to-orange-500' },
                  { name: 'BGMI', matches: '45+ Tournaments', color: 'from-blue-500 to-cyan-500' },
                  { name: 'Valorant', matches: '30+ Tournaments', color: 'from-red-500 to-pink-500' },
                  { name: 'Call of Duty', matches: '25+ Tournaments', color: 'from-gray-500 to-gray-700' }
                ].map((game, index) => (
                  <div key={index} className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <FaGamepad className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-white font-bold mb-2">{game.name}</h3>
                    
                  </div>
                ))}
              </div>
            </section>

            {/* Search and Filter Section */}
            <section className="mb-8" aria-label="Tournament search and filters">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-2xl w-full">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search tournaments by name or game..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                    aria-label="Search tournaments"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Tournament status filters">
                  {[
                    { id: 'all', label: 'All', icon: <FaGamepad className="w-4 h-4 sm:w-5 sm:h-5" /> },
                    { id: 'upcoming', label: 'Upcoming', icon: <FaRegClock className="w-4 h-4 sm:w-5 sm:h-5" /> },
                    { id: 'ongoing', label: 'Live', icon: <FaFire className="w-4 h-4 sm:w-5 sm:h-5" /> },
                    { id: 'completed', label: 'Completed', icon: <GiTrophyCup className="w-4 h-4 sm:w-5 sm:h-5" /> }
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center justify-center space-x-1 sm:space-x-2 
                        px-2.5 py-1.5 sm:px-4 sm:py-3 rounded-lg sm:rounded-xl 
                        text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 
                        ${
                          activeFilter === filter.id
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-md sm:shadow-lg shadow-cyan-500/25'
                            : 'bg-gray-900/80 text-gray-300 border border-gray-700 hover:border-cyan-500/50'
                        }`}
                      aria-pressed={activeFilter === filter.id}
                    >
                      {filter.icon}
                      <span>{filter.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Tournaments Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20" aria-live="polite" aria-busy="true">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-cyan-400 font-semibold">Loading Tournaments...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-gray-300">
                    Showing <span className="text-cyan-400 font-bold">{filteredTournaments.length}</span> tournaments
                  </div>
                  <div className="flex items-center space-x-2 text-cyan-400">
                    <IoMdTrendingUp className="w-5 h-5" />
                    <span className="font-semibold">Real-time Updates</span>
                  </div>
                </div>

                {/* Tournaments Grid */}
                {filteredTournaments.length === 0 ? (
                  <div className="text-center py-20">
                    <GiTrophyCup className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">No Tournaments Found</h2>
                    <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setActiveFilter('all')
                      }}
                      className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <section aria-label="Tournaments list">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredTournaments.map((tournament) => (
                        <TournamentCard 
                          key={tournament.id} 
                          tournament={tournament} 
                          onJoin={() => router.push(`/tournaments/${tournament.slug}`)}
                          getStatusColor={getCardStatusColor}
                          getStatusText={getStatusText}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Bottom SEO Content */}
            <section className="max-w-4xl mx-auto mt-20 text-center">
              <div className="bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Ready to Compete in Esports Tournaments?
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  Join thousands of players who trust RushX.Live for the best competitive gaming experience. 
                  From <strong>Free Fire tournaments</strong> to <strong>BGMI championships</strong> and <strong>Valorant competitions</strong>, 
                  we offer something for every esports enthusiast.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-cyan-400">
                  <span>🎮 Free Fire Esports</span>
                  <span>🏆 BGMI Tournaments</span>
                  <span>⚡ Valorant Competitions</span>
                  <span>💰 Prize Pool Events</span>
                  <span>🏅 Competitive Gaming</span>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </>
  )
}

// Featured Tournaments Component (Hero Section)
const FeaturedTournaments = ({ tournaments, currentIndex, onNext, onPrev, getStatusColor, getStatusText, router }) => {
  if (tournaments.length === 0) {
    return (
      <section className="relative h-96 lg:h-[600px] bg-gradient-to-r from-cyan-900/20 to-purple-900/20 flex items-center justify-center" aria-label="Featured tournaments">
        <div className="text-center">
          <GiTrophyCup className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Featured Tournaments</h1>
          <p className="text-gray-400">Amazing tournaments coming soon!</p>
        </div>
      </section>
    )
  }

  const currentTournament = tournaments[currentIndex]

  return (
    <section className="relative h-[500px] sm:h-96 lg:h-[600px] overflow-hidden" aria-label="Featured tournament">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{ 
          backgroundImage: `url(${currentTournament.banner_urls?.[0] || '/default-banner.jpg'})`,
          transform: 'scale(1.1)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>
      </div>

      {/* Navigation Arrows */}
      {tournaments.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all duration-300 z-20"
            aria-label="Previous tournament"
          >
            <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={onNext}
            className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:text-white hover:bg-cyan-500/20 transition-all duration-300 z-20"
            aria-label="Next tournament"
          >
            <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-4xl w-full">
          {/* Status Badge - Adjusted for mobile */}
          <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-6">
            <span
              className={`${getStatusColor(
                currentTournament.status
              )} text-white px-3 py-1.5 rounded-full font-bold text-xs sm:text-sm`}
            >
              {getStatusText(currentTournament.status)}
            </span>

            <span className="text-cyan-400 font-semibold flex items-center space-x-1 text-xs sm:text-sm">
              <FaFire className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Featured</span>
            </span>
          </div>

          {/* Title - Adjusted text size for mobile */}
          <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
            {currentTournament.title}
          </h1>

          {/* Description - Adjusted for mobile */}
          <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl line-clamp-2 sm:line-clamp-none">
            {currentTournament.description}
          </p>

          {/* Quick Stats - Adjusted spacing for mobile */}
          <div className="flex flex-wrap gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="flex items-center space-x-1 sm:space-x-2 text-white">
              <FaTrophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
              <span className="font-semibold text-sm sm:text-base">
                ₹{(
                  (currentTournament.prize_pool?.winner || 0) +
                  (currentTournament.prize_pool?.runnerUp || 0) +
                  (currentTournament.prize_pool?.thirdPlace || 0) +
                  (currentTournament.prize_pool?.fourthPlace || 0) +
                  (currentTournament.prize_pool?.fifthPlace || 0)
                ).toLocaleString()}
              </span>
              <span className="text-gray-400 text-xs sm:text-sm">Prize</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-white">
              <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
              <span className="font-semibold text-sm sm:text-base">{currentTournament.current_participants}/{currentTournament.max_participants}</span>
              <span className="text-gray-400 text-xs sm:text-sm">Players</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 text-white">
              <FaGamepad className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="font-semibold text-sm sm:text-base">{currentTournament.game_name}</span>
            </div>
          </div>

          {/* CTA Buttons - Stack vertically on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-4">
            <button
              onClick={() => router.push(`/tournaments/${currentTournament.slug}`)}
              className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 
                bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold 
                rounded-xl sm:rounded-2xl 
                text-sm sm:text-base 
                hover:shadow-xl hover:shadow-cyan-500/25 transform hover:scale-105 
                transition-all duration-300 w-full sm:w-auto text-center"
            >
              Join Tournament – ₹{currentTournament.joining_fee}
            </button>

            <button
              onClick={() => router.push(`/tournaments/${currentTournament.slug}`)}
              className="px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 
                border border-cyan-500/50 text-cyan-400 font-bold 
                rounded-xl sm:rounded-2xl 
                text-sm sm:text-base 
                hover:bg-cyan-500/10 transition-all duration-300 w-full sm:w-auto text-center"
            >
              View Details
            </button>
          </div>
        </div>
      </div>

      {/* Indicators - Adjusted position for mobile */}
      {tournaments.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20" aria-label="Featured tournament navigation">
          {tournaments.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeaturedIndex(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-cyan-400 scale-125' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to tournament ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Tournament Card Component
const TournamentCard = ({ tournament, onJoin, getStatusColor, getStatusText }) => {
  const isTournamentFull = tournament.current_participants >= tournament.max_participants
  const prizePool = tournament.prize_pool || {}

  return (
    <article className="group bg-gray-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-500 transform hover:-translate-y-2">
      {/* Tournament Banner */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={tournament.banner_urls?.[0] || '/default-banner.jpg'} 
          alt={`${tournament.title} - ${tournament.game_name} tournament banner`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span className={`bg-gradient-to-r ${getStatusColor(tournament.status)} text-white px-3 py-1 rounded-full text-xs font-bold`}>
            {getStatusText(tournament.status)}
          </span>
        </div>

        {/* Prize Pool Badge */}
        <div className="absolute top-4 right-4 bg-yellow-500/20 backdrop-blur-xl border border-yellow-500/30 rounded-xl px-3 py-2">
          <div className="flex items-center space-x-1">
            <FaTrophy className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">
              ₹{(
                (prizePool.winner || 0) +
                (prizePool.runnerUp || 0) +
                (prizePool.thirdPlace || 0) +
                (prizePool.fourthPlace || 0) +
                (prizePool.fifthPlace || 0)
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Participants */}
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center space-x-2 text-white">
            <FaUsers className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold">
              {tournament.current_participants}/{tournament.max_participants}
            </span>
            {isTournamentFull && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">FULL</span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        {/* Game Name */}
        <div className="flex items-center space-x-2 mb-3">
          <FaGamepad className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 font-semibold text-sm">{tournament.game_name}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-cyan-400 transition-colors duration-300">
          {tournament.title}
        </h2>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {tournament.description}
        </p>

        {/* Tournament Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-300">
              <FaCalendarAlt className="w-4 h-4 text-green-400" />
              <span className="text-sm">Starts</span>
            </div>
            <span className="text-white text-sm font-semibold">
              {new Date(tournament.schedule?.start_date).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-300">
              <FaClock className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Registration</span>
            </div>
            <span className="text-white text-sm font-semibold">
              {new Date(tournament.schedule?.registration_end).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-300">
              <GiTrophyCup className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">Entry Fee</span>
            </div>
            <span className="text-cyan-400 text-sm font-bold">₹{tournament.joining_fee}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onJoin}
            disabled={tournament.status !== 'upcoming' || isTournamentFull}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed text-center"
            aria-label={`Join ${tournament.title} tournament`}
          >
            {isTournamentFull ? 'Tournament Full' : 'Join Now'}
          </button>
          <button
            onClick={onJoin}
            className="px-4 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-500/10 transition-all duration-300 flex items-center justify-center"
            aria-label={`View details for ${tournament.title}`}
          >
            <FaEye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  )
}

export default TournamentsPage