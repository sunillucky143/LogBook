package services

import (
	"context"
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

func (s *DocumentService) CreateDocument(ctx context.Context, clerkID string, input models.CreateDocumentInput) (*models.Document, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	logDate, err := time.Parse("2006-01-02", input.LogDate)
	if err != nil {
		return nil, err
	}

	existing, _ := s.documentRepo.GetByUserAndDate(ctx, user.ID, logDate)
	if existing != nil {
		return nil, ErrDocumentExists
	}

	var sessionID *uuid.UUID
	if input.SessionID != nil {
		id, err := uuid.Parse(*input.SessionID)
		if err == nil {
			sessionID = &id
		}
	}

	doc := &models.Document{
		UserID:    user.ID,
		SessionID: sessionID,
		LogDate:   logDate,
		Title:     input.Title,
		Content:   input.Content,
	}

	err = s.documentRepo.Create(ctx, doc)
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (s *DocumentService) GetDocument(ctx context.Context, clerkID string, docID string) (*models.Document, error) {
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

	return doc, nil
}

func (s *DocumentService) UpdateDocument(ctx context.Context, clerkID string, docID string, input models.UpdateDocumentInput) (*models.Document, error) {
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

	if input.Title != "" {
		doc.Title = input.Title
	}
	doc.Content = input.Content

	err = s.documentRepo.Update(ctx, doc)
	if err != nil {
		return nil, err
	}

	return doc, nil
}

func (s *DocumentService) ListDocuments(ctx context.Context, clerkID string, params models.DocumentListParams) ([]models.Document, int, error) {
	user, err := s.userRepo.GetOrCreateByClerkID(ctx, clerkID)
	if err != nil {
		return nil, 0, err
	}

	return s.documentRepo.ListByUser(ctx, user.ID, params)
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
