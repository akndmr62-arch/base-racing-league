import { create } from 'zustand'

interface GameState {
  currentSeason: number
  currentWeek: number
  isLoading: boolean
  leaderboard: any[]
  userStats: any | null
  setSeason: (season: number) => void
  setWeek: (week: number) => void
  setLoading: (loading: boolean) => void
  setLeaderboard: (board: any[]) => void
  setUserStats: (stats: any) => void
}

export const useGameStore = create<GameState>((set) => ({
  currentSeason: 1,
  currentWeek: 1,
  isLoading: true,
  leaderboard: [],
  userStats: null,
  setSeason: (season) => set({ currentSeason: season }),
  setWeek: (week) => set({ currentWeek: week }),
  setLoading: (loading) => set({ isLoading: loading }),
  setLeaderboard: (board) => set({ leaderboard: board }),
  setUserStats: (stats) => set({ userStats: stats }),
}))
