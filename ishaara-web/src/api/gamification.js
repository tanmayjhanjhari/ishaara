import { useQuery } from '@tanstack/react-query'
import client from './client'

export const useLeaderboard = () =>
  useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => client.get('/api/v1/leaderboard/').then(r => r.data.data),
    staleTime: 60 * 1000,
  })

export const useMyStats = () =>
  useQuery({
    queryKey: ['my-stats'],
    queryFn: () => client.get('/api/v1/me/stats/').then(r => r.data.data),
    staleTime: 30 * 1000,
  })
