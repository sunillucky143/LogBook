import { useState, useEffect, useCallback, useRef } from 'react'
import { Clock, Calendar, Loader2, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui'
import { useApi, endpoints, ApiError } from '../services/api'
import type { TimeSession } from '../types/session'

export function History() {
  const api = useApi()
  const apiRef = useRef(api)
  apiRef.current = api

  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await apiRef.current.get<TimeSession[]>(endpoints.time.sessions, {
        params: { per_page: 100 },
      })
      setSessions(data || [])
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load sessions')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTimeOfDay = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatDuration = (startTime: string, endTime: string | null): string => {
    if (!endTime) return 'In progress'
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const totalMinutes = Math.round((end - start) / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }

  const getDurationHours = (startTime: string, endTime: string | null): number => {
    if (!endTime) return 0
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    return (end - start) / 3600000
  }

  // Compute stats
  const completedSessions = sessions.filter((s) => s.status === 'completed')
  const totalHours = completedSessions.reduce(
    (sum, s) => sum + getDurationHours(s.start_time, s.end_time),
    0
  )
  const avgHours = completedSessions.length > 0 ? totalHours / completedSessions.length : 0

  const formatHours = (h: number): string => {
    if (h === 0) return '0h'
    const hours = Math.floor(h)
    const minutes = Math.round((h - hours) * 60)
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            Completed
          </span>
        )
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            Active
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          History
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View all your past time sessions.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card padding="sm">
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatHours(totalHours)}
            </p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {completedSessions.length}
            </p>
          </CardContent>
        </Card>
        <Card padding="sm">
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avg Session</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatHours(avgHours)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading sessions...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-2">Failed to load sessions</p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{error}</p>
              <Button onClick={fetchSessions}>Try Again</Button>
            </div>
          )}

          {!isLoading && !error && sessions.length === 0 && (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No sessions recorded
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                Your completed time sessions will appear here. Start tracking to build your history.
              </p>
            </div>
          )}

          {!isLoading && !error && sessions.length > 0 && (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <div key={session.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(session.start_time)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeOfDay(session.start_time)}
                      {session.end_time ? ` - ${formatTimeOfDay(session.end_time)}` : ' - In Progress'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDuration(session.start_time, session.end_time)}
                    </p>
                    {getStatusBadge(session.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
