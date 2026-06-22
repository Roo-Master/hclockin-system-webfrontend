import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AttendancePoint, HeatmapMatrix, CellStatus } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface AttendanceFilters {
  employeeId?: number
  department?: string
  startDate?: string
  endDate?: string
}

interface AttendanceRecord {
  id: number
  employeeId: number
  date: string
  status: CellStatus
  checkIn?: string
  checkOut?: string
}

interface MarkAttendanceData {
  employeeId: number
  date: string
  status: CellStatus
  checkIn?: string
  checkOut?: string
}

const fetchAttendance = async (filters?: AttendanceFilters): Promise<AttendancePoint[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
  if (filters?.department) searchParams.set('department', filters.department)
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  
  const url = `/api/attendance${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch attendance')
  
  return res.json()
}

const fetchHeatmap = async (employeeId: number, month: string): Promise<HeatmapMatrix> => {
  const res = await fetch(`/api/attendance/heatmap?employeeId=${employeeId}&month=${month}`, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch heatmap')
  
  return res.json()
}

const fetchAttendanceRecords = async (filters?: AttendanceFilters): Promise<AttendanceRecord[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
  if (filters?.department) searchParams.set('department', filters.department)
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  
  const url = `/api/attendance/records${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch attendance records')
  
  return res.json()
}

const markAttendance = async (data: MarkAttendanceData): Promise<AttendanceRecord> => {
  const res = await fetch('/api/attendance', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to mark attendance')
  }
  
  return res.json()
}

const bulkMarkAttendance = async (data: MarkAttendanceData[]): Promise<void> => {
  const res = await fetch('/api/attendance/bulk', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to mark attendance')
  }
}

export function useAttendance(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => fetchAttendance(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useHeatmap(employeeId: number, month: string) {
  return useQuery({
    queryKey: ['heatmap', employeeId, month],
    queryFn: () => fetchHeatmap(employeeId, month),
    enabled: !!employeeId && !!month,
    staleTime: 5 * 60 * 1000,
  })
}

export function useAttendanceRecords(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendanceRecords', filters],
    queryFn: () => fetchAttendanceRecords(filters),
    staleTime: 2 * 60 * 1000,
  })
}

export function useMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] })
      queryClient.invalidateQueries({ queryKey: ['heatmap'] })
    },
  })
}

export function useBulkMarkAttendance() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: bulkMarkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] })
      queryClient.invalidateQueries({ queryKey: ['attendanceRecords'] })
      queryClient.invalidateQueries({ queryKey: ['heatmap'] })
    },
  })
}