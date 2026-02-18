package models

import "time"

// APIResponse is the standard response wrapper
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
	Meta    *APIMeta    `json:"meta,omitempty"`
}

type APIError struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type APIMeta struct {
	Timestamp  time.Time   `json:"timestamp"`
	Pagination *Pagination `json:"pagination,omitempty"`
}

type Pagination struct {
	Page       int `json:"page"`
	PerPage    int `json:"per_page"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// Response helpers
func SuccessResponse(data interface{}) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
		Meta: &APIMeta{
			Timestamp: time.Now().UTC(),
		},
	}
}

func SuccessResponseWithPagination(data interface{}, pagination *Pagination) APIResponse {
	return APIResponse{
		Success: true,
		Data:    data,
		Meta: &APIMeta{
			Timestamp:  time.Now().UTC(),
			Pagination: pagination,
		},
	}
}

func ErrorResponse(code string, message string, details interface{}) APIResponse {
	return APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
			Details: details,
		},
		Meta: &APIMeta{
			Timestamp: time.Now().UTC(),
		},
	}
}

// Common error codes
const (
	ErrCodeValidation     = "VALIDATION_ERROR"
	ErrCodeUnauthorized   = "UNAUTHORIZED"
	ErrCodeForbidden      = "FORBIDDEN"
	ErrCodeNotFound       = "NOT_FOUND"
	ErrCodeConflict       = "CONFLICT"
	ErrCodeInternal       = "INTERNAL_ERROR"
	ErrCodeRateLimited    = "RATE_LIMIT_EXCEEDED"
	ErrCodeBadRequest     = "BAD_REQUEST"
	ErrCodeSessionActive  = "SESSION_ALREADY_ACTIVE"
	ErrCodeNoActiveSession = "NO_ACTIVE_SESSION"
)
