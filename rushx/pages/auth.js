import { useState, useEffect } from 'react'
import Head from 'next/head'
import AuthModal from '../components/AuthModal'

const AuthPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before showing modal to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = () => {
    setIsModalOpen(false)
    // Optional: Redirect to home after closing modal
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }, 300)
  }

  // Show nothing until mounted to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Sign In | RUSHX ESPORTS</title>
        <meta name="description" content="Sign in or create your RushX account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-purple-900/20 to-cyan-900/20"></div>
        
        {/* Animated Background Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          {/* Header Section */}
          <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white">
                RushX<span className="text-cyan-400">Esports</span>
              </h1>
            </div>
            
            <h2 className="text-xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Join the Ultimate Gaming Community
            </h2>
            <p className="text-gray-300 text-sm sm:text-base sm:text-lg max-w-md mx-auto leading-relaxed">
              Compete with players worldwide, track your stats, and climb the leaderboards. Your journey to becoming a champion starts here.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-6xl mx-auto w-full">
            {[
              {
                icon: '🏆',
                title: 'Compete & Win',
                description: 'Join tournaments and climb the global rankings'
              },
              {
                icon: '📊',
                title: 'Track Stats',
                description: 'Monitor your performance with detailed analytics'
              },
              {
                icon: '👥',
                title: 'Build Teams',
                description: 'Create or join teams with players worldwide'
              },
              {
                icon: '🎮',
                title: 'Multiple Games',
                description: 'Support for all your favorite games'
              },
              {
                icon: '⚡',
                title: 'Live Matches',
                description: 'Real-time match tracking and updates'
              },
              {
                icon: '🛡️',
                title: 'Secure',
                description: 'Your data and account are always protected'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4 sm:p-6 text-center hover:border-cyan-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{feature.icon}</div>
                <h3 className="text-white font-semibold text-sm sm:text-base mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="text-center max-w-2xl mx-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 sm:py-4 px-8 sm:px-12 rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 text-sm sm:text-base"
            >
              Get Started - It's Free
            </button>
            <p className="text-gray-400 text-xs sm:text-sm mt-4">
              Join thousands of gamers already competing
            </p>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 text-center">
            <p className="text-gray-500 text-xs">
              © 2024 RUSHX. All rights reserved.
            </p>
          </div>
        </div>

        {/* Auth Modal */}
        <AuthModal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal}
        />
      </div>
    </>
  )
}

export default AuthPage