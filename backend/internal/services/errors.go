package services

import "errors"

// Common service errors
var (
	// Session errors
	ErrSessionNotFound     = errors.New("session not found")
	ErrSessionAlreadyActive = errors.New("session already active")
	ErrNoActiveSession     = errors.New("no active session")
	ErrInvalidScheduleTime = errors.New("schedule time must be in the future")
	ErrInvalidTimeRange    = errors.New("end time must be after start time")
	ErrSessionTooLong      = errors.New("session duration cannot exceed 24 hours")
	ErrFutureEndTime       = errors.New("end time cannot be in the future")
	ErrSessionExistsForDate = errors.New("a session already exists for this date")
	ErrSessionTooShort      = errors.New("session must be at least 4 hours")

	// Document errors
	ErrDocumentNotFound = errors.New("document not found")
	ErrDocumentExists   = errors.New("document already exists for this date")

	// Media errors
	ErrMediaNotFound = errors.New("media not found")

	// User errors
	ErrUserNotFound = errors.New("user not found")

	// Auth errors
	ErrUnauthorized = errors.New("unauthorized")
)
