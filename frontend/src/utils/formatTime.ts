/**
 * Format seconds into HH:MM:SS string
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((v) => v.toString().padStart(2, '0'))
    .join(':')
}

/**
 * Format seconds into human-readable string (e.g., "2h 30m")
 */
export function formatTimeHuman(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)

  if (hours === 0 && minutes === 0) {
    return '0m'
  }

  if (hours === 0) {
    return `${minutes}m`
  }

  if (minutes === 0) {
    return `${hours}h`
  }

  return `${hours}h ${minutes}m`
}

/**
 * Format milliseconds duration into human-readable string
 */
export function formatDuration(ms: number): string {
  return formatTimeHuman(Math.floor(ms / 1000))
}

/**
 * Calculate duration between two dates in seconds
 */
export function calculateDuration(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 1000)
}

/**
 * Parse ISO date string and format time range
 */
export function formatTimeRange(startIso: string, endIso: string | null): string {
  const start = new Date(startIso)
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }

  const startFormatted = start.toLocaleTimeString('en-US', formatOptions)

  if (!endIso) {
    return `${startFormatted} - ongoing`
  }

  const end = new Date(endIso)
  const endFormatted = end.toLocaleTimeString('en-US', formatOptions)

  return `${startFormatted} - ${endFormatted}`
}
