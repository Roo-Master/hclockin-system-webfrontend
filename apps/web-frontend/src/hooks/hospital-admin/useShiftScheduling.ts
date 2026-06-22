import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShiftTemplate } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface ShiftFilters {
  department?: string
  employeeId?: number
  startDate?: string
  endDate?: string
}

interface ShiftAssignment {
  id: number
  employeeId: number
  shiftTemplateId: number
  date: string
  employee?: any
  shiftTemplate?: ShiftTemplate
}

interface AssignShiftData {
  employeeId: number
  shiftTemplateId: number
  date: string
}

const fetchShiftTemplates = async (): Promise<ShiftTemplate[]> => {
  const res = await fetch('/api/shift-scheduling/templates', {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch shift templates')
  
  return res.json()
}

const createShiftTemplate = async (data: Omit<ShiftTemplate, 'id'>): Promise<ShiftTemplate> => {
  const res = await fetch('/api/shift-scheduling/templates', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create shift template')
  }
  
  return res.json()
}

const updateShiftTemplate = async (id: number, data: Partial<ShiftTemplate>): Promise<ShiftTemplate> => {
  const res = await fetch(`/api/shift-scheduling/templates/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update shift template')
  }
  
  return res.json()
}

const deleteShiftTemplate = async (id: number): Promise<void> => {
  const res = await fetch(`/api/shift-scheduling/templates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete shift template')
}

const fetchShifts = async (filters?: ShiftFilters): Promise<ShiftAssignment[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.department) searchParams.set('department', filters.department)
  if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  
  const url = `/api/shift-scheduling${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch shifts')
  
  return res.json()
}

const assignShift = async (data: AssignShiftData): Promise<ShiftAssignment> => {
  const res = await fetch('/api/shift-scheduling/assign', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to assign shift')
  }
  
  return res.json()
}

const deleteShiftAssignment = async (id: number): Promise<void> => {
  const res = await fetch(`/api/shift-scheduling/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete shift assignment')
}

export function useShiftTemplates() {
  return useQuery({
    queryKey: ['shiftTemplates'],
    queryFn: fetchShiftTemplates,
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateShiftTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createShiftTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shiftTemplates'] })
    },
  })
}

export function useUpdateShiftTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShiftTemplate> }) => 
      updateShiftTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shiftTemplates'] })
    },
  })
}

export function useDeleteShiftTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteShiftTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shiftTemplates'] })
    },
  })
}

export function useShifts(filters?: ShiftFilters) {
  return useQuery({
    queryKey: ['shifts', filters],
    queryFn: () => fetchShifts(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useAssignShift() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: assignShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}

export function useDeleteShiftAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteShiftAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
    },
  })
}