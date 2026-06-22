// src/hooks/hospital-admin/usePayroll.ts
import { useState, useEffect } from 'react'
import { PayrollRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface PayrollFilters {
  month?: string
  department?: string
  employeeId?: number
}

export function usePayroll(filters?: PayrollFilters) {
  const [data, setData] = useState<PayrollRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchPayroll() {
      try {
        setIsLoading(true)
        const searchParams = new URLSearchParams()
        if (filters?.month) searchParams.set('month', filters.month)
        if (filters?.department) searchParams.set('department', filters.department)
        if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
        
        const url = `/api/payroll${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch payroll')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchPayroll()
  }, [filters?.month, filters?.department, filters?.employeeId])

  return { data, isLoading, error }
}

export function useGeneratePayroll() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: { month: string; departments?: string[] }) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to generate payroll')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}