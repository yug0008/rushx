import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  FaTimes, 
  FaGoogle, 
  FaEnvelope, 
  FaLock, 
  FaUser,
  FaEye,
  FaEyeSlash,
  FaGamepad
} from 'react-icons/fa'
import { GiTrophyCup } from 'react-icons/gi'

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    gamerTag: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const { signIn, signUp, signInWithGoogle } = useAuth()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
        setMessage({ type: 'success', text: 'Welcome back, champion!' })
        setTimeout(() => onClose(), 1500)
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          username: formData.username,
          gamer_tag: formData.gamerTag
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Account created! Check your email to verify.' })
        
        // Reset form after successful signup
        setFormData({
          email: '',
          password: '',
          username: '',
          gamerTag: ''
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      setMessage({ type: 'error', text: error.message })
    }
    setLoading(false)
  }

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-md transform transition-all duration-500 scale-95 hover:scale-100">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-600/10 to-cyan-500/10 rounded-2xl blur-xl"></div>
        
        <div className="relative bg-gray-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden">
          {/* Header */}
          <div className="relative p-6 border-b border-cyan-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <GiTrophyCup className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">
                    {isLogin ? 'Welcome Back' : 'Join The Arena'}
                  </h2>
                  <p className="text-cyan-400 text-sm">
                    {isLogin ? 'Continue your journey' : 'Become a champion'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-300"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <FaGoogle className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-1 border-t border-gray-700"></div>
              <span className="px-4 text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-700"></div>
            </div>

            {/* Sign Up Fields */}
            {!isLogin && (
              <div className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                  />
                </div>
                <div className="relative">
                  <FaGamepad className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                  <input
                    type="text"
                    name="gamerTag"
                    placeholder="Gamer Tag"
                    value={formData.gamerTag}
                    onChange={handleInputChange}
                    required={!isLogin}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 transition-colors duration-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors duration-300"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>

            {/* Message */}
            {message.text && (
              <div className={`p-3 rounded-xl text-sm font-semibold text-center ${
                message.type === 'error' 
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {message.text}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>

            {/* Toggle Auth Mode */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-semibold"
              >
                {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AuthModal