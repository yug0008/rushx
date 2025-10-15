// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      
      // Create/update user profile in database when user signs in
      if (currentUser && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        await createOrUpdateUserProfile(currentUser)
      }
      
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Function to create or update user profile in 'users' table
  const createOrUpdateUserProfile = async (user) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned (user doesn't exist)
        console.error('Error fetching user:', fetchError)
        return
      }

      if (!existingUser) {
        // User doesn't exist, create new profile
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: user.id,
              email: user.email,
              username: user.user_metadata?.username || user.email?.split('@')[0],
              gamer_tag: user.user_metadata?.gamer_tag || user.user_metadata?.full_name || 'Player',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          ])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          console.log('User profile created successfully')
        }
      } else {
        // User exists, update profile if needed
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: user.email,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)

        if (updateError) {
          console.error('Error updating user profile:', updateError)
        }
      }
    } catch (error) {
      console.error('Error in createOrUpdateUserProfile:', error)
    }
  }

  // Sign up function
  const signUp = async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: metadata.username,
            gamer_tag: metadata.gamer_tag,
            full_name: metadata.username
          }
        }
      })
      
      if (error) throw error
      
      // User profile will be created automatically in onAuthStateChange
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      
      if (error) throw error
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}