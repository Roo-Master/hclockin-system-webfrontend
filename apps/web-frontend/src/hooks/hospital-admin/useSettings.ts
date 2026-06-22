// src/hooks/hospital-admin/useSettings.ts
import { useState, useEffect } from 'react'
import { HospitalSettings } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useSettings() {
  const [data, setData] = useState<HospitalSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/settings', {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch settings')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { data, isLoading, error }
}

export function useUpdateSettings() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: Partial<HospitalSettings>) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to update settings')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}