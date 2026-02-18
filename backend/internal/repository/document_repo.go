package repository

import (
	"context"
	"errors"
	"time"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type DocumentRepository struct {
	db *database.DB
}

func NewDocumentRepository(db *database.DB) *DocumentRepository {
	return &DocumentRepository{db: db}
}

func (r *DocumentRepository) Create(ctx context.Context, doc *models.Document) error {
	query := `
		INSERT INTO documents (user_id, session_id, log_date, title, content)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	return r.db.Pool.QueryRow(ctx, query,
		doc.UserID, doc.SessionID, doc.LogDate, doc.Title, doc.Content,
	).Scan(&doc.ID, &doc.CreatedAt, &doc.UpdatedAt)
}

func (r *DocumentRepository) GetByID(ctx context.Context, id string) (*models.Document, error) {
	query := `
		SELECT id, user_id, session_id, log_date, title, content, created_at, updated_at
		FROM documents
		WHERE id = $1
	`

	var doc models.Document
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
		&doc.Content, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("document not found")
	}

	return &doc, err
}

func (r *DocumentRepository) GetByUserAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (*models.Document, error) {
	query := `
		SELECT id, user_id, session_id, log_date, title, content, created_at, updated_at
		FROM documents
		WHERE user_id = $1 AND log_date = $2
	`

	var doc models.Document
	err := r.db.Pool.QueryRow(ctx, query, userID, date).Scan(
		&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
		&doc.Content, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	return &doc, err
}

func (r *DocumentRepository) Update(ctx context.Context, doc *models.Document) error {
	query := `
		UPDATE documents
		SET title = $1, content = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err := r.db.Pool.Exec(ctx, query, doc.Title, doc.Content, doc.ID)
	return err
}

func (r *DocumentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM documents WHERE id = $1`
	_, err := r.db.Pool.Exec(ctx, query, id)
	return err
}

func (r *DocumentRepository) ListByUser(ctx context.Context, userID uuid.UUID, params models.DocumentListParams) ([]models.Document, int, error) {
	var total int
	countQuery := `SELECT COUNT(*) FROM documents WHERE user_id = $1`
	err := r.db.Pool.QueryRow(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	query := `
		SELECT id, user_id, session_id, log_date, title, created_at, updated_at
		FROM documents
		WHERE user_id = $1
		ORDER BY log_date DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.db.Pool.Query(ctx, query, userID, params.PerPage, (params.Page-1)*params.PerPage)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var docs []models.Document
	for rows.Next() {
		var doc models.Document
		err := rows.Scan(
			&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
			&doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		docs = append(docs, doc)
	}

	return docs, total, nil
}
