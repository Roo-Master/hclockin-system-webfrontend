// src/hooks/hospital-admin/useShiftScheduling.ts
import { useState, useEffect } from 'react'
import { ShiftTemplate } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useShiftTemplates() {
  const [data, setData] = useState<ShiftTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchShiftTemplates() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/shift-scheduling/templates', {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch shift templates')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchShiftTemplates()
  }, [])

  return { data, isLoading, error }
}

export function useCreateShiftTemplate() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: Omit<ShiftTemplate, 'id'>) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/shift-scheduling/templates', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to create shift template')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useUpdateShiftTemplate() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, data }: { id: number; data: Partial<ShiftTemplate> }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/shift-scheduling/templates/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to update shift template')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDeleteShiftTemplate() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/shift-scheduling/templates/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to delete shift template')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}