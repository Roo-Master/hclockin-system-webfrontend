import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PayrollRecord } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface PayrollFilters {
  month?: string
  department?: string
  employeeId?: number
}

interface GeneratePayrollData {
  month: string
  departments?: string[]
}

const fetchPayroll = async (filters?: PayrollFilters): Promise<PayrollRecord[]> => {
  const searchParams = new URLSearchParams()
  if (filters?.month) searchParams.set('month', filters.month)
  if (filters?.department) searchParams.set('department', filters.department)
  if (filters?.employeeId) searchParams.set('employeeId', filters.employeeId.toString())
  
  const url = `/api/payroll${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch payroll')
  
  return res.json()
}

const generatePayroll = async (data: GeneratePayrollData): Promise<void> => {
  const res = await fetch('/api/payroll/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to generate payroll')
  }
}

const updatePayrollRecord = async (id: number, data: Partial<PayrollRecord>): Promise<PayrollRecord> => {
  const res = await fetch(`/api/payroll/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update payroll record')
  }
  
  return res.json()
}

const exportPayroll = async (filters?: PayrollFilters): Promise<Blob> => {
  const searchParams = new URLSearchParams()
  if (filters?.month) searchParams.set('month', filters.month)
  if (filters?.department) searchParams.set('department', filters.department)
  
  const url = `/api/payroll/export${searchParams.toString() ? `?${searchParams.toString()}` : ''}`
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to export payroll')
  
  return res.blob()
}

export function usePayroll(filters?: PayrollFilters) {
  return useQuery({
    queryKey: ['payroll', filters],
    queryFn: () => fetchPayroll(filters),
    staleTime: 5 * 60 * 1000,
  })
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generatePayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
  })
}

export function useUpdatePayrollRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PayrollRecord> }) => 
      updatePayrollRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] })
    },
  })
}

export function useExportPayroll() {
  return useMutation({
    mutationFn: exportPayroll,
  })
}