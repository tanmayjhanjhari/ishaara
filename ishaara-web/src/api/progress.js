import { useMutation, useQuery } from '@tanstack/react-query'
import client from './client'

export const useSubmitAttempt = () =>
  useMutation({
    mutationFn: (data) =>
      client.post('/api/v1/attempts/', data).then(r => r.data.data),
  })

export const useCompleteLesson = () =>
  useMutation({
    mutationFn: ({ lessonId, accuracy }) =>
      client
        .post(`/api/v1/progress/lessons/${lessonId}/complete/`, { accuracy })
        .then(r => r.data.data),
  })

export const useProgressSummary = () =>
  useQuery({
    queryKey: ['progress'],
    queryFn:  () =>
      client.get('/api/v1/progress/').then(r => r.data.data),
    staleTime: 60 * 1000,
  })

export const useAttemptHistory = (signId) =>
  useQuery({
    queryKey: ['attempts', signId],
    queryFn:  () =>
      client
        .get('/api/v1/attempts/history/', {
          params: signId ? { sign_id: signId } : {},
        })
        .then(r => r.data.data),
    enabled: true,
  })
