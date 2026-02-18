export interface Feedback {
  id: string
  user_id: string
  name: string
  message: string
  created_at: string
}

export interface CreateFeedbackInput {
  name: string
  message: string
}
