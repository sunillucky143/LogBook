package services

import (
	"context"
	"time"

	"log_book/internal/models"
	"log_book/internal/repository"
)

type TimeService struct {
	sessionRepo *repository.SessionRepository
	userRepo    *repository.UserRepository
}

func NewTimeService(sessionRepo *repository.SessionRepository, userRepo *repository.UserRepository) *TimeService {
	return &TimeService{
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
	}
}

func (s *TimeService) StartSession(ctx context.Context, clerkID string, deviceID string) (*models.TimeSession, error) {
	// Get or create user
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	// Check for existing active session
	activeSession, err := s.sessionRepo.GetActiveSession(ctx, user.ID)
	if err != nil && err != ErrNoActiveSession {
		return nil, err
	}
	if activeSession != nil {
		return nil, ErrSessionAlreadyActive
	}

	// Check one session per day
	now := time.Now().UTC()
	exists, err := s.sessionRepo.HasSessionOnDate(ctx, user.ID, now)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrSessionExistsForDate
	}

	// Create new session
	session := &models.TimeSession{
		UserID:    user.ID,
		StartTime: now,
		Status:    string(models.SessionStatusActive),
		DeviceID:  deviceID,
	}

	err = s.sessionRepo.Create(ctx, session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *TimeService) StopSession(ctx context.Context, clerkID string, sessionID string) (*models.TimeSession, error) {
	// Get user
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	// Get session
	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, ErrSessionNotFound
	}

	// Verify ownership
	if session.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	// Check if already stopped
	if session.Status != string(models.SessionStatusActive) {
		return nil, ErrNoActiveSession
	}

	// Check minimum 4 hours
	now := time.Now().UTC()
	if now.Sub(session.StartTime) < 4*time.Hour {
		return nil, ErrSessionTooShort
	}

	// Stop the session
	session.EndTime = &now
	session.Status = string(models.SessionStatusCompleted)

	err = s.sessionRepo.Update(ctx, session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *TimeService) CreateManualSession(ctx context.Context, clerkID string, input models.ManualSessionInput) (*models.TimeSession, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	startTime, err := time.Parse(time.RFC3339, input.StartTime)
	if err != nil {
		return nil, ErrInvalidTimeRange
	}

	endTime, err := time.Parse(time.RFC3339, input.EndTime)
	if err != nil {
		return nil, ErrInvalidTimeRange
	}

	// Validate: end > start
	if !endTime.After(startTime) {
		return nil, ErrInvalidTimeRange
	}

	// Validate: duration >= 4 hours
	if endTime.Sub(startTime) < 4*time.Hour {
		return nil, ErrSessionTooShort
	}

	// Validate: duration <= 24 hours
	if endTime.Sub(startTime) > 24*time.Hour {
		return nil, ErrSessionTooLong
	}

	// Validate: end_time is not in the future
	if endTime.After(time.Now().UTC()) {
		return nil, ErrFutureEndTime
	}

	// Check one session per day
	exists, err := s.sessionRepo.HasSessionOnDate(ctx, user.ID, startTime.UTC())
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrSessionExistsForDate
	}

	session := &models.TimeSession{
		UserID:    user.ID,
		StartTime: startTime.UTC(),
		EndTime:   &endTime,
		Status:    string(models.SessionStatusCompleted),
		DeviceID:  input.DeviceID,
	}

	err = s.sessionRepo.CreateManual(ctx, session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *TimeService) ListSessions(ctx context.Context, clerkID string, params models.SessionListParams) ([]models.TimeSession, int, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, 0, err
	}

	return s.sessionRepo.ListByUser(ctx, user.ID, params)
}

func (s *TimeService) GetActiveSession(ctx context.Context, clerkID string) (*models.TimeSession, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	session, err := s.sessionRepo.GetActiveSession(ctx, user.ID)
	if err != nil {
		return nil, ErrNoActiveSession
	}

	return session, nil
}
