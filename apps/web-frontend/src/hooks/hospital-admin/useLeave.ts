import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LeaveRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface LeaveFilters {
  status?: 'pending' | 'approved' | 'rejected'
  employeeId?: number
  department?: string
  startDate?: string
  endDate?: string
}

interface CreateLeaveData {
  employeeId: number
  type: string
  from: string
  to: string
  reason?: string
}

const fetchLeaves = async (filters?: LeaveFilters): Promise<LeaveRecord[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.status) searchParams.set('status', filters.status)
  if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
  if (filters?.department) searchParams.set('department', filters.department)
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  
  const url = `/api/leave${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch leaves')
  
  return res.json()
}

const createLeave = async (data: CreateLeaveData): Promise<LeaveRecord> => {
  const res = await fetch('/api/leave', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create leave request')
  }
  
  return res.json()
}

const approveLeave = async (id: number, status: 'approved' | 'rejected', note?: string): Promise<LeaveRecord> => {
  const res = await fetch(`/api/leave/${id}/approve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, note }),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to approve leave')
  }
  
  return res.json()
}

const deleteLeave = async (id: number): Promise<void> => {
  const res = await fetch(`/api/leave/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete leave')
}

export function useLeaves(filters?: LeaveFilters) {
  return useQuery({
    queryKey: ['leaves', filters],
    queryFn: () => fetchLeaves(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
  })
}

export function useApproveLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: number; status: 'approved' | 'rejected'; note?: string }) => 
      approveLeave(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
  })
}

export function useDeleteLeave() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaves'] })
    },
  })
}