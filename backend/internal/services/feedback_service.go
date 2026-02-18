package services

import (
	"context"

	"log_book/internal/models"
	"log_book/internal/repository"
)

type FeedbackService struct {
	feedbackRepo *repository.FeedbackRepository
	userRepo     *repository.UserRepository
}

func NewFeedbackService(feedbackRepo *repository.FeedbackRepository, userRepo *repository.UserRepository) *FeedbackService {
	return &FeedbackService{
		feedbackRepo: feedbackRepo,
		userRepo:     userRepo,
	}
}

func (s *FeedbackService) CreateFeedback(ctx context.Context, clerkID string, input models.CreateFeedbackInput) (*models.Feedback, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	feedback := &models.Feedback{
		UserID:  user.ID,
		Name:    input.Name,
		Message: input.Message,
	}

	err = s.feedbackRepo.Create(ctx, feedback)
	if err != nil {
		return nil, err
	}

	return feedback, nil
}

func (s *FeedbackService) ListUserFeedback(ctx context.Context, clerkID string) ([]models.Feedback, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	return s.feedbackRepo.ListByUser(ctx, user.ID)
}
