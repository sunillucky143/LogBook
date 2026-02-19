import { useAuth } from '@clerk/clerk-react'
import { useMemo } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

const REQUEST_TIMEOUT_MS = 30_000

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown[]
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
  token?: string | null
): Promise<T> {
  const { params, signal: externalSignal, ...fetchOptions } = options

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Timeout via AbortController (respect external signal if provided)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new ApiError(
        response.status,
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'An unknown error occurred',
        data.error?.details
      )
    }

    return data.data as T
  } catch (err) {
    if (err instanceof ApiError) throw err
    if ((err as Error).name === 'AbortError') {
      throw new ApiError(0, 'TIMEOUT', 'Request timed out')
    }
    throw err
  } finally {
    clearTimeout(timeoutId)
  }
}



// Hook to get authenticated API client
export function useApi() {
  const { getToken } = useAuth()

  const api = useMemo(() => ({
    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
      const token = await getToken()
      return request<T>(endpoint, { ...options, method: 'GET' }, token)
    },

    async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
      const token = await getToken()
      return request<T>(
        endpoint,
        { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined },
        token
      )
    },

    async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
      const token = await getToken()
      return request<T>(
        endpoint,
        { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined },
        token
      )
    },

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
      const token = await getToken()
      return request<T>(endpoint, { ...options, method: 'DELETE' }, token)
    },
  }), [getToken])

  return api
}

// Type-safe API endpoints
export const endpoints = {
  time: {
    start: '/time/start',
    stop: '/time/stop',
    active: '/time/active',
    sessions: '/sessions',
    createManual: '/sessions/manual',
    schedule: '/schedule',
    scheduleById: (id: string) => `/schedule/${id}`,
  },

  documents: {
    list: '/documents',
    create: '/documents',
    get: (id: string) => `/documents/${id}`,
    update: (id: string) => `/documents/${id}`,
    summarize: '/documents/summarize',
    quota: '/documents/summarize/quota',
  },

  upload: {
    presign: '/upload/presign',
    confirm: '/upload/confirm',
    deleteByUrl: '/upload/delete-by-url',
    media: (id: string) => `/media/${id}`,
  },

  feedback: {
    create: '/feedback',
    list: '/feedback',
  },

  admin: {
    stats: '/admin/stats',
    users: '/admin/users',
    aiUsage: '/admin/ai-usage',
    aiUsageUsers: '/admin/ai-usage/users',
    feedback: '/admin/feedback',
  },

  auth: {
    me: '/me',
  },
}
