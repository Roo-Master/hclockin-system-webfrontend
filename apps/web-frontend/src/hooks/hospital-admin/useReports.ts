import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ReportItem } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface ReportFilters {
  category?: string
  type?: 'pdf' | 'xlsx' | 'csv'
  startDate?: string
  endDate?: string
}

interface GenerateReportData {
  title: string
  category: string
  type: 'pdf' | 'xlsx' | 'csv'
  filters: any
}

const fetchReports = async (filters?: ReportFilters): Promise<ReportItem[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.category) searchParams.set('category', filters.category)
  if (filters?.type) searchParams.set('type', filters.type)
  if (filters?.startDate) searchParams.set('startDate', filters.startDate)
  if (filters?.endDate) searchParams.set('endDate', filters.endDate)
  
  const url = `/api/reports${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch reports')
  
  return res.json()
}

const generateReport = async (data: GenerateReportData): Promise<Blob> => {
  const res = await fetch('/api/reports/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to generate report')
  }
  
  return res.blob()
}

const downloadReport = async (id: number): Promise<Blob> => {
  const res = await fetch(`/api/reports/${id}/download`, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to download report')
  
  return res.blob()
}

const deleteReport = async (id: number): Promise<void> => {
  const res = await fetch(`/api/reports/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete report')
}

export function useReports(filters?: ReportFilters) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => fetchReports(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGenerateReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: downloadReport,
  })
}

export function useDeleteReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
  })
}