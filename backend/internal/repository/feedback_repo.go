package repository

import (
	"context"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/google/uuid"
)

type FeedbackRepository struct {
	db *database.DB
}

func NewFeedbackRepository(db *database.DB) *FeedbackRepository {
	return &FeedbackRepository{db: db}
}

func (r *FeedbackRepository) Create(ctx context.Context, feedback *models.Feedback) error {
	query := `
		INSERT INTO feedback (user_id, name, message)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`

	return r.db.Pool.QueryRow(ctx, query, feedback.UserID, feedback.Name, feedback.Message).
		Scan(&feedback.ID, &feedback.CreatedAt)
}

func (r *FeedbackRepository) ListByUser(ctx context.Context, userID uuid.UUID) ([]models.Feedback, error) {
	query := `
		SELECT id, user_id, name, message, created_at
		FROM feedback
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feedbacks []models.Feedback
	for rows.Next() {
		var f models.Feedback
		err := rows.Scan(&f.ID, &f.UserID, &f.Name, &f.Message, &f.CreatedAt)
		if err != nil {
			return nil, err
		}
		feedbacks = append(feedbacks, f)
	}

	return feedbacks, rows.Err()
}
