package services

import (
	"context"
	"log_book/internal/models"
	"log_book/internal/repository"
)

type AdminService struct {
	adminRepo *repository.AdminRepository
}

func NewAdminService(adminRepo *repository.AdminRepository) *AdminService {
	return &AdminService{adminRepo: adminRepo}
}

func (s *AdminService) GetDashboardStats(ctx context.Context) (*models.AdminStats, error) {
	return s.adminRepo.GetGlobalStats(ctx)
}

func (s *AdminService) GetUserStats(ctx context.Context) ([]models.UserStats, error) {
	return s.adminRepo.ScanUsers(ctx)
}

func (s *AdminService) GetAIUsageStats(ctx context.Context) ([]models.AIUsageStats, error) {
	return s.adminRepo.GetAIUsageStats(ctx)
}

func (s *AdminService) GetFeedback(ctx context.Context) ([]models.FeedbackItem, error) {
	return s.adminRepo.GetAllFeedback(ctx)
}

func (s *AdminService) GetPerUserAIUsage(ctx context.Context) ([]models.UserAIUsage, error) {
	return s.adminRepo.GetPerUserAIUsage(ctx)
}
