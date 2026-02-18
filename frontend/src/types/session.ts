// Time session types

export type SessionStatus = 'active' | 'completed' | 'cancelled'

export interface TimeSession {
  id: string
  user_id: string
  start_time: string
  end_time: string | null
  scheduled_end: string | null
  status: SessionStatus
  device_id: string | null
  created_at: string
}

export interface StartSessionRequest {
  device_id?: string
}

export interface StartSessionResponse {
  session: TimeSession
}

export interface StopSessionRequest {
  session_id?: string
}

export interface StopSessionResponse {
  session: TimeSession
}

export interface ScheduleRequest {
  scheduled_end: string
  session_id?: string
}

export interface ScheduleResponse {
  session: TimeSession
}

export interface SessionListParams {
  status?: SessionStatus
  start_date?: string
  end_date?: string
  page?: number
  per_page?: number
}

// Computed session stats
export interface SessionStats {
  total_sessions: number
  total_hours: number
  average_session_hours: number
  this_week_hours: number
  this_month_hours: number
}
