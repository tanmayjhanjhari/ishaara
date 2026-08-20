import { create } from 'zustand'

export const useSessionStore = create((set, get) => ({
  lessonId:  null,
  signs:     [],
  signIndex: 0,
  scores:    [],

  startLesson: (lesson) => set({
    lessonId:  lesson.id,
    signs:     lesson.signs,
    signIndex: 0,
    scores:    []
  }),

  nextSign: () => set((state) => ({
    signIndex: state.signIndex + 1
  })),

  setSignIndex: (index) => set({
    signIndex: index
  }),

  recordScore: (score) => set((state) => ({
    scores: [...state.scores, score]
  })),

  resetSession: () => set({
    lessonId: null, signs: [], signIndex: 0, scores: []
  }),

  getCurrentSign: () => {
    const state = get()
    return state.signs[state.signIndex] || null
  },

  isComplete: () => {
    const state = get()
    return state.signs.length > 0 && state.signIndex >= state.signs.length
  },

  getAccuracy: () => {
    const { scores } = get()
    if (!scores.length) return null
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }
}))

// Default export for backward compat
export default useSessionStore
