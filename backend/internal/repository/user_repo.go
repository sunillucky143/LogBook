package repository

import (
	"context"
	"errors"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type UserRepository struct {
	db *database.DB
}

func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
		INSERT INTO users (clerk_id, email, name)
		VALUES ($1, $2, $3)
		RETURNING id, created_at, updated_at
	`

	return r.db.Pool.QueryRow(ctx, query, user.ClerkID, user.Email, user.Name).
		Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, clerk_id, email, name, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`

	var user models.User
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&user.ID, &user.ClerkID, &user.Email, &user.Name, &user.Role,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("user not found")
	}

	return &user, err
}

func (r *UserRepository) GetByClerkID(ctx context.Context, clerkID string) (*models.User, error) {
	query := `
		SELECT id, clerk_id, email, name, role, created_at, updated_at
		FROM users
		WHERE clerk_id = $1
	`

	var user models.User
	err := r.db.Pool.QueryRow(ctx, query, clerkID).Scan(
		&user.ID, &user.ClerkID, &user.Email, &user.Name, &user.Role,
		&user.CreatedAt, &user.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("user not found")
	}

	return &user, err
}

func (r *UserRepository) GetOrCreateByClerkID(ctx context.Context, clerkID string) (*models.User, error) {
	// Try to get existing user
	user, err := r.GetByClerkID(ctx, clerkID)
	if err == nil {
		return user, nil
	}

	// Create new user (email will be synced via webhook)
	newUser := &models.User{
		ClerkID: clerkID,
		Email:   clerkID + "@placeholder.com", // Will be updated by Clerk webhook
	}

	err = r.Create(ctx, newUser)
	if err != nil {
		// User might have been created by another request
		return r.GetByClerkID(ctx, clerkID)
	}

	return newUser, nil
}

func (r *UserRepository) Update(ctx context.Context, user *models.User) error {
	query := `
		UPDATE users
		SET email = $1, name = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err := r.db.Pool.Exec(ctx, query, user.Email, user.Name, user.ID)
	return err
}

func (r *UserRepository) SyncUser(ctx context.Context, clerkID, email, name string) (*models.User, error) {
	// Try to get existing user
	user, err := r.GetByClerkID(ctx, clerkID)
	if err != nil {
		// Create new user if not found
		newUser := &models.User{
			ClerkID: clerkID,
			Email:   email,
			Name:    name,
		}
		if newUser.Email == "" {
			newUser.Email = clerkID + "@placeholder.com"
		}
		if err := r.Create(ctx, newUser); err != nil {
			return nil, err
		}
		return newUser, nil
	}

	// Update if info changed/missing
	shouldUpdate := false
	if name != "" && user.Name != name {
		user.Name = name
		shouldUpdate = true
	}
	if email != "" && user.Email != email && user.Email == clerkID + "@placeholder.com" {
		// Only update email if it was a placeholder or we want to force sync?
		// Let's force sync email too if provided
		user.Email = email
		shouldUpdate = true
	} else if email != "" && user.Email != email {
		user.Email = email
		shouldUpdate = true
	}

	if shouldUpdate {
		if err := r.Update(ctx, user); err != nil {
			return nil, err
		}
	}

	return user, nil
}
