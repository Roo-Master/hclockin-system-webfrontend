// src/hooks/hospital-admin/useReports.ts
import { useState, useEffect } from 'react'
import { ReportItem } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface ReportFilters {
  category?: string
  type?: 'pdf' | 'xlsx' | 'csv'
  startDate?: string
  endDate?: string
}

export function useReports(filters?: ReportFilters) {
  const [data, setData] = useState<ReportItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true)
        const searchParams = new URLSearchParams()
        if (filters?.category) searchParams.set('category', filters.category)
        if (filters?.type) searchParams.set('type', filters.type)
        
        const url = `/api/reports${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch reports')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [filters?.category, filters?.type])

  return { data, isLoading, error }
}

export function useGenerateReport() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: any) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to generate report')
      return await res.blob()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDownloadReport() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/reports/${id}/download`, {
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to download report')
      return await res.blob()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}