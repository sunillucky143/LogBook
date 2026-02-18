// API Response types

export interface ApiResponse<T> {
  success: boolean
  data: T
  meta?: ApiMeta
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: unknown[]
  }
}

export interface ApiMeta {
  timestamp?: string
  page?: number
  per_page?: number
  total?: number
  total_pages?: number
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: Required<Pick<ApiMeta, 'page' | 'per_page' | 'total' | 'total_pages'>> & ApiMeta
}

// Pagination params
export interface PaginationParams {
  page?: number
  per_page?: number
}

// Date range params
export interface DateRangeParams {
  start_date?: string
  end_date?: string
}
