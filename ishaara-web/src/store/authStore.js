import { create } from 'zustand'

const TOKEN_KEY   = 'ishaara_access_token'
const REFRESH_KEY = 'ishaara_refresh_token'
const USER_KEY    = 'ishaara_user'

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  initialize: () => {
    const token   = localStorage.getItem(TOKEN_KEY)
    const refresh = localStorage.getItem(REFRESH_KEY)
    const user    = localStorage.getItem(USER_KEY)
    if (token && user) {
      set({
        accessToken: token,
        refreshToken: refresh,
        user: JSON.parse(user),
        isAuthenticated: true,
      })
    }
  },

  login: (data) => {
    const { access, refresh, user } = data
    localStorage.setItem(TOKEN_KEY,   access)
    localStorage.setItem(REFRESH_KEY, refresh)
    localStorage.setItem(USER_KEY,    JSON.stringify(user))
    set({ accessToken: access, refreshToken: refresh, user, isAuthenticated: true })
  },

  updateToken: (newAccessToken) => {
    localStorage.setItem(TOKEN_KEY, newAccessToken)
    set({ accessToken: newAccessToken })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
  },
}))

// Keep default export for backward compat with existing imports
export default useAuthStore
