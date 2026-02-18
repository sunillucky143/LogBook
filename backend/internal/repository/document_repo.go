package repository

import (
	"context"
	"encoding/json"
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

func (r *DocumentRepository) Create(ctx context.Context, doc *models.Document, content json.RawMessage) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Create document
	docQuery := `
		INSERT INTO documents (user_id, session_id, log_date, title, current_version)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at, updated_at
	`

	err = tx.QueryRow(ctx, docQuery,
		doc.UserID, doc.SessionID, doc.LogDate, doc.Title, doc.CurrentVersion,
	).Scan(&doc.ID, &doc.CreatedAt, &doc.UpdatedAt)
	if err != nil {
		return err
	}

	// Create first version
	versionQuery := `
		INSERT INTO document_versions (document_id, version_number, content, is_full_snapshot)
		VALUES ($1, $2, $3, $4)
	`

	_, err = tx.Exec(ctx, versionQuery, doc.ID, 1, content, true)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *DocumentRepository) GetByID(ctx context.Context, id string) (*models.Document, error) {
	query := `
		SELECT id, user_id, session_id, log_date, title, current_version, created_at, updated_at
		FROM documents
		WHERE id = $1
	`

	var doc models.Document
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
		&doc.CurrentVersion, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("document not found")
	}

	return &doc, err
}

func (r *DocumentRepository) GetByUserAndDate(ctx context.Context, userID uuid.UUID, date time.Time) (*models.Document, error) {
	query := `
		SELECT id, user_id, session_id, log_date, title, current_version, created_at, updated_at
		FROM documents
		WHERE user_id = $1 AND log_date = $2
	`

	var doc models.Document
	err := r.db.Pool.QueryRow(ctx, query, userID, date).Scan(
		&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
		&doc.CurrentVersion, &doc.CreatedAt, &doc.UpdatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	return &doc, err
}

func (r *DocumentRepository) Update(ctx context.Context, doc *models.Document, content json.RawMessage, isFullSnapshot bool) error {
	tx, err := r.db.Pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Update document
	docQuery := `
		UPDATE documents
		SET title = $1, current_version = $2, updated_at = NOW()
		WHERE id = $3
	`

	_, err = tx.Exec(ctx, docQuery, doc.Title, doc.CurrentVersion, doc.ID)
	if err != nil {
		return err
	}

	// Create new version
	versionQuery := `
		INSERT INTO document_versions (document_id, version_number, content, is_full_snapshot)
		VALUES ($1, $2, $3, $4)
	`

	_, err = tx.Exec(ctx, versionQuery, doc.ID, doc.CurrentVersion, content, isFullSnapshot)
	if err != nil {
		return err
	}

	return tx.Commit(ctx)
}

func (r *DocumentRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM documents WHERE id = $1`
	_, err := r.db.Pool.Exec(ctx, query, id)
	return err
}

func (r *DocumentRepository) ListByUser(ctx context.Context, userID uuid.UUID, params models.DocumentListParams) ([]models.Document, int, error) {
	// Count total
	var total int
	countQuery := `SELECT COUNT(*) FROM documents WHERE user_id = $1`
	err := r.db.Pool.QueryRow(ctx, countQuery, userID).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	query := `
		SELECT id, user_id, session_id, log_date, title, current_version, created_at, updated_at
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
			&doc.CurrentVersion, &doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		docs = append(docs, doc)
	}

	return docs, total, nil
}

func (r *DocumentRepository) GetVersion(ctx context.Context, docID uuid.UUID, versionNum int) (*models.DocumentVersion, error) {
	query := `
		SELECT id, document_id, version_number, content, is_full_snapshot, created_at
		FROM document_versions
		WHERE document_id = $1 AND version_number = $2
	`

	var version models.DocumentVersion
	err := r.db.Pool.QueryRow(ctx, query, docID, versionNum).Scan(
		&version.ID, &version.DocumentID, &version.VersionNumber,
		&version.Content, &version.IsFullSnapshot, &version.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("version not found")
	}

	return &version, err
}

func (r *DocumentRepository) GetVersionHistory(ctx context.Context, docID uuid.UUID) ([]models.DocumentVersion, error) {
	query := `
		SELECT id, document_id, version_number, content, is_full_snapshot, created_at
		FROM document_versions
		WHERE document_id = $1
		ORDER BY version_number DESC
		LIMIT 50
	`

	rows, err := r.db.Pool.Query(ctx, query, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var versions []models.DocumentVersion
	for rows.Next() {
		var version models.DocumentVersion
		err := rows.Scan(
			&version.ID, &version.DocumentID, &version.VersionNumber,
			&version.Content, &version.IsFullSnapshot, &version.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		versions = append(versions, version)
	}

	return versions, nil
}
