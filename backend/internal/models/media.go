package models

import (
	"time"

	"github.com/google/uuid"
)

type MediaFile struct {
	ID         uuid.UUID `json:"id" db:"id"`
	DocumentID uuid.UUID `json:"document_id" db:"document_id"`
	UserID     uuid.UUID `json:"user_id" db:"user_id"`
	StorageKey string    `json:"storage_key" db:"storage_key"`
	FileName   string    `json:"file_name" db:"file_name"`
	FileType   string    `json:"file_type" db:"file_type"`
	SizeBytes  int64     `json:"size_bytes" db:"size_bytes"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

type PresignedURLRequest struct {
	FileName    string `json:"file_name" binding:"required"`
	FileType    string `json:"file_type" binding:"required"`
	FileSizeBytes int64  `json:"file_size_bytes" binding:"required"`
}

type PresignedURLResponse struct {
	UploadURL  string `json:"upload_url"`
	StorageKey string `json:"storage_key"`
	PublicURL  string `json:"public_url"`
	ExpiresAt  int64  `json:"expires_at"`
}

type ConfirmUploadInput struct {
	StorageKey string `json:"storage_key" binding:"required"`
	DocumentID string `json:"document_id" binding:"required,uuid"`
	FileName   string `json:"file_name" binding:"required"`
	FileType   string `json:"file_type" binding:"required"`
	SizeBytes  int64  `json:"size_bytes" binding:"required"`
}
