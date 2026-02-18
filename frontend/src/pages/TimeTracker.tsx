import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Play, Square, Clock, Loader2, CalendarClock, X, FileText, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import { useTimerStore } from '../stores/timerStore'
import { useApi, endpoints, ApiError } from '../services/api'
import type { TimeSession } from '../types/session'
import type { Document } from '../types/document'

export function TimeTracker() {
  const navigate = useNavigate()
  const {
    isRunning, elapsedSeconds, sessionId,
    scheduledEndTime, startTimer, stopTimer,
    setElapsedSeconds, setScheduledEndTime
  } = useTimerStore()
  const api = useApi()
  const apiRef = useRef(api)
  apiRef.current = api

  const [isLoading, setIsLoading] = useState(false)
  const [scheduleLoading, setScheduleLoading] = useState(false)
  const [todaySessions, setTodaySessions] = useState<TimeSession[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customHours, setCustomHours] = useState('')
  const [todayDocs, setTodayDocs] = useState<Document[]>([])

  // Format seconds to HH:MM:SS
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return [hours, minutes, seconds]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':')
  }

  // Format duration between two dates
  const formatDuration = (startTime: string, endTime: string | null): string => {
    const start = new Date(startTime).getTime()
    const end = endTime ? new Date(endTime).getTime() : Date.now()
    const durationSeconds = Math.floor((end - start) / 1000)
    return formatTime(durationSeconds)
  }

  // Format time for display (e.g., "9:30 AM")
  const formatTimeOfDay = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  // Fetch active session on mount to restore state
  const fetchActiveSession = useCallback(async () => {
    try {
      const session = await apiRef.current.get<TimeSession | null>(endpoints.time.active)
      if (session && session.status === 'active') {
        const startTimeMs = new Date(session.start_time).getTime()
        startTimer(session.id, startTimeMs)
        if (session.scheduled_end) {
          setScheduledEndTime(new Date(session.scheduled_end).getTime())
        }
      }
    } catch {
      // Ignore - user might not have an active session
    }
  }, [startTimer, setScheduledEndTime])

  // Get current week bounds (Monday – Sunday)
  const getWeekBounds = () => {
    const now = new Date()
    const day = now.getDay() // 0=Sun, 1=Mon, ...
    const diffToMon = day === 0 ? -6 : 1 - day
    const monday = new Date(now)
    monday.setDate(now.getDate() + diffToMon)
    monday.setHours(0, 0, 0, 0)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    return { from_date: fmt(monday), to_date: fmt(sunday) }
  }

  // Fetch this week's sessions and documents
  const fetchWeekSessions = useCallback(async () => {
    try {
      setSessionsLoading(true)
      const { from_date, to_date } = getWeekBounds()
      const [sessions, docs] = await Promise.all([
        apiRef.current.get<TimeSession[]>(endpoints.time.sessions, {
          params: { from_date, to_date, per_page: 20 },
        }),
        apiRef.current.get<Document[]>(endpoints.documents.list),
      ])
      setTodaySessions(sessions || [])
      setTodayDocs(docs || [])
    } catch {
      // Don't show error for session fetch
    } finally {
      setSessionsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActiveSession()
    fetchWeekSessions()
  }, [fetchActiveSession, fetchWeekSessions])

  // Update elapsed time when timer is running
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      const store = useTimerStore.getState()
      if (store.startTime) {
        const elapsed = Math.floor((Date.now() - store.startTime) / 1000)
        setElapsedSeconds(elapsed)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning, setElapsedSeconds])

  const handleStart = async () => {
    setError(null)
    setIsLoading(true)
    try {
      const session = await api.post<TimeSession>(endpoints.time.start, {})
      const startTimeMs = new Date(session.start_time).getTime()
      startTimer(session.id, startTimeMs)
      fetchWeekSessions()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStop = async () => {
    setError(null)
    setIsLoading(true)
    try {
      await api.post<TimeSession>(endpoints.time.stop, { session_id: sessionId })
      stopTimer()
      fetchWeekSessions()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to stop session')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSchedule = async (hours: number) => {
    if (!sessionId || hours <= 0 || hours > 24) return
    setError(null)
    setScheduleLoading(true)
    try {
      const scheduledEnd = new Date(Date.now() + hours * 3600 * 1000)
      await api.post<TimeSession>(endpoints.time.schedule, {
        session_id: sessionId,
        scheduled_end: scheduledEnd.toISOString(),
      })
      setScheduledEndTime(scheduledEnd.getTime())
      setCustomHours('')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to set schedule')
    } finally {
      setScheduleLoading(false)
    }
  }

  const handleCancelSchedule = async () => {
    if (!sessionId) return
    setError(null)
    setScheduleLoading(true)
    try {
      await api.delete(endpoints.time.scheduleById(sessionId))
      setScheduledEndTime(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to cancel schedule')
    } finally {
      setScheduleLoading(false)
    }
  }

  const formatScheduledTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const getTimeUntilScheduled = (timestamp: number): string => {
    const diff = Math.max(0, Math.floor((timestamp - Date.now()) / 1000))
    const hours = Math.floor(diff / 3600)
    const minutes = Math.floor((diff % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Time Tracker
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track your work sessions and manage schedules.
        </p>
      </div>

      {/* Timer card */}
      <Card className="max-w-md mx-auto text-center">
        <CardContent className="py-8">
          {/* Timer display */}
          <div className="mb-8">
            <p className="text-6xl font-mono font-bold text-gray-900 dark:text-gray-100 timer-display">
              {formatTime(elapsedSeconds)}
            </p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {isRunning ? 'Session in progress' : 'Ready to start'}
            </p>
            {isRunning && scheduledEndTime && (
              <p className="mt-1 text-xs text-primary-600 dark:text-primary-400">
                Auto-stop at {formatScheduledTime(scheduledEndTime)} ({getTimeUntilScheduled(scheduledEndTime)})
              </p>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Control buttons */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button
                  size="lg"
                  variant="primary"
                  onClick={handleStart}
                  disabled={isLoading}
                  leftIcon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  className="px-12"
                >
                  {isLoading ? 'Starting...' : 'Start'}
                </Button>
              ) : (
                <Button
                  size="lg"
                  variant="danger"
                  onClick={handleStop}
                  disabled={isLoading}
                  leftIcon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Square className="h-5 w-5" />}
                  className="px-12"
                >
                  {isLoading ? 'Stopping...' : 'Stop'}
                </Button>
              )}
            </div>

            {/* Create Log Entry button - only when session is active */}
            {isRunning && sessionId && (
              <Button
                size="md"
                variant="secondary"
                onClick={() => navigate(`/documents/new?session=${sessionId}`)}
                leftIcon={<FileText className="h-4 w-4" />}
              >
                Create Log Entry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule card - only when session is active */}
      {isRunning && sessionId && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Schedule Auto-Stop
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scheduledEndTime ? (
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                    Scheduled to stop at {formatScheduledTime(scheduledEndTime)}
                  </p>
                  <p className="text-xs text-primary-600 dark:text-primary-400">
                    {getTimeUntilScheduled(scheduledEndTime)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelSchedule}
                  disabled={scheduleLoading}
                  leftIcon={scheduleLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick presets */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Stop after
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((hours) => (
                      <Button
                        key={hours}
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSchedule(hours)}
                        disabled={scheduleLoading}
                      >
                        {hours}h
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom hours */}
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                    Custom duration
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0.5"
                      max="24"
                      step="0.5"
                      value={customHours}
                      onChange={(e) => setCustomHours(e.target.value)}
                      placeholder="e.g. 3"
                      className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">hours</span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleSchedule(parseFloat(customHours))}
                      disabled={scheduleLoading || !customHours || parseFloat(customHours) <= 0 || parseFloat(customHours) > 24}
                    >
                      Set
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* This week's sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessionsLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin opacity-50" />
              <p>Loading sessions...</p>
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No sessions this week</p>
              <p className="text-sm mt-1">Start tracking to log your work hours</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map((session) => {
                const hasDoc = todayDocs.some((d) => d.session_id === session.id)
                const sessionDate = new Date(session.start_time)
                const today = new Date()
                const isToday = sessionDate.toDateString() === today.toDateString()
                const dateLabel = isToday
                  ? 'Today'
                  : sessionDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          session.status === 'active'
                            ? 'bg-green-500 animate-pulse'
                            : session.status === 'completed'
                            ? 'bg-blue-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          <span className="text-gray-500 dark:text-gray-400">{dateLabel}</span>
                          {' \u00b7 '}
                          {formatTimeOfDay(session.start_time)}
                          {session.end_time && ` - ${formatTimeOfDay(session.end_time)}`}
                          {session.status === 'active' && ' - In Progress'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {session.status}
                          {session.scheduled_end && session.status === 'active' &&
                            ` \u00b7 auto-stop at ${formatTimeOfDay(session.scheduled_end)}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {session.status === 'completed' && !hasDoc && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => navigate(`/documents/new?session=${session.id}`)}
                          leftIcon={<FileText className="h-3.5 w-3.5" />}
                        >
                          Create Log
                        </Button>
                      )}
                      <p className="text-sm font-mono font-medium text-gray-900 dark:text-gray-100">
                        {formatDuration(session.start_time, session.end_time)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
