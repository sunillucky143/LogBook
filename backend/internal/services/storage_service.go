package services

import (
	"context"
	"fmt"
	"time"

	"log_book/internal/config"
	"log_book/internal/models"
	"log_book/internal/repository"

	"github.com/google/uuid"
)

type StorageService struct {
	mediaRepo *repository.MediaRepository
	docRepo   *repository.DocumentRepository
	userRepo  *repository.UserRepository
	r2Config  config.R2Config
}

func NewStorageService(
	mediaRepo *repository.MediaRepository,
	docRepo *repository.DocumentRepository,
	userRepo *repository.UserRepository,
	r2Config config.R2Config,
) *StorageService {
	return &StorageService{
		mediaRepo: mediaRepo,
		docRepo:   docRepo,
		userRepo:  userRepo,
		r2Config:  r2Config,
	}
}

func (s *StorageService) GeneratePresignedURL(ctx context.Context, clerkID string, input models.PresignedURLRequest) (*models.PresignedURLResponse, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	// Generate unique storage key
	storageKey := fmt.Sprintf("media/%s/%s/%s",
		user.ID.String(),
		time.Now().Format("2006/01/02"),
		uuid.New().String()+getExtension(input.FileType),
	)

	// TODO: Implement actual R2 presigned URL generation
	// This requires aws-sdk-go-v2 configured for R2
	// For now, return a placeholder
	expiresAt := time.Now().Add(15 * time.Minute).Unix()

	return &models.PresignedURLResponse{
		UploadURL:  fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s?X-Amz-Expires=900", s.r2Config.AccountID, s.r2Config.BucketName, storageKey),
		StorageKey: storageKey,
		PublicURL:  fmt.Sprintf("%s/%s", s.r2Config.PublicURL, storageKey),
		ExpiresAt:  expiresAt,
	}, nil
}

func (s *StorageService) ConfirmUpload(ctx context.Context, clerkID string, input models.ConfirmUploadInput) (*models.MediaFile, error) {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return nil, err
	}

	// Verify document exists and user owns it
	doc, err := s.docRepo.GetByID(ctx, input.DocumentID)
	if err != nil {
		return nil, ErrDocumentNotFound
	}

	if doc.UserID != user.ID {
		return nil, ErrUnauthorized
	}

	docID, _ := uuid.Parse(input.DocumentID)

	media := &models.MediaFile{
		DocumentID: docID,
		UserID:     user.ID,
		StorageKey: input.StorageKey,
		FileName:   input.FileName,
		FileType:   input.FileType,
		SizeBytes:  input.SizeBytes,
	}

	err = s.mediaRepo.Create(ctx, media)
	if err != nil {
		return nil, err
	}

	return media, nil
}

func (s *StorageService) DeleteMedia(ctx context.Context, clerkID string, mediaID string) error {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}

	media, err := s.mediaRepo.GetByID(ctx, mediaID)
	if err != nil {
		return ErrMediaNotFound
	}

	if media.UserID != user.ID {
		return ErrUnauthorized
	}

	// TODO: Delete from R2 storage
	// s3Client.DeleteObject(...)

	return s.mediaRepo.Delete(ctx, media.ID)
}

func getExtension(mimeType string) string {
	extensions := map[string]string{
		"image/jpeg":      ".jpg",
		"image/png":       ".png",
		"image/gif":       ".gif",
		"image/webp":      ".webp",
		"video/mp4":       ".mp4",
		"video/webm":      ".webm",
		"video/quicktime": ".mov",
	}

	if ext, ok := extensions[mimeType]; ok {
		return ext
	}
	return ""
}
