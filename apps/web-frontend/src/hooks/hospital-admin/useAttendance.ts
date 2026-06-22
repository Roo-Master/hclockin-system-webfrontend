// src/hooks/hospital-admin/useAttendance.ts
import { useState, useEffect } from 'react'
import { AttendancePoint, HeatmapMatrix, CellStatus } from '@/types/hospital-admin/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface AttendanceFilters {
  employeeId?: number
  department?: string
  startDate?: string
  endDate?: string
}

export function useAttendance(filters?: AttendanceFilters) {
  const [data, setData] = useState<AttendancePoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchAttendance() {
      try {
        setIsLoading(true)
        const searchParams = new URLSearchParams()
        if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
        if (filters?.department) searchParams.set('department', filters.department)
        if (filters?.startDate) searchParams.set('startDate', filters.startDate)
        if (filters?.endDate) searchParams.set('endDate', filters.endDate)
        
        const url = `/api/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch attendance')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendance()
  }, [filters?.employeeId, filters?.department, filters?.startDate, filters?.endDate])

  return { data, isLoading, error }
}

export function useHeatmap(employeeId: number, month: string) {
  const [data, setData] = useState<HeatmapMatrix>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!employeeId || !month) return

    async function fetchHeatmap() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/attendance/heatmap?employeeId=${employeeId}&month=${month}`, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch heatmap')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeatmap()
  }, [employeeId, month])

  return { data, isLoading, error }
}

export function useMarkAttendance() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: any) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to mark attendance')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}