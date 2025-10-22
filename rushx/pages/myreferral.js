import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  FaUsers, 
  FaGift, 
  FaCopy, 
  FaShareAlt, 
  FaWhatsapp, 
  FaDiscord, 
  FaTwitter,
  FaCheckCircle,
  FaClock,
  FaTimes,
  FaMoneyBillWave,
  FaTrophy,
  FaUserPlus,
  FaPercentage
} from 'react-icons/fa'
import { GiCash } from 'react-icons/gi'
import { IoMdAlert } from 'react-icons/io'

const MyReferralPage = () => {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState('')
  const [referralStats, setReferralStats] = useState({
    totalUses: 0,
    successfulUses: 0,
    pendingUses: 0,
    totalEarnings: 0,
    pendingEarnings: 0
  })
  const [referralUsage, setReferralUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (user && !dataLoaded) {
      loadReferralData()
    }
  }, [user, dataLoaded])

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
  }

  const loadReferralData = async () => {
    try {
      setLoading(true)

      // Get or create referral code for user
      let { data: existingCode, error: codeError } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (codeError && codeError.code === 'PGRST116') {
        // No code exists, create one
        const newCode = generateReferralCode()
        
        // Check if the generated code already exists (unlikely but possible)
        const { data: existingWithSameCode } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('code', newCode)
          .single()

        let finalCode = newCode
        if (existingWithSameCode) {
          // If code exists, generate a new one (very rare case)
          finalCode = generateReferralCode()
        }

        const { data: newReferralCode, error: createError } = await supabase
          .from('referral_codes')
          .insert({
            user_id: user.id,
            code: finalCode,
            discount_percentage: 10,
            commission_percentage: 10,
            is_active: true,
            max_uses: 1000 // Unlimited uses
          })
          .select()
          .single()

        if (createError) {
          // If there's a unique constraint violation, try one more time
          if (createError.code === '23505') {
            const retryCode = generateReferralCode()
            const { data: retryReferralCode, error: retryError } = await supabase
              .from('referral_codes')
              .insert({
                user_id: user.id,
                code: retryCode,
                discount_percentage: 10,
                commission_percentage: 10,
                is_active: true,
                max_uses: 1000
              })
              .select()
              .single()

            if (retryError) throw retryError
            setReferralCode(retryReferralCode.code)
          } else {
            throw createError
          }
        } else {
          setReferralCode(newReferralCode.code)
        }
      } else if (codeError) {
        throw codeError
      } else {
        // Use existing code
        setReferralCode(existingCode.code)
      }

      setDataLoaded(true)

    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReferralStats = async () => {
    if (!referralCode) return
    
    try {
      // Get all referral uses
      const { data: allUses, error } = await supabase
        .from('referral_usage')
        .select(`
          *,
          tournament:tournament_id (
            joining_fee,
            title
          ),
          enrollment:tournament_enrollments!referral_usage_enrollment_id_fkey (
            payment_status
          )
        `)
        .eq('referral_code', referralCode)

      if (error) throw error

      const successfulUses = allUses?.filter(use => 
        use.enrollment?.payment_status === 'completed'
      ) || []

      const pendingUses = allUses?.filter(use => 
        use.enrollment?.payment_status === 'pending'
      ) || []

      // Calculate earnings (10% of joining fee for successful referrals)
      const totalEarnings = successfulUses.reduce((total, use) => {
        return total + (use.tournament.joining_fee * 0.1)
      }, 0)

      const pendingEarnings = pendingUses.reduce((total, use) => {
        return total + (use.tournament.joining_fee * 0.1)
      }, 0)

      setReferralStats({
        totalUses: allUses?.length || 0,
        successfulUses: successfulUses.length,
        pendingUses: pendingUses.length,
        totalEarnings: totalEarnings,
        pendingEarnings: pendingEarnings
      })

    } catch (error) {
      console.error('Error loading referral stats:', error)
    }
  }

  const loadReferralUsage = async () => {
    if (!referralCode) return
    
    try {
      const { data, error } = await supabase
        .from('referral_usage')
        .select(`
          *,
          tournament:tournament_id (
            title,
            joining_fee,
            game_name
          ),
          user:used_by (
            username,
            gamer_tag
          ),
          enrollment:tournament_enrollments!referral_usage_enrollment_id_fkey (
            payment_status,
            created_at
          )
        `)
        .eq('referral_code', referralCode)
        .order('used_at', { ascending: false })

      if (error) throw error
      setReferralUsage(data || [])
    } catch (error) {
      console.error('Error loading referral usage:', error)
    }
  }

  // Load stats and usage when referral code is available
  useEffect(() => {
    if (referralCode) {
      loadReferralStats()
      loadReferralUsage()
    }
  }, [referralCode])

  const copyReferralCode = () => {
    const referralLink = `${window.location.origin}/tournaments?ref=${referralCode}`
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareReferral = (platform) => {
    const message = `Join esports tournaments with my referral code! Use code ${referralCode} to get 10% OFF on all tournament entry fees. ${window.location.origin}/tournaments?ref=${referralCode}`
    
    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`,
      discord: `https://discord.com/channels/@me?text=${encodeURIComponent(message)}`
    }

    window.open(urls[platform], '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-400 font-semibold">Loading Referral Program...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-purple-900/30 pt-16">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Your Referral Program</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Share your code and earn 10% commission on every successful referral. 
            Your friends get 10% OFF too!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Referral Code Card */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <FaGift className="w-6 h-6 text-cyan-400" />
                <span>Your Referral Code</span>
              </h2>
              
              <div className="space-y-6">
                {/* Code Display */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 border border-cyan-500/30 rounded-xl p-6 text-center">
                  <div className="text-gray-300 mb-2">Share this code with friends</div>
                  <div className="text-4xl font-bold text-cyan-400 font-mono mb-4">
                    {referralCode}
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="flex items-center space-x-2 mx-auto px-6 py-3 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300"
                  >
                    <FaCopy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy Referral Link'}</span>
                  </button>
                </div>

                {/* Share Buttons */}
                <div>
                  <h3 className="text-white font-semibold mb-4">Share via</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => shareReferral('whatsapp')}
                      className="flex items-center justify-center space-x-2 p-4 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={() => shareReferral('discord')}
                      className="flex items-center justify-center space-x-2 p-4 bg-blue-500/20 border border-blue-500/50 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                    >
                      <FaDiscord className="w-5 h-5" />
                      <span>Discord</span>
                    </button>
                    <button
                      onClick={() => shareReferral('twitter')}
                      className="flex items-center justify-center space-x-2 p-4 bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-all duration-300"
                    >
                      <FaTwitter className="w-5 h-5" />
                      <span>Twitter</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Usage History */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <FaUsers className="w-6 h-6 text-cyan-400" />
                <span>Referral History</span>
              </h2>

              <div className="space-y-4">
                {referralUsage.length > 0 ? (
                  referralUsage.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-colors duration-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold">
                            {usage.user?.username || 'Unknown User'}
                          </h3>
                          {usage.enrollment?.payment_status === 'completed' ? (
                            <span className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                              <FaCheckCircle className="w-3 h-3" />
                              <span>Success</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">
                              <FaClock className="w-3 h-3" />
                              <span>Pending</span>
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm">
                          Joined: {usage.tournament?.title}
                        </div>
                        <div className="text-cyan-400 text-sm">
                          {usage.tournament?.game_name} • ₹{usage.tournament?.joining_fee}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-bold">
                          ₹{(usage.tournament?.joining_fee * 0.1).toFixed(0)}
                        </div>
                        <div className="text-gray-400 text-sm">Earnings</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {new Date(usage.used_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FaUserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-400 mb-4">No one has used your referral code yet.</p>
                    <p className="text-cyan-400 text-sm">
                      Share your code to start earning commissions!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Stats */}
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <GiCash className="w-6 h-6 text-cyan-400" />
                <span>Referral Stats</span>
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <FaUsers className="w-5 h-5 text-cyan-400" />
                    <span className="text-gray-300">Total Referrals</span>
                  </div>
                  <span className="text-white font-bold text-xl">
                    {referralStats.totalUses}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-500/20 rounded-xl border border-green-500/30">
                  <div className="flex items-center space-x-3">
                    <FaCheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-gray-300">Successful</span>
                  </div>
                  <span className="text-green-400 font-bold text-xl">
                    {referralStats.successfulUses}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-yellow-500/20 rounded-xl border border-yellow-500/30">
                  <div className="flex items-center space-x-3">
                    <FaClock className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300">Pending</span>
                  </div>
                  <span className="text-yellow-400 font-bold text-xl">
                    {referralStats.pendingUses}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <div className="flex items-center space-x-3">
                    <FaMoneyBillWave className="w-5 h-5 text-purple-400" />
                    <span className="text-gray-300">Total Earnings</span>
                  </div>
                  <span className="text-purple-400 font-bold text-xl">
                    ₹{referralStats.totalEarnings.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <div className="flex items-center space-x-3">
                    <FaPercentage className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300">Pending Earnings</span>
                  </div>
                  <span className="text-blue-400 font-bold text-xl">
                    ₹{referralStats.pendingEarnings.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <span>Share your referral code with friends</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <span>Friends get 10% OFF tournament entry fees</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <span>You earn 10% commission when they complete payment</span>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="bg-cyan-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <span>Earnings are credited after payment verification</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-purple-600/10 rounded-2xl border border-cyan-500/30 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Benefits</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-cyan-400">
                  <FaPercentage className="w-4 h-4" />
                  <span className="text-sm">10% commission per successful referral</span>
                </div>
                <div className="flex items-center space-x-3 text-green-400">
                  <FaGift className="w-4 h-4" />
                  <span className="text-sm">Friends get 10% discount</span>
                </div>
                <div className="flex items-center space-x-3 text-purple-400">
                  <FaMoneyBillWave className="w-4 h-4" />
                  <span className="text-sm">Real-time earnings tracking</span>
                </div>
                <div className="flex items-center space-x-3 text-yellow-400">
                  <FaTrophy className="w-4 h-4" />
                  <span className="text-sm">Unlimited referral potential</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyReferralPage