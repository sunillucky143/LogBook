package repository

import (
	"context"
	"log_book/internal/database"
	"log_book/internal/models"
)

type AdminRepository struct {
	db *database.DB
}

func NewAdminRepository(db *database.DB) *AdminRepository {
	return &AdminRepository{db: db}
}

func (r *AdminRepository) GetGlobalStats(ctx context.Context) (*models.AdminStats, error) {
	stats := &models.AdminStats{}

	// Parallel queries or sequential? Sequential is fine for now.

	// Total Users
	err := r.db.Pool.QueryRow(ctx, "SELECT count(*) FROM users").Scan(&stats.TotalUsers)
	if err != nil {
		return nil, err
	}

	// Total Docs
	err = r.db.Pool.QueryRow(ctx, "SELECT count(*) FROM documents").Scan(&stats.TotalDocs)
	if err != nil {
		return nil, err
	}

	// Total Sessions
	err = r.db.Pool.QueryRow(ctx, "SELECT count(*) FROM time_sessions").Scan(&stats.TotalSessions)
	if err != nil {
		return nil, err
	}

	// Total Feedback
	err = r.db.Pool.QueryRow(ctx, "SELECT count(*) FROM feedback").Scan(&stats.TotalFeedback)
	if err != nil {
		return nil, err
	}

	// Total AI Usage
	// Total AI Usage
	// The query returns 3 columns, we must scan 3 variables.
	var totalRequests, totalInput, totalOutput int
	err = r.db.Pool.QueryRow(ctx, `
		SELECT 
			COALESCE(SUM(request_count), 0), 
			COALESCE(SUM(input_tokens), 0), 
			COALESCE(SUM(output_tokens), 0) 
		FROM ai_usage_daily
	`).Scan(&totalRequests, &totalInput, &totalOutput)

	if err != nil {
		return nil, err
	}

	stats.AIUsage = models.AIUsageAggStats{
		TotalRequests:     totalRequests,
		TotalInputTokens:  totalInput,
		TotalOutputTokens: totalOutput,
	}

	return stats, nil
}

func (r *AdminRepository) ScanUsers(ctx context.Context) ([]models.UserStats, error) {
	query := `
		SELECT 
			u.id, u.clerk_id, u.email, u.name, u.role, u.created_at, u.updated_at,
			(SELECT count(*) FROM documents d WHERE d.user_id = u.id) as doc_count,
			(SELECT count(*) FROM time_sessions s WHERE s.user_id = u.id) as session_count,
			(SELECT COALESCE(SUM(request_count), 0) FROM ai_usage_daily a WHERE a.user_id = u.id) as ai_count
		FROM users u
		ORDER BY u.created_at DESC
	`
	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users = []models.UserStats{}
	for rows.Next() {
		var u models.UserStats
		err := rows.Scan(
			&u.ID, &u.ClerkID, &u.Email, &u.Name, &u.Role, &u.CreatedAt, &u.UpdatedAt,
			&u.DocumentsCount, &u.SessionsCount, &u.AIRequestCount,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *AdminRepository) GetAIUsageStats(ctx context.Context) ([]models.AIUsageStats, error) {
	// Group by date
	query := `
		SELECT 
			date::text, 
			SUM(request_count), 
			SUM(input_tokens), 
			SUM(output_tokens)
		FROM ai_usage_daily
		GROUP BY date
		ORDER BY date DESC
		LIMIT 30
	`
	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var stats = []models.AIUsageStats{}
	for rows.Next() {
		var s models.AIUsageStats
		err := rows.Scan(&s.Date, &s.RequestCount, &s.InputTokens, &s.OutputTokens)
		if err != nil {
			return nil, err
		}
		stats = append(stats, s)
	}
	return stats, nil
}

func (r *AdminRepository) UpsertAIUsage(ctx context.Context, userID string, date string, inputTokens, outputTokens int) error {
	query := `
		INSERT INTO ai_usage_daily (user_id, date, request_count, input_tokens, output_tokens)
		VALUES ($1, $2, 1, $3, $4)
		ON CONFLICT (user_id, date)
		DO UPDATE SET
			request_count = ai_usage_daily.request_count + 1,
			input_tokens = ai_usage_daily.input_tokens + EXCLUDED.input_tokens,
			output_tokens = ai_usage_daily.output_tokens + EXCLUDED.output_tokens,
			updated_at = NOW()
	`
	_, err := r.db.Pool.Exec(ctx, query, userID, date, inputTokens, outputTokens)
	return err
}

func (r *AdminRepository) GetMonthlyRequestCount(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.Pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(request_count), 0)
		FROM ai_usage_daily
		WHERE user_id = $1
		AND date >= date_trunc('month', CURRENT_DATE)
	`, userID).Scan(&count)
	return count, err
}

func (r *AdminRepository) GetPerUserAIUsage(ctx context.Context) ([]models.UserAIUsage, error) {
	query := `
		SELECT u.id, u.name, u.email,
			COALESCE(SUM(a.request_count), 0),
			COALESCE(SUM(a.input_tokens), 0),
			COALESCE(SUM(a.output_tokens), 0),
			COALESCE(SUM(CASE WHEN a.date >= date_trunc('month', CURRENT_DATE) THEN a.request_count ELSE 0 END), 0)
		FROM users u
		LEFT JOIN ai_usage_daily a ON a.user_id = u.id
		GROUP BY u.id, u.name, u.email
		ORDER BY SUM(a.request_count) DESC NULLS LAST
	`
	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var usage = []models.UserAIUsage{}
	for rows.Next() {
		var u models.UserAIUsage
		err := rows.Scan(&u.UserID, &u.Name, &u.Email, &u.TotalRequests, &u.TotalInputTokens, &u.TotalOutputTokens, &u.MonthlyRequests)
		if err != nil {
			return nil, err
		}
		usage = append(usage, u)
	}
	return usage, nil
}

func (r *AdminRepository) GetAllFeedback(ctx context.Context) ([]models.FeedbackItem, error) {
	query := `
		SELECT f.id, f.user_id, f.type, f.message, f.created_at, u.name, u.email
		FROM feedback f
		JOIN users u ON f.user_id = u.id
		ORDER BY f.created_at DESC
	`
	rows, err := r.db.Pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var feedbacks = []models.FeedbackItem{}
	for rows.Next() {
		var f models.FeedbackItem
		var userName, userEmail string
		err := rows.Scan(&f.ID, &f.UserID, &f.Type, &f.Message, &f.CreatedAt, &userName, &userEmail)
		if err != nil {
			return nil, err
		}
		f.User = &models.User{Name: userName, Email: userEmail}
		feedbacks = append(feedbacks, f)
	}
	return feedbacks, nil
}
