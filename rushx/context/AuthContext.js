import { createContext, useContext, useState, useEffect, useRef } from 'react'
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
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)
  const mountedRef = useRef(true)

  // Safe timeout function that doesn't break the auth flow
  const withSafeTimeout = (promise, ms, operationName) => {
    return new Promise(async (resolve, reject) => {
      const timeoutId = setTimeout(() => {
        console.warn(`⚠️ ${operationName} timed out after ${ms}ms, but continuing...`)
        // Don't reject, just let it continue
        resolve(null) // Return null instead of rejecting
      }, ms)

      try {
        const result = await promise
        clearTimeout(timeoutId)
        resolve(result)
      } catch (error) {
        clearTimeout(timeoutId)
        reject(error)
      }
    })
  }

  useEffect(() => {
    mountedRef.current = true
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Initializing auth...')

        // Don't use timeout for initial session check - it's critical
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session get error:', error)
          // Don't throw, just continue with null session
        }

        console.log('📋 Current session:', currentSession ? 'Exists' : 'None')

        if (mountedRef.current) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          
          if (currentSession?.user) {
            // Don't wait for profile creation, it's not critical
            createOrUpdateUserProfile(currentSession.user).catch(console.error)
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        // Don't reset state on error, just continue
      } finally {
        if (mountedRef.current) {
          setLoading(false)
          setInitialized(true)
          console.log('✅ Auth initialization complete')
        }
      }
    }

    initializeAuth()

    // Enhanced auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('🎭 Auth state change:', event, currentSession?.user?.id)
        
        if (!mountedRef.current) return

        try {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)

          switch (event) {
            case 'SIGNED_IN':
            case 'TOKEN_REFRESHED':
            case 'USER_UPDATED':
              if (currentSession?.user) {
                createOrUpdateUserProfile(currentSession.user).catch(console.error)
              }
              break
            case 'SIGNED_OUT':
              console.log('🚪 User signed out, clearing state')
              setSession(null)
              setUser(null)
              break
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error)
        }
      }
    )

    return () => {
      console.log('🧹 Cleaning up auth listener')
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  const createOrUpdateUserProfile = async (user) => {
    try {
      console.log('👤 Creating/updating user profile:', user.id)
      
      // Use timeout for profile operations but don't fail on timeout
      const { data: existingUser, error: fetchError } = await withSafeTimeout(
        supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single(),
        8000,
        'Fetch user profile'
      )

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching user:', fetchError)
        return
      }

      const userData = {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'Player',
        gamer_tag: user.user_metadata?.gamer_tag || user.user_metadata?.full_name || 'Player',
        updated_at: new Date().toISOString()
      }

      if (!existingUser) {
        userData.created_at = new Date().toISOString()
        const { error: insertError } = await withSafeTimeout(
          supabase.from('users').insert([userData]),
          8000,
          'Create user profile'
        )

        if (insertError) {
          console.error('❌ Error creating user profile:', insertError)
        } else {
          console.log('✅ User profile created')
        }
      } else {
        const { error: updateError } = await withSafeTimeout(
          supabase
            .from('users')
            .update(userData)
            .eq('id', user.id),
          8000,
          'Update user profile'
        )

        if (updateError) {
          console.error('❌ Error updating user profile:', updateError)
        }
      }
    } catch (error) {
      console.error('❌ Error in createOrUpdateUserProfile:', error)
    }
  }

  const refreshSession = async () => {
    try {
      console.log('🔄 Manually refreshing session...')
      
      // Use longer timeout for session refresh
      const { data: { session: currentSession }, error } = await withSafeTimeout(
        supabase.auth.refreshSession(),
        15000,
        'Refresh session'
      )

      if (error) {
        console.error('❌ Session refresh error:', error)
        throw error
      }

      if (mountedRef.current && currentSession) {
        setSession(currentSession)
        setUser(currentSession.user)
        console.log('✅ Session refreshed successfully')
      }

      return { session: currentSession, error: null }
    } catch (error) {
      console.error('❌ Session refresh failed:', error)
      return { session: null, error }
    }
  }

  const signUp = async (email, password, metadata = {}) => {
    try {
      console.log('📝 Signing up user:', email)
      
      const { data, error } = await withSafeTimeout(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: metadata.username,
              gamer_tag: metadata.gamer_tag,
              full_name: metadata.username
            }
          }
        }),
        20000, // Longer timeout for signup
        'User signup'
      )
      
      if (error) throw error
      console.log('✅ Sign up successful')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Sign up failed:', error)
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Signing in user:', email)
      
      const { data, error } = await withSafeTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        15000,
        'User signin'
      )
      
      if (error) throw error
      console.log('✅ Sign in successful')
      return { data, error: null }
    } catch (error) {
      console.error('❌ Sign in failed:', error)
      return { data: null, error }
    }
  }

  const signInWithGoogle = async () => {
    try {
      console.log('🔐 Signing in with Google')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: `${window.location.origin}/auth/callback`
        },
      })
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('❌ Google sign in failed:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🚪 Signing out user')
      
      const { error } = await withSafeTimeout(
        supabase.auth.signOut(),
        10000,
        'User signout'
      )
      
      if (error) throw error
      
      if (mountedRef.current) {
        setSession(null)
        setUser(null)
      }
      
      console.log('✅ Sign out successful')
    } catch (error) {
      console.error('❌ Sign out failed:', error)
      throw error
    }
  }

  const value = {
    user,
    session,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    refreshSession,
    loading,
    initialized
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}