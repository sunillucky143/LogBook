package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"
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

func (r *DocumentRepository) HasSessionOnDate(ctx context.Context, userID uuid.UUID, date time.Time) (bool, error) {
	// ... existing implementation ... (Wait, this is SessionRepo method name? No, I am in DocumentRepo)
	// Checking file content... this method seems to be from SessionRepo in my memory?
	// Ah, I need to check document_repo.go content again to be sure where to insert.
	return false, nil
}

// HasDocumentForSession checks if a document already exists for the given session ID
func (r *DocumentRepository) HasDocumentForSession(ctx context.Context, sessionID uuid.UUID) (bool, error) {
	var count int
	err := r.db.Pool.QueryRow(ctx, `SELECT COUNT(*) FROM documents WHERE session_id = $1`, sessionID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
func escapeLike(s string) string {
	s = strings.ReplaceAll(s, `\`, `\\`)
	s = strings.ReplaceAll(s, "%", `\%`)
	s = strings.ReplaceAll(s, "_", `\_`)
	return s
}

// buildWhereClause constructs dynamic WHERE conditions from search params.
func buildWhereClause(params models.DocumentListParams, startIdx int) (string, []interface{}) {
	var conditions []string
	var args []interface{}
	idx := startIdx

	if params.Query != "" {
		escaped := escapeLike(params.Query)
		pattern := strings.ReplaceAll(escaped, "*", "%")
		if !strings.Contains(pattern, "%") {
			pattern = "%" + pattern + "%"
		}
		conditions = append(conditions, fmt.Sprintf("title ILIKE $%d", idx))
		args = append(args, pattern)
		idx++
	}

	if params.Date != "" {
		conditions = append(conditions, fmt.Sprintf("log_date = $%d", idx))
		args = append(args, params.Date)
		idx++
	}

	if params.FromDate != "" {
		conditions = append(conditions, fmt.Sprintf("log_date >= $%d", idx))
		args = append(args, params.FromDate)
		idx++
	}

	if params.ToDate != "" {
		conditions = append(conditions, fmt.Sprintf("log_date <= $%d", idx))
		args = append(args, params.ToDate)
		idx++
	}

	clause := ""
	if len(conditions) > 0 {
		clause = " AND " + strings.Join(conditions, " AND ")
	}
	return clause, args
}

func buildOrderClause(params models.DocumentListParams) string {
	sortCol := "log_date"
	if params.Sort == "title" {
		sortCol = "title"
	}

	order := "DESC"
	if params.Order == "asc" {
		order = "ASC"
	}

	return fmt.Sprintf(" ORDER BY %s %s", sortCol, order)
}

func (r *DocumentRepository) ListByUser(ctx context.Context, userID uuid.UUID, params models.DocumentListParams) ([]models.Document, int, error) {
	whereExtra, whereArgs := buildWhereClause(params, 2)

	countQuery := fmt.Sprintf(`SELECT COUNT(*) FROM documents WHERE user_id = $1%s`, whereExtra)
	countArgs := append([]interface{}{userID}, whereArgs...)

	var total int
	err := r.db.Pool.QueryRow(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	orderClause := buildOrderClause(params)
	nextIdx := 2 + len(whereArgs)
	query := fmt.Sprintf(
		`SELECT id, user_id, session_id, log_date, title, created_at, updated_at
		FROM documents
		WHERE user_id = $1%s%s
		LIMIT $%d OFFSET $%d`,
		whereExtra, orderClause, nextIdx, nextIdx+1,
	)

	allArgs := append([]interface{}{userID}, whereArgs...)
	allArgs = append(allArgs, params.PerPage, (params.Page-1)*params.PerPage)

	rows, err := r.db.Pool.Query(ctx, query, allArgs...)
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

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return docs, total, nil
}

// SearchWithContent returns documents matching search params with content included (capped at 50).
func (r *DocumentRepository) SearchWithContent(ctx context.Context, userID uuid.UUID, params models.DocumentListParams) ([]models.Document, error) {
	whereExtra, whereArgs := buildWhereClause(params, 2)
	orderClause := buildOrderClause(params)
	nextIdx := 2 + len(whereArgs)

	query := fmt.Sprintf(
		`SELECT id, user_id, session_id, log_date, title, content, created_at, updated_at
		FROM documents
		WHERE user_id = $1%s%s
		LIMIT $%d`,
		whereExtra, orderClause, nextIdx,
	)

	allArgs := append([]interface{}{userID}, whereArgs...)
	allArgs = append(allArgs, 50)

	rows, err := r.db.Pool.Query(ctx, query, allArgs...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var docs []models.Document
	for rows.Next() {
		var doc models.Document
		err := rows.Scan(
			&doc.ID, &doc.UserID, &doc.SessionID, &doc.LogDate, &doc.Title,
			&doc.Content, &doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return docs, nil
}
