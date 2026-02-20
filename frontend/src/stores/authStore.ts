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
      // Retry once after a short delay (handles race condition on new signups)
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const user = await api.get(endpoints.auth.me)
        set({ user, isLoading: false, error: null })
      } catch (retryErr: any) {
        console.error('Retry failed:', retryErr)
        set({ error: 'Unable to load your profile. Please refresh the page.', isLoading: false })
      }
    }
  },
}))
