import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TimerState {
  isRunning: boolean
  startTime: number | null
  elapsedSeconds: number
  sessionId: string | null
  scheduledEndTime: number | null

  // Actions
  startTimer: (sessionId: string, startTime?: number) => void
  stopTimer: () => void
  setElapsedSeconds: (seconds: number) => void
  setScheduledEndTime: (timestamp: number | null) => void
  reset: () => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      isRunning: false,
      startTime: null,
      elapsedSeconds: 0,
      sessionId: null,
      scheduledEndTime: null,

      startTimer: (sessionId, startTime) =>
        set({
          isRunning: true,
          startTime: startTime ?? Date.now(),
          sessionId,
          elapsedSeconds: 0,
        }),

      stopTimer: () =>
        set({
          isRunning: false,
          scheduledEndTime: null,
        }),

      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),

      setScheduledEndTime: (timestamp) => set({ scheduledEndTime: timestamp }),

      reset: () =>
        set({
          isRunning: false,
          startTime: null,
          elapsedSeconds: 0,
          sessionId: null,
          scheduledEndTime: null,
        }),
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({
        isRunning: state.isRunning,
        startTime: state.startTime,
        sessionId: state.sessionId,
        scheduledEndTime: state.scheduledEndTime,
      }),
    }
  )
)
