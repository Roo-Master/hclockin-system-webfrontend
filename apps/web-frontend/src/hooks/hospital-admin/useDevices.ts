// src/hooks/hospital-admin/useDevices.ts
import { useState, useEffect } from 'react'
import { Device } from '@/types/hospital-admin/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useDevices() {
  const [data, setData] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDevices() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/devices', {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch devices')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDevices()
    
    // Refetch every 60 seconds
    const interval = setInterval(fetchDevices, 60000)
    return () => clearInterval(interval)
  }, [])

  return { data, isLoading, error }
}

export function useSyncDevice() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: string) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/devices/${id}/sync`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to sync device')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}