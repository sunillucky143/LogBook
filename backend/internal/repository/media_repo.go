package repository

import (
	"context"
	"errors"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type MediaRepository struct {
	db *database.DB
}

func NewMediaRepository(db *database.DB) *MediaRepository {
	return &MediaRepository{db: db}
}

func (r *MediaRepository) Create(ctx context.Context, media *models.MediaFile) error {
	query := `
		INSERT INTO media_files (document_id, user_id, storage_key, file_name, file_type, size_bytes)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at
	`

	return r.db.Pool.QueryRow(ctx, query,
		media.DocumentID, media.UserID, media.StorageKey,
		media.FileName, media.FileType, media.SizeBytes,
	).Scan(&media.ID, &media.CreatedAt)
}

func (r *MediaRepository) GetByID(ctx context.Context, id string) (*models.MediaFile, error) {
	query := `
		SELECT id, document_id, user_id, storage_key, file_name, file_type, size_bytes, created_at
		FROM media_files
		WHERE id = $1
	`

	var media models.MediaFile
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&media.ID, &media.DocumentID, &media.UserID, &media.StorageKey,
		&media.FileName, &media.FileType, &media.SizeBytes, &media.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("media not found")
	}

	return &media, err
}

func (r *MediaRepository) ListByDocument(ctx context.Context, docID uuid.UUID) ([]models.MediaFile, error) {
	query := `
		SELECT id, document_id, user_id, storage_key, file_name, file_type, size_bytes, created_at
		FROM media_files
		WHERE document_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.db.Pool.Query(ctx, query, docID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var files []models.MediaFile
	for rows.Next() {
		var media models.MediaFile
		err := rows.Scan(
			&media.ID, &media.DocumentID, &media.UserID, &media.StorageKey,
			&media.FileName, &media.FileType, &media.SizeBytes, &media.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		files = append(files, media)
	}

	return files, nil
}

func (r *MediaRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM media_files WHERE id = $1`
	_, err := r.db.Pool.Exec(ctx, query, id)
	return err
}

func (r *MediaRepository) DeleteByDocument(ctx context.Context, docID uuid.UUID) error {
	query := `DELETE FROM media_files WHERE document_id = $1`
	_, err := r.db.Pool.Exec(ctx, query, docID)
	return err
}
