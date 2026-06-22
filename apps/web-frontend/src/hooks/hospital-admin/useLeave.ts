// src/hooks/hospital-admin/useLeave.ts
import { useState, useEffect } from 'react'
import { LeaveRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface LeaveFilters {
  status?: 'pending' | 'approved' | 'rejected'
  employeeId?: number
  department?: string
  startDate?: string
  endDate?: string
}

export function useLeaves(filters?: LeaveFilters) {
  const [data, setData] = useState<LeaveRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchLeaves() {
      try {
        setIsLoading(true)
        const searchParams = new URLSearchParams()
        if (filters?.status) searchParams.set('status', filters.status)
        if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
        if (filters?.department) searchParams.set('department', filters.department)
        
        const url = `/api/leave${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch leaves')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaves()
  }, [filters?.status, filters?.employeeId, filters?.department])

  return { data, isLoading, error }
}

export function useApproveLeave() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, status, note }: { id: number; status: 'approved' | 'rejected'; note?: string }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/leave/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, note }),
      })
      
      if (!res.ok) throw new Error('Failed to approve leave')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}