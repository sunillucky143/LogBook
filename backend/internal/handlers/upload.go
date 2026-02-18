package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type UploadHandler struct {
	storageService *services.StorageService
}

func NewUploadHandler(storageService *services.StorageService) *UploadHandler {
	return &UploadHandler{storageService: storageService}
}

// GetPresignedURL generates a presigned URL for upload
// POST /api/v1/upload/presign
func (h *UploadHandler) GetPresignedURL(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.PresignedURLRequest
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	// Validate file type
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
		"video/mp4":  true,
		"video/webm": true,
		"video/quicktime": true,
	}

	if !allowedTypes[input.FileType] {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"File type not allowed",
			map[string]interface{}{
				"allowed_types": []string{"image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/webm", "video/quicktime"},
			},
		))
		return
	}

	// Max file size: 100MB
	maxSize := int64(100 * 1024 * 1024)
	if input.FileSizeBytes > maxSize {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"File too large. Maximum size is 100MB",
			nil,
		))
		return
	}

	response, err := h.storageService.GeneratePresignedURL(c.Request.Context(), clerkID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to generate upload URL",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(response))
}

// ConfirmUpload confirms a media upload and creates the database record
// POST /api/v1/upload/confirm
func (h *UploadHandler) ConfirmUpload(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.ConfirmUploadInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	media, err := h.storageService.ConfirmUpload(c.Request.Context(), clerkID, input)
	if err != nil {
		switch err {
		case services.ErrDocumentNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Document not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to add media to this document",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to confirm upload",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(media))
}

// DeleteMediaByURL deletes a media file by its public URL
// POST /api/v1/upload/delete-by-url
func (h *UploadHandler) DeleteMediaByURL(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input struct {
		URL string `json:"url" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	err := h.storageService.DeleteMediaByURL(c.Request.Context(), clerkID, input.URL)
	if err != nil {
		switch err {
		case services.ErrMediaNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Media not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to delete this media",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to delete media",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{"message": "Media deleted"}))
}

// DeleteMedia deletes a media file
// DELETE /api/v1/media/:id
func (h *UploadHandler) DeleteMedia(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	mediaID := c.Param("id")

	err := h.storageService.DeleteMedia(c.Request.Context(), clerkID, mediaID)
	if err != nil {
		switch err {
		case services.ErrMediaNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Media not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to delete this media",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to delete media",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{"message": "Media deleted"}))
}
