import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  isDarkMode: boolean
  isSidebarOpen: boolean
  toggleDarkMode: () => void
  toggleSidebar: () => void
  closeSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isDarkMode: window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
      isSidebarOpen: false,
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      closeSidebar: () => set({ isSidebarOpen: false }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
)
