import { useQuery } from '@tanstack/react-query'
import client from './client'
import { useStreakStore } from '../store/streakStore'

export const useXPData = (options = {}) =>
  useQuery({
    queryKey: ['xp'],
    queryFn: () => client.get('/api/v1/xp/').then(r => r.data.data),
    staleTime: 30 * 1000,
    ...options,
  })

export const useStreak = (options = {}) =>
  useQuery({
    queryKey: ['streak'],
    queryFn: () => client.get('/api/v1/streak/').then(r => {
      const data = r.data.data
      useStreakStore.getState().setStreak(data)
      return data
    }),
    staleTime: 60 * 1000,
    ...options,
  })

export const useLeaderboard = () =>
  useQuery({
    queryKey: ['leaderboard'],
    queryFn: () =>
      client.get('/api/v1/leaderboard/').then(r => r.data.data),
    staleTime: 3 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000
  })

export const useMyStats = () =>
  useQuery({
    queryKey: ['my-stats'],
    queryFn: () => client.get('/api/v1/me/stats/').then(r => r.data.data),
    staleTime: 30 * 1000,
  })

export const useBadges = () =>
  useQuery({
    queryKey: ['badges'],
    queryFn: () => client.get('/api/v1/badges/').then(r => r.data.data),
    staleTime: 2 * 60 * 1000
  })
