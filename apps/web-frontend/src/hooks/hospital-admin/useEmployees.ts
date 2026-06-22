import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Employee } from '@/data/types'
import { getAuthHeaders, handleAuthError } from '@/lib/hospital-admin/auth-headers'

const fetchEmployees = async (params?: { 
  department?: string
  search?: string 
}): Promise<Employee[]> => {
  const searchParams = new URLSearchParams()
  if (params?.department && params.department !== 'all') {
    searchParams.set('department', params.department)
  }
  if (params?.search) {
    searchParams.set('search', params.search)
  }
  
  const url = `/api/employees${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(), // ← AUTH ADDED
  })
  
  
  if (res.status === 401) {
    throw new Error('Unauthorized: Please login')
  }
  if (res.status === 403) {
    throw new Error('Forbidden: You don\'t have permission')
  }
  
  if (!res.ok) {
    throw new Error('Failed to fetch employees')
  }
  
  return res.json()
}

const fetchEmployeeById = async (id: number): Promise<Employee> => {
  const res = await fetch(`/api/employees/${id}`, {
    headers: getAuthHeaders(), // ← AUTH ADDED
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch employee')
  
  return res.json()
}

const createEmployee = async (data: Omit<Employee, 'id'>): Promise<Employee> => {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: getAuthHeaders(), // ← AUTH ADDED
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create employee')
  }
  
  return res.json()
}

const updateEmployee = async (id: number, data: Partial<Employee>): Promise<Employee> => {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(), // ← AUTH ADDED
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update employee')
  }
  
  return res.json()
}

const deleteEmployee = async (id: number): Promise<void> => {
  const res = await fetch(`/api/employees/${id}`, { 
    method: 'DELETE',
    headers: getAuthHeaders(), // ← AUTH ADDED
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete employee')
}

export function useEmployees(params?: { department?: string; search?: string }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: () => fetchEmployees(params),
    retry: (failureCount, error) => {
      
      if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
        return false
      }
      return failureCount < 3
    },
  })
}

export function useEmployee(id: number) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployeeById(id),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Employee> }) => 
      updateEmployee(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
      queryClient.invalidateQueries({ queryKey: ['employees', variables.id] })
    },
  })
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] })
    },
  })
}