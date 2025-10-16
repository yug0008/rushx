import { useState, useEffect, useRef } from 'react'

export const useSupabaseQuery = (queryFn, dependencies = []) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const executeQuery = async () => {
    if (!mountedRef.current) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await queryFn()
      
      if (mountedRef.current) {
        setData(result)
        setError(null)
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message)
        console.error('Query error:', err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    executeQuery()
  }, dependencies)

  return { data, loading, error, refetch: executeQuery }
}