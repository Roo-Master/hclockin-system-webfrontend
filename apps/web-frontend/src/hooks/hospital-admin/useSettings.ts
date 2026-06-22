import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HospitalSettings } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

const fetchSettings = async (): Promise<HospitalSettings> => {
  const res = await fetch('/api/settings', {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch settings')
  
  return res.json()
}

const updateSettings = async (data: Partial<HospitalSettings>): Promise<HospitalSettings> => {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update settings')
  }
  
  return res.json()
}

const resetSettings = async (): Promise<HospitalSettings> => {
  const res = await fetch('/api/settings/reset', {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to reset settings')
  }
  
  return res.json()
}

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 10 * 60 * 1000,
  })
}

export function useUpdateSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export function useResetSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: resetSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}