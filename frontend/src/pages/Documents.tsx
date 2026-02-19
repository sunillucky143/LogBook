import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, FileText, Loader2, AlertCircle, Clock, X, Search, SlidersHorizontal, Sparkles, ChevronDown } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Card, CardContent, Button } from '../components/ui'
import { useApi, endpoints, ApiError } from '../services/api'
import type { Document } from '../types/document'
import type { TimeSession } from '../types/session'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const SORT_OPTIONS = [
  { label: 'Newest first', sort: 'date' as const, order: 'desc' as const },
  { label: 'Oldest first', sort: 'date' as const, order: 'asc' as const },
  { label: 'A → Z', sort: 'title' as const, order: 'asc' as const },
  { label: 'Z → A', sort: 'title' as const, order: 'desc' as const },
]

export function Documents() {
  const navigate = useNavigate()
  const api = useApi()
  const apiRef = useRef(api)
  apiRef.current = api
  const { getToken } = useAuth()

  const [documents, setDocuments] = useState<Document[]>([])
  const [sessions, setSessions] = useState<TimeSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewEntryForm, setShowNewEntryForm] = useState(false)

  // Search/filter state
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortIdx, setSortIdx] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)

  // AI Summary state
  const [summaryText, setSummaryText] = useState('')
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const summaryAbortRef = useRef<AbortController | null>(null)

  // AI Quota state
  const [quotaRemaining, setQuotaRemaining] = useState<number | null>(null)
  const [quotaLimit, setQuotaLimit] = useState(3)

  // New entry form state
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0])
  const [formStartTime, setFormStartTime] = useState('09:00')
  const [formEndTime, setFormEndTime] = useState('17:00')
  const [formError, setFormError] = useState<string | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const currentSort = SORT_OPTIONS[sortIdx]

  const buildSearchParams = useCallback((): Record<string, string | number | undefined> => {
    const params: Record<string, string | number | undefined> = {
      per_page: 100,
    }
    if (searchQuery) params.q = searchQuery
    if (dateFilter) params.date = dateFilter
    if (fromDate) params.from_date = fromDate
    if (toDate) params.to_date = toDate
    if (currentSort.sort !== 'date' || currentSort.order !== 'desc') {
      params.sort = currentSort.sort
      params.order = currentSort.order
    }
    return params
  }, [searchQuery, dateFilter, fromDate, toDate, currentSort])

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = buildSearchParams()
      const [docsData, sessionsData] = await Promise.all([
        apiRef.current.get<Document[]>(endpoints.documents.list, { params }),
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
  }, [buildSearchParams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Fetch AI quota on mount
  useEffect(() => {
    async function fetchQuota() {
      try {
        const data = await apiRef.current.get<{ used: number; limit: number; remaining: number }>(endpoints.documents.quota)
        setQuotaRemaining(data.remaining)
        setQuotaLimit(data.limit)
      } catch {
        // Silently fail — quota display is non-critical
      }
    }
    fetchQuota()
  }, [])

  // Close sort menu on outside click
  useEffect(() => {
    if (!showSortMenu) return
    const handler = () => setShowSortMenu(false)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showSortMenu])

  const sessionMap = new Map(sessions.map((s) => [s.id, s]))

  const getSessionForDoc = (doc: Document): TimeSession | undefined => {
    if (!doc.session_id) return undefined
    return sessionMap.get(doc.session_id)
  }

  const formatDate = (dateString: string) => {
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
    const startISO = `${formDate}T${formStartTime}:00`
    const endISO = `${formDate}T${formEndTime}:00`
    const startDate = new Date(startISO)
    const endDate = new Date(endISO)

    if (endDate <= startDate) { setFormError('End time must be after start time'); return }
    const durationMs = endDate.getTime() - startDate.getTime()
    if (durationMs < 4 * 60 * 60 * 1000) { setFormError('Session must be at least 4 hours'); return }
    if (durationMs > 24 * 60 * 60 * 1000) { setFormError('Session duration cannot exceed 24 hours'); return }
    if (endDate > new Date()) { setFormError('End time cannot be in the future'); return }

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

  const hasActiveFilters = searchQuery || dateFilter || fromDate || toDate || sortIdx !== 0

  const clearFilters = () => {
    setSearchInput('')
    setSearchQuery('')
    setDateFilter('')
    setFromDate('')
    setToDate('')
    setSortIdx(0)
  }

  // AI Summarize with SSE streaming
  const handleSummarize = async () => {
    setShowSummary(true)
    setSummaryText('')
    setIsSummarizing(true)

    const abort = new AbortController()
    summaryAbortRef.current = abort

    try {
      const token = await getToken()
      const params = new URLSearchParams()
      if (searchQuery) params.set('q', searchQuery)
      if (dateFilter) params.set('date', dateFilter)
      if (fromDate) params.set('from_date', fromDate)
      if (toDate) params.set('to_date', toDate)
      params.set('sort', currentSort.sort)
      params.set('order', currentSort.order)

      const url = `${API_BASE_URL}${endpoints.documents.summarize}?${params.toString()}`
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abort.signal,
      })

      if (!response.ok || !response.body) {
        setSummaryText('Failed to generate summary. Please try again.')
        setIsSummarizing(false)
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.error) {
              setSummaryText(parsed.error)
              setQuotaRemaining(0)
              break
            }
            if (parsed.text) {
              setSummaryText((prev) => prev + parsed.text)
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setSummaryText((prev) => prev || 'Failed to generate summary.')
      }
    } finally {
      setIsSummarizing(false)
      summaryAbortRef.current = null
      // Refresh quota after summarize
      try {
        const data = await apiRef.current.get<{ used: number; limit: number; remaining: number }>(endpoints.documents.quota)
        setQuotaRemaining(data.remaining)
        setQuotaLimit(data.limit)
      } catch {
        // non-critical
      }
    }
  }

  const closeSummary = () => {
    summaryAbortRef.current?.abort()
    setShowSummary(false)
    setSummaryText('')
    setIsSummarizing(false)
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const formDuration = getFormDuration()

  return (
    <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input type="date" value={formDate} max={todayStr} onChange={(e) => setFormDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                <input type="time" value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                <input type="time" value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {formDuration && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Duration: <span className="font-medium text-gray-900 dark:text-gray-100">{formDuration}</span>
                  </p>
                )}
              </div>
              <Button onClick={handleNewEntrySubmit} disabled={formSubmitting || !formDuration}
                leftIcon={formSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}>
                {formSubmitting ? 'Creating...' : 'Create & Write Log'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by title... (use * for wildcard)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
            showFilters || hasActiveFilters
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        {/* Sort dropdown */}
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            {currentSort.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
              {SORT_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => { setSortIdx(i); setShowSortMenu(false) }}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                    i === sortIdx
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  } ${i === 0 ? 'rounded-t-lg' : ''} ${i === SORT_OPTIONS.length - 1 ? 'rounded-b-lg' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <Card>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Specific Date</label>
                <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); setFromDate(''); setToDate('') }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setDateFilter('') }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setDateFilter('') }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:[color-scheme:dark]" />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <button onClick={clearFilters} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  Clear all filters
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
              Search: {searchQuery}
              <button onClick={() => setSearchInput('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {dateFilter && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              Date: {dateFilter}
              <button onClick={() => setDateFilter('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {fromDate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              From: {fromDate}
              <button onClick={() => setFromDate('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {toDate && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
              To: {toDate}
              <button onClick={() => setToDate('')}><X className="h-3 w-3" /></button>
            </span>
          )}
          {sortIdx !== 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
              Sort: {currentSort.label}
              <button onClick={() => setSortIdx(0)}><X className="h-3 w-3" /></button>
            </span>
          )}
        </div>
      )}

      {/* AI Summary panel */}
      {showSummary && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">AI Summary</h3>
                {isSummarizing && <Loader2 className="h-4 w-4 animate-spin text-purple-500" />}
              </div>
              <button onClick={closeSummary} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap">
              {summaryText || (isSummarizing ? 'Analyzing your documents...' : '')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summarize button + results count */}
      {!isLoading && !error && documents.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {documents.length} document{documents.length !== 1 ? 's' : ''} found
          </p>
          <div className="flex items-center gap-3">
            {quotaRemaining !== null && (
              <span className={`text-xs ${quotaRemaining === 0 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {quotaRemaining === 0
                  ? 'Limit reached — resets next month'
                  : `${quotaRemaining} of ${quotaLimit} remaining this month`}
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSummarize}
              disabled={isSummarizing || quotaRemaining === 0}
              leftIcon={isSummarizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            >
              {isSummarizing ? 'Summarizing...' : 'AI Summarize'}
            </Button>
          </div>
        </div>
      )}

      {/* Documents list */}
      <div className="space-y-3">
        {isLoading && (
          <Card>
            <CardContent className="text-center py-12">
              <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary-500 animate-spin" />
              <p className="text-gray-500 dark:text-gray-400">Loading documents...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && error && (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Failed to load documents</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">{error}</p>
              <Button onClick={fetchData}>Try Again</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && documents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              {hasActiveFilters ? (
                <>
                  <Search className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No matching documents</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button variant="secondary" onClick={clearFilters}>Clear Filters</Button>
                </>
              ) : (
                <>
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No documents yet</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                    Create your first log entry to document your volunteer work and track your hours.
                  </p>
                  <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowNewEntryForm(true)}>
                    Create First Entry
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

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
