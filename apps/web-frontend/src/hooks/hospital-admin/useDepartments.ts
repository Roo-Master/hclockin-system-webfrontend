// src/hooks/hospital-admin/useDepartments.ts
import { useState, useEffect } from 'react'
import { DepartmentRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

export function useDepartments() {
  const [data, setData] = useState<DepartmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchDepartments() {
      try {
        setIsLoading(true)
        const res = await fetch('/api/departments', {
          headers: getAuthHeaders(),
        })
        
        if (res.status === 401) throw new Error('Unauthorized')
        if (res.status === 403) throw new Error('Forbidden')
        if (!res.ok) throw new Error('Failed to fetch departments')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  return { data, isLoading, error }
}

export function useDepartment(id: number) {
  const [data, setData] = useState<DepartmentRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) return

    async function fetchDepartment() {
      try {
        setIsLoading(true)
        const res = await fetch(`/api/departments/${id}`, {
          headers: getAuthHeaders(),
        })
        
        if (!res.ok) throw new Error('Failed to fetch department')
        
        const result = await res.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchDepartment()
  }, [id])

  return { data, isLoading, error }
}

export function useCreateDepartment() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (data: Omit<DepartmentRecord, 'id'>) => {
    setIsPending(true)
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to create department')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useUpdateDepartment() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async ({ id, data }: { id: number; data: Partial<DepartmentRecord> }) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error('Failed to update department')
      return await res.json()
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}

export function useDeleteDepartment() {
  const [isPending, setIsPending] = useState(false)

  const mutateAsync = async (id: number) => {
    setIsPending(true)
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (!res.ok) throw new Error('Failed to delete department')
    } finally {
      setIsPending(false)
    }
  }

  return { mutateAsync, isPending }
}