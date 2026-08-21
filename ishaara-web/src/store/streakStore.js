import { create } from 'zustand'

export const useStreakStore = create((set) => ({
  currentStreak:  0,
  longestStreak:  0,
  lastActiveDate: null,
  isStreakDay:    false,

  setStreak: (data) => set({
    currentStreak:  data.current_streak,
    longestStreak:  data.longest_streak,
    lastActiveDate: data.last_active_date,
    isStreakDay: data.last_active_date === new Date().toISOString().split('T')[0]
  }),

  markActiveToday: (newStreak) => set({
    currentStreak:  newStreak,
    lastActiveDate: new Date().toISOString().split('T')[0],
    isStreakDay: true
  })
}))
