import { useMutation, useQuery } from '@tanstack/react-query'
import client from './client'

export const useRegister = () =>
  useMutation({
    mutationFn: (data) =>
      client.post('/api/v1/auth/register/', data).then(res => res.data),
  })

export const useLogin = () =>
  useMutation({
    mutationFn: (data) =>
      client.post('/api/v1/auth/login/', data).then(res => res.data),
  })

export const useLogout = () =>
  useMutation({
    mutationFn: (data) =>
      client.post('/api/v1/auth/logout/', data).then(res => res.data),
  })

export const useMe = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => client.get('/api/v1/users/me/').then(res => res.data),
    enabled: false, // only fetch when explicitly called
  })

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () =>
      client.get('/api/v1/dashboard/').then(r => r.data.data),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true
  })

