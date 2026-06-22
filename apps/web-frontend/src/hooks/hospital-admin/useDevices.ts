import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Device, DeviceStatus } from '@/data/types'
import { getAuthHeaders } from '@/lib/hospital-admin/auth-headers'

interface CreateDeviceData {
  name: string
  location: string
  firmware: string
  ip: string
}

const fetchDevices = async (): Promise<Device[]> => {
  const res = await fetch('/api/devices', {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch devices')
  
  return res.json()
}

const fetchDeviceById = async (id: string): Promise<Device> => {
  const res = await fetch(`/api/devices/${id}`, {
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to fetch device')
  
  return res.json()
}

const createDevice = async (data: CreateDeviceData): Promise<Device> => {
  const res = await fetch('/api/devices', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to create device')
  }
  
  return res.json()
}

const updateDevice = async (id: string, data: Partial<Device>): Promise<Device> => {
  const res = await fetch(`/api/devices/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to update device')
  }
  
  return res.json()
}

const deleteDevice = async (id: string): Promise<void> => {
  const res = await fetch(`/api/devices/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  if (!res.ok) throw new Error('Failed to delete device')
}

const syncDevice = async (id: string): Promise<void> => {
  const res = await fetch(`/api/devices/${id}/sync`, {
    method: 'POST',
    headers: getAuthHeaders(),
  })
  
  if (res.status === 401) throw new Error('Unauthorized')
  if (res.status === 403) throw new Error('Forbidden')
  
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Failed to sync device')
  }
}

export function useDevices() {
  return useQuery({
    queryKey: ['devices'],
    queryFn: fetchDevices,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}

export function useDevice(id: string) {
  return useQuery({
    queryKey: ['devices', id],
    queryFn: () => fetchDeviceById(id),
    enabled: !!id,
  })
}

export function useCreateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useUpdateDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Device> }) => 
      updateDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      queryClient.invalidateQueries({ queryKey: ['devices', variables.id] })
    },
  })
}

export function useDeleteDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}

export function useSyncDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: syncDevice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
  })
}