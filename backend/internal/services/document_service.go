package services

import (
	"context"
	"strconv"
	"time"

	"log_book/internal/models"
	"log_book/internal/repository"

	"github.com/google/uuid"
)

type DocumentService struct {
	documentRepo *repository.DocumentRepository
	userRepo     *repository.UserRepository
}

func NewDocumentService(documentRepo *repository.DocumentRepository, userRepo *repository.UserRepository) *DocumentService {
	return &DocumentService{
		documentRepo: documentRepo,
		userRepo:     userRepo,
	}
}

func (s *DocumentService) CreateDocument(ctx context.Context, clerkID string, input models.CreateDocumentInput) (*models.DocumentWithContent, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	// Parse log date
	logDate, err := time.Parse("2006-01-02", input.LogDate)
	if err != nil {
		return nil, err
	}

	// Check if document exists for this date
	existing, _ := s.documentRepo.GetByUserAndDate(ctx, user.ID, logDate)
	if existing != nil {
		return nil, ErrDocumentExists
	}

	// Parse session ID if provided
	var sessionID *uuid.UUID
	if input.SessionID != nil {
		id, err := uuid.Parse(*input.SessionID)
		if err == nil {
			sessionID = &id
		}
	}

	doc := &models.Document{
		UserID:         user.ID,
		SessionID:      sessionID,
		LogDate:        logDate,
		Title:          input.Title,
		CurrentVersion: 1,
	}

	err = s.documentRepo.Create(ctx, doc, input.Content)
	if err != nil {
		return nil, err
	}

	return &models.DocumentWithContent{
		Document: *doc,
		Content:  input.Content,
	}, nil
}

func (s *DocumentService) GetDocument(ctx context.Context, clerkID string, docID string) (*models.DocumentWithContent, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	doc, err := s.documentRepo.GetByID(ctx, docID)
	if err != nil {
		return nil, ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	// Get current version content
	version, err := s.documentRepo.GetVersion(ctx, doc.ID, doc.CurrentVersion)
	if err != nil {
		return nil, err
	}

	return &models.DocumentWithContent{
		Document: *doc,
		Content:  version.Content,
	}, nil
}

func (s *DocumentService) UpdateDocument(ctx context.Context, clerkID string, docID string, input models.UpdateDocumentInput) (*models.DocumentWithContent, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	doc, err := s.documentRepo.GetByID(ctx, docID)
	if err != nil {
		return nil, ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	// Update title if provided
	if input.Title != "" {
		doc.Title = input.Title
	}

	// Create new version
	doc.CurrentVersion++

	// Determine if this should be a full snapshot (every 10th version)
	isFullSnapshot := doc.CurrentVersion%10 == 0

	err = s.documentRepo.Update(ctx, doc, input.Content, isFullSnapshot)
	if err != nil {
		return nil, err
	}

	return &models.DocumentWithContent{
		Document: *doc,
		Content:  input.Content,
	}, nil
}

func (s *DocumentService) ListDocuments(ctx context.Context, clerkID string, params models.DocumentListParams) ([]models.Document, int, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, 0, err
	}

	return s.documentRepo.ListByUser(ctx, user.ID, params)
}

func (s *DocumentService) GetVersionHistory(ctx context.Context, clerkID string, docID string) ([]models.DocumentVersion, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	doc, err := s.documentRepo.GetByID(ctx, docID)
	if err != nil {
		return nil, ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	return s.documentRepo.GetVersionHistory(ctx, doc.ID)
}

func (s *DocumentService) GetVersion(ctx context.Context, clerkID string, docID string, versionStr string) (*models.DocumentVersion, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	doc, err := s.documentRepo.GetByID(ctx, docID)
	if err != nil {
		return nil, ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	versionNum, err := strconv.Atoi(versionStr)
	if err != nil {
		return nil, ErrVersionNotFound
	}

	version, err := s.documentRepo.GetVersion(ctx, doc.ID, versionNum)
	if err != nil {
		return nil, ErrVersionNotFound
	}

	return version, nil
}

func (s *DocumentService) DeleteDocument(ctx context.Context, clerkID string, docID string) error {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}

	doc, err := s.documentRepo.GetByID(ctx, docID)
	if err != nil {
		return ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return ErrUnauthorized
	}

	return s.documentRepo.Delete(ctx, doc.ID)
}
