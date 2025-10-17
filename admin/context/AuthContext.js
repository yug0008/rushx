import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const mountedRef = useRef(true)

  // Safe timeout function that returns proper structure
  const withSafeTimeout = async (promise, ms, operationName) => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      )
      
      const result = await Promise.race([promise, timeoutPromise])
      return result
    } catch (error) {
      console.warn(`⚠️ ${operationName} timed out or failed:`, error.message)
      // Return a structure that matches what Supabase would return
      return { data: null, error }
    }
  }

  const checkAdminStatus = async (user) => {
    try {
      console.log('👮 Checking admin status for user:', user.id)
      
      const result = await withSafeTimeout(
        supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single(),
        10000,
        'Check admin status'
      )

      // Safely destructure the result
      const { data: profile, error } = result || { data: null, error: null }

      if (error) {
        console.error('❌ Admin check error:', error)
        setIsAdmin(false)
        return
      }

      const adminStatus = profile?.is_admin || false
      console.log('✅ Admin status:', adminStatus)
      setIsAdmin(adminStatus)
      
      // Redirect non-admin users trying to access admin pages
      if (!adminStatus && router.pathname.startsWith('/admin') && router.pathname !== '/admin/auth') {
        console.log('🚫 Non-admin user accessing admin, redirecting...')
        router.push('/admin/auth')
      }
    } catch (error) {
      console.error('❌ Admin status check failed:', error)
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    mountedRef.current = true

    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing admin auth...')

        // Get initial session without timeout for critical operation
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Session get error:', error)
        }

        console.log('📋 Current session:', session ? 'Exists' : 'None')

        if (mountedRef.current) {
          setUser(session?.user ?? null)
          
          if (session?.user) {
            await checkAdminStatus(session.user)
          } else {
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        if (mountedRef.current) {
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setInitialized(true)
          console.log('✅ Admin auth initialization complete')
        }
      }
    }

    initializeAuth()

    // Enhanced auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🎭 Admin auth state change:', event, session?.user?.id)
        
        if (!mountedRef.current) return

        try {
          setUser(session?.user ?? null)

          if (session?.user) {
            await checkAdminStatus(session.user)
          } else {
            setIsAdmin(false)
            
            // Redirect to admin auth if signed out and on admin page
            if (router.pathname.startsWith('/admin') && router.pathname !== '/admin/auth') {
              console.log('🚪 User signed out, redirecting to admin auth')
              router.push('/admin/auth')
            }
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error)
          if (mountedRef.current) {
            setUser(null)
            setIsAdmin(false)
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up admin auth listener')
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [router])

  // Handle route protection
  useEffect(() => {
    if (!initialized || loading) return

    // Protect admin routes
    if (router.pathname.startsWith('/admin') && router.pathname !== '/admin/auth') {
      if (!user || !isAdmin) {
        console.log('🚫 Unauthorized access to admin, redirecting...')
        router.push('/admin/auth')
      }
    }
  }, [user, isAdmin, router.pathname, initialized, loading, router])

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Admin sign in attempt:', email)
      
      const result = await withSafeTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
        'Admin signin'
      )

      // Safely destructure the result
      const { data, error } = result || { data: null, error: null }
      
      if (error) {
        console.error('❌ Admin sign in failed:', error)
        throw error
      }
      
      console.log('✅ Admin sign in successful')
      
      // Check admin status after sign in
      if (data?.user) {
        await checkAdminStatus(data.user)
      }
      
      return data
    } catch (error) {
      console.error('❌ Admin sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Admin sign out')
      
      const result = await withSafeTimeout(
        supabase.auth.signOut(),
        10000,
        'Admin signout'
      )

      // Safely destructure the result
      const { error } = result || { error: null }
      
      if (error) throw error
      
      if (mountedRef.current) {
        setIsAdmin(false)
      }
      
      console.log('✅ Admin sign out successful')
      router.push('/admin/auth')
    } catch (error) {
      console.error('❌ Admin sign out failed:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔄 Refreshing admin session...')
      
      const result = await withSafeTimeout(
        supabase.auth.refreshSession(),
        15000,
        'Refresh admin session'
      )

      // Safely destructure the result
      const { data: { session }, error } = result || { data: { session: null }, error: null }

      if (error) {
        console.error('❌ Admin session refresh error:', error)
        throw error
      }

      if (mountedRef.current && session) {
        setUser(session.user)
        await checkAdminStatus(session.user)
        console.log('✅ Admin session refreshed successfully')
      }

      return { session, error: null }
    } catch (error) {
      console.error('❌ Admin session refresh failed:', error)
      return { session: null, error }
    }
  }

  const value = {
    user,
    isAdmin,
    signIn,
    signOut,
    refreshSession,
    loading: loading || !initialized,
    initialized
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}