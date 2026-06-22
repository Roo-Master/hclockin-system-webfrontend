import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DepartmentRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

const fetchDepartments = async (): Promise<DepartmentRecord[]> => {
  const res = await fetch('/api/departments', {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch departments')
  
  return res.json()
}

const fetchDepartmentById = async (id: number): Promise<DepartmentRecord> => {
  const res = await fetch(`/api/departments/${id}`, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch department')
  
  return res.json()
}

const createDepartment = async (data: Omit<DepartmentRecord, 'id'>): Promise<DepartmentRecord> => {
  const res = await fetch('/api/departments', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create department')
  }
  
  return res.json()
}

const updateDepartment = async (id: number, data: Partial<DepartmentRecord>): Promise<DepartmentRecord> => {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update department')
  }
  
  return res.json()
}

const deleteDepartment = async (id: number): Promise<void> => {
  const res = await fetch(`/api/departments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete department')
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
    staleTime: 10 * 60 * 1000,
  })
}

export function useDepartment(id: number) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: () => fetchDepartmentById(id),
    enabled: !!id,
  })
}

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<DepartmentRecord> }) => 
      updateDepartment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}