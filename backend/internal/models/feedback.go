package models

import (
	"time"

	"github.com/google/uuid"
)

type Feedback struct {
	ID        uuid.UUID `json:"id" db:"id"`
	UserID    uuid.UUID `json:"user_id" db:"user_id"`
	Name      string    `json:"name" db:"name"`
	Message   string    `json:"message" db:"message"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

type CreateFeedbackInput struct {
	Name    string `json:"name" binding:"required,min=1,max=255"`
	Message string `json:"message" binding:"required,min=1,max=2000"`
}
