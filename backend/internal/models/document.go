package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID        uuid.UUID       `json:"id" db:"id"`
	UserID    uuid.UUID       `json:"user_id" db:"user_id"`
	SessionID *uuid.UUID      `json:"session_id,omitempty" db:"session_id"`
	LogDate   time.Time       `json:"log_date" db:"log_date"`
	Title     string          `json:"title" db:"title"`
	Content   json.RawMessage `json:"content" db:"content"`
	CreatedAt time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt time.Time       `json:"updated_at" db:"updated_at"`
}

type CreateDocumentInput struct {
	SessionID *string         `json:"session_id"`
	LogDate   string          `json:"log_date" binding:"required"`
	Title     string          `json:"title"`
	Content   json.RawMessage `json:"content" binding:"required"`
}

type UpdateDocumentInput struct {
	Title   string          `json:"title"`
	Content json.RawMessage `json:"content" binding:"required"`
}

type DocumentListParams struct {
	Page     int    `form:"page,default=1"`
	PerPage  int    `form:"per_page,default=20"`
	FromDate string `form:"from_date"`
	ToDate   string `form:"to_date"`
}
