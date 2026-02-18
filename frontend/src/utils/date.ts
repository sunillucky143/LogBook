import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns'

/**
 * Format a date for display in the UI
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date

  if (isToday(d)) {
    return 'Today'
  }

  if (isYesterday(d)) {
    return 'Yesterday'
  }

  return format(d, 'MMMM d, yyyy')
}

/**
 * Format a date with time
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy h:mm a')
}

/**
 * Format date for API requests (YYYY-MM-DD)
 */
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Format time only (e.g., "2:30 PM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

/**
 * Get the start and end of the current week
 */
export function getCurrentWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - dayOfWeek)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get the start and end of the current month
 */
export function getCurrentMonthRange(): { start: Date; end: Date } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Parse ISO string to Date object
 */
export function parseDate(isoString: string): Date {
  return parseISO(isoString)
}
