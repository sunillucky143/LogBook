package services

import (
	"context"
	"fmt"
	"strings"
	"time"

	"log_book/internal/config"
	"log_book/internal/models"
	"log_book/internal/repository"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type StorageService struct {
	mediaRepo     *repository.MediaRepository
	docRepo       *repository.DocumentRepository
	userRepo      *repository.UserRepository
	r2Config      config.R2Config
	s3Client      *s3.Client
	presignClient *s3.PresignClient
}

func NewStorageService(
	mediaRepo *repository.MediaRepository,
	docRepo *repository.DocumentRepository,
	userRepo *repository.UserRepository,
	r2Config config.R2Config,
) *StorageService {
	svc := &StorageService{
		mediaRepo: mediaRepo,
		docRepo:   docRepo,
		userRepo:  userRepo,
		r2Config:  r2Config,
	}

	// Initialize S3 client for R2
	r2Endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", r2Config.AccountID)

	cfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			r2Config.AccessKeyID,
			r2Config.SecretAccessKey,
			"",
		)),
		awsconfig.WithRegion("auto"),
	)
	if err == nil {
		s3Client := s3.NewFromConfig(cfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(r2Endpoint)
		})
		svc.s3Client = s3Client
		svc.presignClient = s3.NewPresignClient(s3Client)
	}

	return svc
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

	if s.presignClient == nil {
		return nil, fmt.Errorf("storage client not initialized")
	}

	// Generate presigned PUT URL
	presignResult, err := s.presignClient.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.r2Config.BucketName),
		Key:         aws.String(storageKey),
		ContentType: aws.String(input.FileType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return nil, fmt.Errorf("failed to generate presigned URL: %w", err)
	}

	expiresAt := time.Now().Add(15 * time.Minute).Unix()

	return &models.PresignedURLResponse{
		UploadURL:  presignResult.URL,
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

func (s *StorageService) deleteFromR2(ctx context.Context, storageKey string) error {
	if s.s3Client == nil {
		return fmt.Errorf("storage client not initialized")
	}

	_, err := s.s3Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(s.r2Config.BucketName),
		Key:    aws.String(storageKey),
	})
	return err
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

	// Delete from R2 storage (best-effort — don't fail if R2 delete fails)
	_ = s.deleteFromR2(ctx, media.StorageKey)

	return s.mediaRepo.Delete(ctx, media.ID)
}

func (s *StorageService) DeleteMediaByURL(ctx context.Context, clerkID string, publicURL string) error {
	user, err := s.userRepo.GetByClerkID(ctx, clerkID)
	if err != nil {
		return err
	}

	// Extract storage key from public URL by stripping the R2 public URL prefix
	storageKey := publicURL
	if s.r2Config.PublicURL != "" {
		storageKey = strings.TrimPrefix(publicURL, s.r2Config.PublicURL+"/")
	}

	// If the URL didn't match our public URL prefix, it's not our media
	if storageKey == publicURL {
		return ErrMediaNotFound
	}

	media, err := s.mediaRepo.GetByStorageKey(ctx, storageKey)
	if err != nil {
		return ErrMediaNotFound
	}

	if media.UserID != user.ID {
		return ErrUnauthorized
	}

	// Delete from R2 storage (best-effort)
	_ = s.deleteFromR2(ctx, media.StorageKey)

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
