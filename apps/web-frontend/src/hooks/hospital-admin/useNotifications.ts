// src/hooks/hospital-admin/useNotifications.ts
import { useState, useEffect } from 'react'
import { AppNotification } from '@/types/hospital-admin/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useNotifications() {
  const [data, setData] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchNotifications() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/notifications', {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch notifications')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
    
    // Refetch every 60 seconds
    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  return { data, isLoading, error }
}

export function useMarkAsRead() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to mark as read')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useMarkAllAsRead() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async () => {
    setIsPending(true)
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'POST',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to mark all as read')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDeleteNotification() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to delete notification')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}