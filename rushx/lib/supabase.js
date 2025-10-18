import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'tournament-app'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// -----------------------------
// Email Subscription Function
// -----------------------------
export const subscribeEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .insert([
        { 
          email: email,
          subscribed_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error subscribing email:', error)
    return { data: null, error }
  }
}
