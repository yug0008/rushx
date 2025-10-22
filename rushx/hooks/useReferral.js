// hooks/useReferral.js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useReferral = (code) => {
  const [isValid, setIsValid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [referralData, setReferralData] = useState(null)

  useEffect(() => {
    const validateReferral = async () => {
      if (!code || code.length < 3) {
        setIsValid(null)
        return
      }

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('referral_codes')
          .select('*')
          .eq('code', code.toUpperCase())
          .eq('is_active', true)
          .single()

        if (error) throw error
        
        setIsValid(!!data)
        setReferralData(data)
      } catch (error) {
        console.error('Error validating referral:', error)
        setIsValid(false)
        setReferralData(null)
      } finally {
        setLoading(false)
      }
    }

    validateReferral()
  }, [code])

  return { isValid, loading, referralData }
}