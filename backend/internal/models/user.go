package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id" db:"id"`
	ClerkID   string    `json:"clerk_id" db:"clerk_id"`
	Email     string    `json:"email" db:"email"`
	Name      string    `json:"name" db:"name"`
	Role      string    `json:"role" db:"role"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type CreateUserInput struct {
	ClerkID string `json:"clerk_id" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Name    string `json:"name"`
}

type UpdateUserInput struct {
	Name string `json:"name"`
}
