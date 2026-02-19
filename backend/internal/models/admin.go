package models

import (
	"time"

	"github.com/google/uuid"
)

type AdminStats struct {
	TotalUsers    int             `json:"total_users"`
	TotalDocs     int             `json:"total_docs"`
	TotalSessions int             `json:"total_sessions"`
	TotalFeedback int             `json:"total_feedback"`
	AIUsage       AIUsageAggStats `json:"ai_usage"`
}

type AIUsageAggStats struct {
	TotalRequests     int `json:"total_requests"`
	TotalInputTokens  int `json:"total_input_tokens"`
	TotalOutputTokens int `json:"total_output_tokens"`
}

type UserStats struct {
	User
	DocumentsCount int `json:"documents_count"`
	SessionsCount  int `json:"sessions_count"`
	AIRequestCount int `json:"ai_request_count"`
}

type AIUsageDaily struct {
	ID           uuid.UUID `json:"id" db:"id"`
	UserID       uuid.UUID `json:"user_id" db:"user_id"`
	Date         time.Time `json:"date" db:"date"`
	RequestCount int       `json:"request_count" db:"request_count"`
	InputTokens  int       `json:"input_tokens" db:"input_tokens"`
	OutputTokens int       `json:"output_tokens" db:"output_tokens"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" db:"updated_at"`
}

type AIUsageStats struct {
	Date         string `json:"date"`
	RequestCount int    `json:"request_count"`
	InputTokens  int    `json:"input_tokens"`
	OutputTokens int    `json:"output_tokens"`
}

type UserAIUsage struct {
	UserID            uuid.UUID `json:"user_id"`
	Name              string    `json:"name"`
	Email             string    `json:"email"`
	TotalRequests     int       `json:"total_requests"`
	TotalInputTokens  int       `json:"total_input_tokens"`
	TotalOutputTokens int       `json:"total_output_tokens"`
	MonthlyRequests   int       `json:"monthly_requests"`
}

type FeedbackItem struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Type      string    `json:"type"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
	User      *User     `json:"user,omitempty"`
}
