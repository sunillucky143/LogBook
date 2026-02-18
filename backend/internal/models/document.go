package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type Document struct {
	ID             uuid.UUID  `json:"id" db:"id"`
	UserID         uuid.UUID  `json:"user_id" db:"user_id"`
	SessionID      *uuid.UUID `json:"session_id,omitempty" db:"session_id"`
	LogDate        time.Time  `json:"log_date" db:"log_date"`
	Title          string     `json:"title" db:"title"`
	CurrentVersion int        `json:"current_version" db:"current_version"`
	CreatedAt      time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at" db:"updated_at"`
}

type DocumentVersion struct {
	ID             uuid.UUID       `json:"id" db:"id"`
	DocumentID     uuid.UUID       `json:"document_id" db:"document_id"`
	VersionNumber  int             `json:"version_number" db:"version_number"`
	Content        json.RawMessage `json:"content" db:"content"`
	IsFullSnapshot bool            `json:"is_full_snapshot" db:"is_full_snapshot"`
	CreatedAt      time.Time       `json:"created_at" db:"created_at"`
}

type DocumentWithContent struct {
	Document
	Content json.RawMessage `json:"content"`
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

// TipTap document structure
type TipTapDocument struct {
	Type    string        `json:"type"`
	Content []TipTapBlock `json:"content"`
}

type TipTapBlock struct {
	Type    string                 `json:"type"`
	Attrs   map[string]interface{} `json:"attrs,omitempty"`
	Content []TipTapContent        `json:"content,omitempty"`
}

type TipTapContent struct {
	Type  string                 `json:"type"`
	Text  string                 `json:"text,omitempty"`
	Attrs map[string]interface{} `json:"attrs,omitempty"`
	Marks []TipTapMark           `json:"marks,omitempty"`
}

type TipTapMark struct {
	Type  string                 `json:"type"`
	Attrs map[string]interface{} `json:"attrs,omitempty"`
}
