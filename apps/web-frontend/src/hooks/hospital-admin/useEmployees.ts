// src/hooks/hospital-admin/useEmployees.ts
import { useState, useEffect } from 'react'
import { Employee } from '@/types/hospital-admin/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useEmployees(params?: { department?: string; search?: string }) {
  const [data, setData] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchEmployees() {
      try {
        setIsLoading(true)
        const searchParams = new URLSearchParams()
        if (params?.department && params.department !== 'all') {
          searchParams.set('department', params.department)
        }
        if (params?.search) {
          searchParams.set('search', params.search)
        }
        
        const url = `/api/employees${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
        const res = await fetch(url, {
          headers: getAuthHeaders(),
        })
        
        if (res.status === 401) throw new Error('Unauthorized')
        if (res.status === 403) throw new Error('Forbidden')
        if (!res.ok) throw new Error('Failed to fetch employees')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployees()
  }, [params?.department, params?.search])

  return { data, isLoading, error }
}

export function useEmployee(id: number) {
  const [data, setData] = useState<Employee | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchEmployee() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/employees/${id}`, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch employee')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEmployee()
  }, [id])

  return { data, isLoading, error }
}

export function useCreateEmployee() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: Omit<Employee, 'id'>) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to create employee')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useUpdateEmployee() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, data }: { id: number; data: Partial<Employee> }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to update employee')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDeleteEmployee() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to delete employee')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}