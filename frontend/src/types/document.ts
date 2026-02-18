// Document types

export interface Document {
  id: string
  user_id: string
  session_id: string | null
  log_date: string
  title: string | null
  current_version: number
  created_at: string
  updated_at: string
}

export interface DocumentWithContent extends Document {
  content: TiptapContent
}

export interface DocumentVersion {
  id: string
  document_id: string
  version_number: number
  content: TiptapContent
  is_full_snapshot: boolean
  created_at: string
}

// Tiptap content structure
export interface TiptapContent {
  type: 'doc'
  content: TiptapNode[]
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

// API requests/responses
export interface CreateDocumentRequest {
  log_date: string
  title?: string
  content?: TiptapContent
}

export interface UpdateDocumentRequest {
  title?: string
  content?: TiptapContent
}

export interface DocumentListParams {
  start_date?: string
  end_date?: string
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
