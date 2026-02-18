import { useAuth } from '@clerk/clerk-react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

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
  const { params, ...fetchOptions } = options

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

  // Set headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
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
}

// Hook to get authenticated API client
export function useApi() {
  const { getToken, isSignedIn } = useAuth()

  const api = {
    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
      const token = await getToken()
      console.log('[API Debug] isSignedIn:', isSignedIn, 'hasToken:', !!token)
      if (!token) {
        console.warn('[API Debug] No token available - user may not be signed in')
      }
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
  }

  return api
}

// Type-safe API endpoints
export const endpoints = {
  // Time endpoints
  time: {
    start: '/time/start',
    stop: '/time/stop',
    active: '/time/active',
    sessions: '/sessions',
    createManual: '/sessions/manual',
    schedule: '/schedule',
    scheduleById: (id: string) => `/schedule/${id}`,
  },

  // Document endpoints
  documents: {
    list: '/documents',
    create: '/documents',
    get: (id: string) => `/documents/${id}`,
    update: (id: string) => `/documents/${id}`,
  },

  // Upload endpoints
  upload: {
    presign: '/upload/presign',
    confirm: '/upload/confirm',
    deleteByUrl: '/upload/delete-by-url',
    media: (id: string) => `/media/${id}`,
  },

  // Feedback endpoints
  feedback: {
    create: '/feedback',
    list: '/feedback',
  },
}
