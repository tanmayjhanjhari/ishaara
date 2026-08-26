import { useQuery } from '@tanstack/react-query'
import client from './client'

export const useLessonPath = () =>
  useQuery({
    queryKey: ['lesson-path'],
    queryFn: () =>
      client.get('/api/v1/lessons/?ordering=order_index').then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  })

export const useLessons = (filters = {}) =>
  useQuery({
    queryKey: ['lessons', filters],
    queryFn: () =>
      client.get('/api/v1/lessons/', { params: filters }).then(res => res.data.data),
    staleTime: 5 * 60 * 1000,
  })

export const useLesson = (id) =>
  useQuery({
    queryKey: ['lesson', id],
    queryFn: () =>
      client.get(`/api/v1/lessons/${id}/`).then(r => r.data.data),
    enabled:    !!id,
    staleTime:  10 * 60 * 1000,
    retry:      2,
    retryDelay: 1000,
  })
