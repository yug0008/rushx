import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function AuthCallback() {
  const router = useRouter()
  const { initialized, user } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('🔁 Handling Supabase OAuth callback...')

        // This automatically parses access_token from the URL hash
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Error getting session:', error)
          router.replace('/') // redirect to home since no login page exists
          return
        }

        if (data?.session) {
          console.log('✅ Session restored, user logged in!')
          // After login success, redirect to homepage or wherever you want
          router.replace('/')
        } else {
          console.warn('⚠️ No session found, returning to home...')
          router.replace('/')
        }
      } catch (err) {
        console.error('❌ Auth callback failed:', err)
        router.replace('/')
      }
    }

    handleCallback()
  }, [router])

  // If AuthContext already has user, redirect early
  useEffect(() => {
    if (initialized && user) {
      console.log('🔐 User already logged in via context, redirecting...')
      router.replace('/')
    }
  }, [initialized, user, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="text-center">
        <h2 className="text-cyan-400 text-2xl font-semibold mb-2">Finalizing login...</h2>
        <p className="text-gray-400">Please wait while we connect your account.</p>
      </div>
    </div>
  )
}
