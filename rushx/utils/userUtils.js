// utils/userUtils.js
import { supabase } from '../lib/supabase'

export const fetchUsers = async () => {
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, gamer_tag, created_at, avatar_url')
      .order('created_at', { ascending: false })

    if (usersError) throw usersError

    return { data: usersData, error: null }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error }
  }
}