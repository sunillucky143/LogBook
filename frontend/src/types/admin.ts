export interface AdminStats {
  total_users: number
  total_docs: number
  total_sessions: number
  total_feedback: number
  ai_usage: {
    total_requests: number
    total_input_tokens: number
    total_output_tokens: number
  }
}

export interface UserStats {
  id: string
  clerk_id: string
  email: string
  name: string
  role: string
  created_at: string
  updated_at: string
  documents_count: number
  sessions_count: number
  ai_request_count: number
}

export interface AIUsageStats {
  date: string
  request_count: number
  input_tokens: number
  output_tokens: number
}

export interface UserAIUsage {
  user_id: string
  name: string
  email: string
  total_requests: number
  total_input_tokens: number
  total_output_tokens: number
  monthly_requests: number
}

export interface FeedbackItem {
  id: string
  user_id: string
  type: string
  message: string
  created_at: string
  user?: {
    name: string
    email: string
  }
}
