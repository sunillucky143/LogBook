import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, FileText, Loader2, AlertCircle, Clock, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, Button } from '../components/ui'
import { useApi, endpoints, ApiError } from '../services/api'
import type { Document } from '../types/document'
import type { TimeSession } from '../types/session'

export function Documents() {
  const navigate = useNavigate()
  const api = useApi()
  const apiRef = useRef(api)
  apiRef.current = api

  const [documents, setDocuments] = useState<Document[]>([])
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)

  // New entry form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0])
  const [formStartTime, setFormStartTime] = useState('09:00')
  const [formEndTime, setFormEndTime] = useState('17:00')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [docsData, sessionsData] = await Promise.all([
        apiRef.current.get<Document[]>(endpoints.documents.list),
        apiRef.current.get<TimeSession[]>(endpoints.time.sessions, {
          params: { per_page: 100 },
        }),
      ])
      setDocuments(docsData || [])
      setSessions(sessionsData || [])
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load documents')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Build a map of session_id -> session for quick lookup
  const sessionMap = new Map(sessions.map((s) => [s.id, s]))

  const getSessionForDoc = (doc: Document): TimeSession | undefined => {
    if (!doc.session_id) return undefined
    return sessionMap.get(doc.session_id)
  }

  const formatDate = (dateString: string) => {
    // log_date comes as full ISO timestamp (e.g. "2026-02-18T00:00:00Z") or "2026-02-18"
    // Extract just the date part and parse without timezone shift
    const datePart = dateString.split('T')[0]
    const [year, month, day] = datePart.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTimeOfDay = (isoString: string): string => {
    return new Date(isoString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  const formatDurationHours = (startTime: string, endTime: string | null): string => {
    if (!endTime) return '--'
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    const totalMinutes = Math.round((end - start) / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h`
    return `${minutes}m`
  }

  // Calculate form duration for live preview
  const getFormDuration = (): string | null => {
    if (!formStartTime || !formEndTime) return null
    const [sh, sm] = formStartTime.split(':').map(Number)
    const [eh, em] = formEndTime.split(':').map(Number)
    const startMins = sh * 60 + sm
    const endMins = eh * 60 + em
    if (endMins <= startMins) return null
    const diff = endMins - startMins
    const h = Math.floor(diff / 60)
    const m = diff % 60
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  }

  const handleNewEntrySubmit = async () => {
    setFormError(null)

    // Build ISO timestamps
    const startISO = `${formDate}T${formStartTime}:00`
    const endISO = `${formDate}T${formEndTime}:00`

    const startDate = new Date(startISO)
    const endDate = new Date(endISO)

    // Validation
    if (endDate <= startDate) {
      setFormError('End time must be after start time')
      return
    }

    const durationMs = endDate.getTime() - startDate.getTime()
    if (durationMs > 24 * 60 * 60 * 1000) {
      setFormError('Session duration cannot exceed 24 hours')
      return
    }

    if (endDate > new Date()) {
      setFormError('End time cannot be in the future')
      return
    }

    setFormSubmitting(true)
    try {
      const session = await api.post<TimeSession>(endpoints.time.createManual, {
        start_time: startDate.toISOString(),
        end_time: endDate.toISOString(),
      })
      navigate(`/documents/new?session=${session.id}&date=${formDate}`)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Failed to create session')
    } finally {
      setFormSubmitting(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const formDuration = getFormDuration()

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Documents
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your daily log entries.
          </p>
        </div>
        <Button
          leftIcon={showNewEntryForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          onClick={() => setShowNewEntryForm(!showNewEntryForm)}
          variant={showNewEntryForm ? 'secondary' : 'primary'}
        >
          {showNewEntryForm ? 'Cancel' : 'New Entry'}
        </Button>
      </div>

      {/* New Entry Form */}
      {showNewEntryForm && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Add Work Session
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formDate}
                  max={todayStr}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]"
                />
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]"
                />
              </div>
            </div>

            {/* Duration preview + submit */}
            <div className="flex items-center justify-between">
              <div>
                {formDuration && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: <span className="font-medium text-gray-900 dark:text-gray-100">{formDuration}</span>
                  </p>
                )}
              </div>
              <Button
                onClick={handleNewEntrySubmit}
                disabled={formSubmitting || !formDuration}
                leftIcon={formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              >
                {formSubmitting ? 'Creating...' : 'Create & Write Log'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents list */}
      <div className="space-y-3">
        {/* Loading state */}
        {isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Failed to load documents
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                {error}
              </p>
              <Button onClick={fetchData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && documents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No documents yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                Create your first log entry to document your volunteer work and track your hours.
              </p>
              <Button
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => setShowNewEntryForm(true)}
              >
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Documents list with session info */}
        {!isLoading && !error && documents.length > 0 && (
          documents.map((doc) => {
            const session = getSessionForDoc(doc)
            return (
              <Link key={doc.id} to={`/documents/${doc.id}`}>
                <Card hover>
                  <CardContent className="flex items-center gap-4">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <FileText className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {doc.title || `Log - ${formatDate(doc.log_date)}`}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(doc.log_date)}
                      </p>
                    </div>
                    {/* Session time info */}
                    {session && (
                      <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {formatTimeOfDay(session.start_time)}
                            {session.end_time ? ` - ${formatTimeOfDay(session.end_time)}` : ' - now'}
                          </span>
                        </div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formatDurationHours(session.start_time, session.end_time)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
