import { useEffect, useCallback } from 'react'
import { useTimerStore } from '../stores/timerStore'

export function useTimer() {
  const {
    isRunning,
    startTime,
    elapsedSeconds,
    sessionId,
    scheduledEndTime,
    setElapsedSeconds,
    startTimer,
    stopTimer,
    reset,
  } = useTimerStore()

  // Update elapsed seconds every second while running
  useEffect(() => {
    if (!isRunning || !startTime) return

    const updateElapsed = () => {
      const now = Date.now()
      const elapsed = Math.floor((now - startTime) / 1000)
      setElapsedSeconds(elapsed)
    }

    // Initial update
    updateElapsed()

    // Update every second
    const interval = setInterval(updateElapsed, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime, setElapsedSeconds])

  // Check for scheduled end time
  useEffect(() => {
    if (!isRunning || !scheduledEndTime) return

    const now = Date.now()
    if (now >= scheduledEndTime) {
      stopTimer()
      return
    }

    const timeout = setTimeout(() => {
      stopTimer()
    }, scheduledEndTime - now)

    return () => clearTimeout(timeout)
  }, [isRunning, scheduledEndTime, stopTimer])

  // Format elapsed seconds to display string
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':')
  }, [])

  // Format elapsed seconds to human readable string
  const formatTimeHuman = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)

    if (hours === 0) {
      return `${minutes}m`
    }
    return `${hours}h ${minutes}m`
  }, [])

  return {
    isRunning,
    elapsedSeconds,
    sessionId,
    scheduledEndTime,
    formattedTime: formatTime(elapsedSeconds),
    formattedTimeHuman: formatTimeHuman(elapsedSeconds),
    start: startTimer,
    stop: stopTimer,
    reset,
    formatTime,
    formatTimeHuman,
  }
}
