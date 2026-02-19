package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

type SessionRepository struct {
	db *database.DB
}

func NewSessionRepository(db *database.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) Create(ctx context.Context, session *models.TimeSession) error {
	query := `
		INSERT INTO time_sessions (user_id, start_time, status, device_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	return r.db.Pool.QueryRow(ctx, query,
		session.UserID, session.StartTime, session.Status, session.DeviceID,
	).Scan(&session.ID, &session.CreatedAt)
}

func (r *SessionRepository) CreateManual(ctx context.Context, session *models.TimeSession) error {
	query := `
		INSERT INTO time_sessions (user_id, start_time, end_time, status, device_id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	return r.db.Pool.QueryRow(ctx, query,
		session.UserID, session.StartTime, session.EndTime, session.Status, session.DeviceID,
	).Scan(&session.ID, &session.CreatedAt)
}

func (r *SessionRepository) GetByID(ctx context.Context, id string) (*models.TimeSession, error) {
	query := `
		SELECT id, user_id, start_time, end_time, scheduled_end, status, device_id, created_at
		FROM time_sessions
		WHERE id = $1
	`

	var session models.TimeSession
	err := r.db.Pool.QueryRow(ctx, query, id).Scan(
		&session.ID, &session.UserID, &session.StartTime, &session.EndTime,
		&session.ScheduledEnd, &session.Status, &session.DeviceID, &session.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("session not found")
	}

	return &session, err
}

func (r *SessionRepository) GetActiveSession(ctx context.Context, userID uuid.UUID) (*models.TimeSession, error) {
	query := `
		SELECT id, user_id, start_time, end_time, scheduled_end, status, device_id, created_at
		FROM time_sessions
		WHERE user_id = $1 AND status = 'active'
		ORDER BY created_at DESC
		LIMIT 1
	`

	var session models.TimeSession
	err := r.db.Pool.QueryRow(ctx, query, userID).Scan(
		&session.ID, &session.UserID, &session.StartTime, &session.EndTime,
		&session.ScheduledEnd, &session.Status, &session.DeviceID, &session.CreatedAt,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}

	return &session, err
}

func (r *SessionRepository) HasSessionOnDate(ctx context.Context, userID uuid.UUID, date time.Time) (bool, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	endOfDay := startOfDay.AddDate(0, 0, 1)

	var count int
	err := r.db.Pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM time_sessions
		WHERE user_id = $1 AND start_time >= $2 AND start_time < $3
	`, userID, startOfDay, endOfDay).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *SessionRepository) Update(ctx context.Context, session *models.TimeSession) error {
	query := `
		UPDATE time_sessions
		SET end_time = $1, scheduled_end = $2, status = $3
		WHERE id = $4
	`

	_, err := r.db.Pool.Exec(ctx, query,
		session.EndTime, session.ScheduledEnd, session.Status, session.ID,
	)
	return err
}

func (r *SessionRepository) ListByUser(ctx context.Context, userID uuid.UUID, params models.SessionListParams) ([]models.TimeSession, int, error) {
	// Build shared WHERE filters
	filterSQL := ""
	filterArgs := []interface{}{userID}
	argIndex := 2

	if params.Status != "" {
		filterSQL += fmt.Sprintf(` AND status = $%d`, argIndex)
		filterArgs = append(filterArgs, params.Status)
		argIndex++
	}

	if params.FromDate != "" {
		fromTime, err := time.Parse("2006-01-02", params.FromDate)
		if err == nil {
			filterSQL += fmt.Sprintf(` AND start_time >= $%d`, argIndex)
			filterArgs = append(filterArgs, fromTime.UTC())
			argIndex++
		}
	}

	if params.ToDate != "" {
		toTime, err := time.Parse("2006-01-02", params.ToDate)
		if err == nil {
			// End of the to_date day
			nextDay := toTime.AddDate(0, 0, 1)
			filterSQL += fmt.Sprintf(` AND start_time < $%d`, argIndex)
			filterArgs = append(filterArgs, nextDay.UTC())
			argIndex++
		}
	}

	// Count total
	countQuery := `SELECT COUNT(*) FROM time_sessions WHERE user_id = $1` + filterSQL
	var total int
	err := r.db.Pool.QueryRow(ctx, countQuery, filterArgs...).Scan(&total)
	if err != nil {
		return nil, 0, err
	}

	// Get paginated results
	query := `
		SELECT id, user_id, start_time, end_time, scheduled_end, status, device_id, created_at
		FROM time_sessions
		WHERE user_id = $1
	` + filterSQL

	args := make([]interface{}, len(filterArgs))
	copy(args, filterArgs)

	query += fmt.Sprintf(` ORDER BY start_time DESC LIMIT $%d OFFSET $%d`, argIndex, argIndex+1)
	args = append(args, params.PerPage, (params.Page-1)*params.PerPage)

	rows, err := r.db.Pool.Query(ctx, query, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var sessions []models.TimeSession
	for rows.Next() {
		var session models.TimeSession
		err := rows.Scan(
			&session.ID, &session.UserID, &session.StartTime, &session.EndTime,
			&session.ScheduledEnd, &session.Status, &session.DeviceID, &session.CreatedAt,
		)
		if err != nil {
			return nil, 0, err
		}
		sessions = append(sessions, session)
	}

	if err := rows.Err(); err != nil {
		return nil, 0, err
	}

	return sessions, total, nil
}

func (r *SessionRepository) GetDueScheduledSessions(ctx context.Context) ([]models.TimeSession, error) {
	query := `
		SELECT id, user_id, start_time, end_time, scheduled_end, status, device_id, created_at
		FROM time_sessions
		WHERE scheduled_end <= $1 AND status = 'active'
	`

	rows, err := r.db.Pool.Query(ctx, query, time.Now().UTC())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.TimeSession
	for rows.Next() {
		var session models.TimeSession
		err := rows.Scan(
			&session.ID, &session.UserID, &session.StartTime, &session.EndTime,
			&session.ScheduledEnd, &session.Status, &session.DeviceID, &session.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return sessions, nil
}
