import { useEffect, useState, useMemo } from 'react'
import { Clock, FileText, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui'
import { useApi, endpoints } from '../services/api'
import { TimeSession, Document } from '../types'
import { formatTimeHuman, calculateDuration } from '../utils/formatTime'
import { getCurrentWeekRange, getCurrentMonthRange, formatDate, formatRelativeTime } from '../utils/date'



interface DashboardStats {
  thisWeekSeconds: number
  thisMonthSeconds: number
  totalSessions: number
  documentsCount: number
}

function calculateSessionDuration(session: TimeSession): number {
  const start = new Date(session.start_time)
  const end = session.end_time ? new Date(session.end_time) : new Date()
  return calculateDuration(start, end)
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </div>
  )
}

export function Dashboard() {
  const api = useApi()
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch sessions and documents in parallel
        const [sessionsData, documentsData] = await Promise.all([
          api.get<TimeSession[]>(endpoints.time.sessions, {
            params: { per_page: 100 }
          }),
          api.get<Document[]>(endpoints.documents.list, {
            params: { per_page: 100 }
          })
        ])

        setSessions(sessionsData || [])
        setDocuments(documentsData || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats from sessions
  const stats = useMemo<DashboardStats>(() => {
    const weekRange = getCurrentWeekRange()
    const monthRange = getCurrentMonthRange()

    let thisWeekSeconds = 0
    let thisMonthSeconds = 0

    for (const session of sessions) {
      if (session.status === 'cancelled') continue

      const sessionStart = new Date(session.start_time)
      const duration = calculateSessionDuration(session)

      // Check if session is in current week
      if (sessionStart >= weekRange.start && sessionStart <= weekRange.end) {
        thisWeekSeconds += duration
      }

      // Check if session is in current month
      if (sessionStart >= monthRange.start && sessionStart <= monthRange.end) {
        thisMonthSeconds += duration
      }
    }

    return {
      thisWeekSeconds,
      thisMonthSeconds,
      totalSessions: sessions.filter(s => s.status !== 'cancelled').length,
      documentsCount: documents.length
    }
  }, [sessions, documents])

  // Get recent sessions (last 5)
  const recentSessions = useMemo(() => {
    return sessions
      .filter(s => s.status !== 'cancelled')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 5)
  }, [sessions])

  // Get recent documents (last 5)
  const recentDocuments = useMemo(() => {
    return documents
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
  }, [documents])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back! Here's an overview of your activity.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <Clock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Week</p>
              {loading ? (
                <StatCardSkeleton />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTimeHuman(stats.thisWeekSeconds)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-success-50 dark:bg-green-900 rounded-lg">
              <TrendingUp className="h-6 w-6 text-success-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">This Month</p>
              {loading ? (
                <StatCardSkeleton />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {formatTimeHuman(stats.thisMonthSeconds)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-warning-50 dark:bg-yellow-900 rounded-lg">
              <Calendar className="h-6 w-6 text-warning-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</p>
              {loading ? (
                <StatCardSkeleton />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.totalSessions}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileText className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
              {loading ? (
                <StatCardSkeleton />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats.documentsCount}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent sessions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No sessions yet</p>
                <p className="text-sm mt-1">Start tracking to see your sessions here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'active'
                          ? 'bg-green-500 animate-pulse'
                          : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDate(session.start_time)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(session.start_time)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {formatTimeHuman(calculateSessionDuration(session))}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {session.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent documents */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : recentDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No documents yet</p>
                <p className="text-sm mt-1">Create your first log entry</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {doc.title || `Log - ${formatDate(doc.log_date)}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(doc.updated_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        v{doc.current_version}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
