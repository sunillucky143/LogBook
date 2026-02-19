import { create } from 'zustand'
import { endpoints } from '../services/api'


interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  role: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  fetchUser: (api: any) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async (api) => {
    set({ isLoading: true, error: null })
    try {
      const user = await api.get(endpoints.auth.me)
      set({ user, isLoading: false })
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err)
      set({ error: err.message, isLoading: false })
    }
  },
}))
