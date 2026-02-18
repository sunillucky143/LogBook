package services

import (
	"context"
	"time"

	"log_book/internal/models"
	"log_book/internal/repository"
)

type ScheduleService struct {
	sessionRepo *repository.SessionRepository
	userRepo    *repository.UserRepository
}

func NewScheduleService(sessionRepo *repository.SessionRepository, userRepo *repository.UserRepository) *ScheduleService {
	return &ScheduleService{
		sessionRepo: sessionRepo,
		userRepo:    userRepo,
	}
}

func (s *ScheduleService) SetSchedule(ctx context.Context, clerkID string, input models.ScheduleInput) (*models.TimeSession, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	session, err := s.sessionRepo.GetByID(ctx, input.SessionID)
	if err != nil {
		return nil, ErrSessionNotFound
	}

	if session.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	// Validate schedule time is in the future
	if input.ScheduledEnd.Before(time.Now().UTC()) {
		return nil, ErrInvalidScheduleTime
	}

	session.ScheduledEnd = &input.ScheduledEnd

	err = s.sessionRepo.Update(ctx, session)
	if err != nil {
		return nil, err
	}

	return session, nil
}

func (s *ScheduleService) GetSchedule(ctx context.Context, clerkID string, sessionID string) (*models.TimeSession, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return nil, ErrSessionNotFound
	}

	if session.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	return session, nil
}

func (s *ScheduleService) CancelSchedule(ctx context.Context, clerkID string, sessionID string) error {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}

	session, err := s.sessionRepo.GetByID(ctx, sessionID)
	if err != nil {
		return ErrSessionNotFound
	}

	if session.UserID != user.ID {
		return ErrUnauthorized
	}

	session.ScheduledEnd = nil

	return s.sessionRepo.Update(ctx, session)
}

// ProcessScheduledSessions is called by the scheduler to auto-stop sessions
func (s *ScheduleService) ProcessScheduledSessions(ctx context.Context) (int, error) {
	sessions, err := s.sessionRepo.GetDueScheduledSessions(ctx)
	if err != nil {
		return 0, err
	}

	count := 0
	for _, session := range sessions {
		session.EndTime = session.ScheduledEnd
		session.Status = string(models.SessionStatusCompleted)

		if err := s.sessionRepo.Update(ctx, &session); err != nil {
			// Log error but continue processing other sessions
			continue
		}
		count++
	}

	return count, nil
}
