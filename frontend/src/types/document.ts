// Document types

export interface Document {
  id: string
  user_id: string
  session_id: string | null
  log_date: string
  title: string | null
  content?: unknown
  created_at: string
  updated_at: string
}

// API requests/responses
export interface CreateDocumentRequest {
  log_date: string
  title?: string
  content?: unknown
}

export interface UpdateDocumentRequest {
  title?: string
  content?: unknown
}

export interface DocumentListParams {
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
}

export interface DocumentSearchParams {
  q?: string
  date?: string
  from_date?: string
  to_date?: string
  sort?: 'date' | 'title'
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
}

// Media file types
export interface MediaFile {
  id: string
  document_id: string
  user_id: string
  storage_key: string
  file_name: string | null
  file_type: string | null
  size_bytes: number | null
  created_at: string
}

export interface PresignedUrlRequest {
  file_name: string
  file_type: string
  file_size_bytes: number
}

export interface PresignedUrlResponse {
  upload_url: string
  storage_key: string
  public_url: string
  expires_at: number
}

export interface ConfirmUploadRequest {
  storage_key: string
  document_id: string
  file_name: string
  file_type: string
  size_bytes: number
}
