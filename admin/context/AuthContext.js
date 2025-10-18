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
  const authCheckInProgress = useRef(false)

  // Simple timeout that doesn't break the flow
  const withSafeTimeout = (promise, ms, operationName) => {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn(`⚠️ ${operationName} timed out after ${ms}ms`)
        resolve({ data: null, error: new Error('Operation timed out') })
      }, ms)

      try {
        const result = await promise
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        resolve({ data: null, error })
      }
    })
  }

  const checkAdminStatus = async (user) => {
    if (!user || !mountedRef.current) {
      return false
    }

    // Prevent multiple simultaneous admin checks
    if (authCheckInProgress.current) {
      return false
    }

    authCheckInProgress.current = true

    try {
      console.log('👮 Checking admin status for user:', user.id)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('❌ Admin check error:', error)
        if (mountedRef.current) {
          setIsAdmin(false)
        }
        return false
      }

      const adminStatus = !!profile?.is_admin
      console.log('✅ Admin status:', adminStatus)
      
      if (mountedRef.current) {
        setIsAdmin(adminStatus)
      }
      
      return adminStatus
    } catch (error) {
      console.error('❌ Admin status check failed:', error)
      if (mountedRef.current) {
        setIsAdmin(false)
      }
      return false
    } finally {
      authCheckInProgress.current = false
    }
  }

  // Initialize auth only once
  useEffect(() => {
    mountedRef.current = true
    let retryCount = 0
    const maxRetries = 3

    const initializeAuth = async () => {
      if (!mountedRef.current) return

      try {
        console.log('🔄 Initializing admin auth...')
        setLoading(true)

        // Get session without timeout for initial load
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Session get error:', error)
          throw error
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
        
        // Retry logic for initial auth
        if (retryCount < maxRetries && mountedRef.current) {
          retryCount++
          console.log(`🔄 Retrying auth initialization (${retryCount}/${maxRetries})...`)
          setTimeout(initializeAuth, 1000 * retryCount)
          return
        }

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

    // Auth state change listener with debouncing
    let authStateChangeInProgress = false
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current || authStateChangeInProgress) return
        
        authStateChangeInProgress = true
        console.log('🎭 Admin auth state change:', event, session?.user?.id)

        try {
          // Update user state immediately
          if (mountedRef.current) {
            setUser(session?.user ?? null)
          }

          switch (event) {
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
              if (session?.user) {
                await checkAdminStatus(session.user)
                
                // If we're on auth page and user is admin, redirect to admin dashboard
                if (router.pathname === '/admin/auth' && mountedRef.current) {
                  const adminStatus = await checkAdminStatus(session.user)
                  if (adminStatus) {
                    router.push('/admin')
                  }
                }
              }
              break
              
            case 'SIGNED_OUT':
              console.log('🚪 User signed out, clearing admin state')
              if (mountedRef.current) {
                setIsAdmin(false)
                setUser(null)
              }
              
              // Redirect to admin auth if on admin page
              if (router.pathname.startsWith('/admin') && router.pathname !== '/admin/auth') {
                router.push('/admin/auth')
              }
              break
              
            case 'USER_UPDATED':
              if (session?.user) {
                await checkAdminStatus(session.user)
              }
              break
              
            default:
              if (session?.user) {
                await checkAdminStatus(session.user)
              } else if (mountedRef.current) {
                setIsAdmin(false)
              }
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error)
        } finally {
          authStateChangeInProgress = false
        }
      }
    )

    // Handle browser tab focus/visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current && user) {
        // Tab became active, refresh session
        console.log('🔍 Tab became active, refreshing auth state...')
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (mountedRef.current && session?.user) {
            checkAdminStatus(session.user)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      console.log('🧹 Cleaning up admin auth listener')
      mountedRef.current = false
      authCheckInProgress.current = false
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  // Route protection effect - simplified
  useEffect(() => {
    if (!initialized || loading) return

    const currentPath = router.pathname
    
    // Only protect admin routes (excluding auth page)
    if (currentPath.startsWith('/admin') && currentPath !== '/admin/auth') {
      if (!user || !isAdmin) {
        console.log('🚫 Unauthorized access to admin, redirecting...')
        router.push('/admin/auth')
      }
    }
    
    // Redirect authenticated admins from auth page to dashboard
    if (currentPath === '/admin/auth' && user && isAdmin) {
      console.log('✅ Admin authenticated, redirecting to dashboard...')
      router.push('/admin')
    }
  }, [user, isAdmin, router.pathname, initialized, loading, router])

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Admin sign in attempt:', email)
      
      const { data, error } = await withSafeTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
        'Admin signin'
      )
      
      if (error) throw error
      
      console.log('✅ Admin sign in successful')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Admin sign in failed:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Admin sign out')
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      console.log('✅ Admin sign out successful')
      
      // State will be updated by auth state change listener
      router.push('/admin/auth')
    } catch (error) {
      console.error('❌ Admin sign out failed:', error)
      throw error
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔄 Manually refreshing admin session...')
      
      const { data: { session }, error } = await withSafeTimeout(
        supabase.auth.refreshSession(),
        10000,
        'Refresh admin session'
      )

      if (error) throw error

      if (mountedRef.current && session?.user) {
        await checkAdminStatus(session.user)
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
    loading: !initialized || loading,
    initialized
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}