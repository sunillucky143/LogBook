package models

import (
	"time"

	"github.com/google/uuid"
)

type SessionStatus string

const (
	SessionStatusActive    SessionStatus = "active"
	SessionStatusCompleted SessionStatus = "completed"
	SessionStatusCancelled SessionStatus = "cancelled"
)

type TimeSession struct {
	ID           uuid.UUID  `json:"id" db:"id"`
	UserID       uuid.UUID  `json:"user_id" db:"user_id"`
	StartTime    time.Time  `json:"start_time" db:"start_time"`
	EndTime      *time.Time `json:"end_time,omitempty" db:"end_time"`
	ScheduledEnd *time.Time `json:"scheduled_end,omitempty" db:"scheduled_end"`
	Status       string     `json:"status" db:"status"`
	DeviceID     string     `json:"device_id,omitempty" db:"device_id"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
}

type StartSessionInput struct {
	DeviceID string `json:"device_id"`
}

type StopSessionInput struct {
	SessionID string `json:"session_id" binding:"required,uuid"`
}

type ScheduleInput struct {
	SessionID    string    `json:"session_id" binding:"required,uuid"`
	ScheduledEnd time.Time `json:"scheduled_end" binding:"required"`
}

type ManualSessionInput struct {
	StartTime string `json:"start_time" binding:"required"`
	EndTime   string `json:"end_time" binding:"required"`
	DeviceID  string `json:"device_id"`
}

type SessionListParams struct {
	Status   string `form:"status"`
	Page     int    `form:"page,default=1"`
	PerPage  int    `form:"per_page,default=20"`
	FromDate string `form:"from_date"`
	ToDate   string `form:"to_date"`
}
