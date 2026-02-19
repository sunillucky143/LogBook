package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/repository"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	userRepo *repository.UserRepository
}

func NewAuthHandler(userRepo *repository.UserRepository) *AuthHandler {
	return &AuthHandler{userRepo: userRepo}
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	if clerkID == "" {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse(models.ErrCodeUnauthorized, "User not authenticated", nil))
		return
	}

	user, err := h.userRepo.GetByClerkID(c.Request.Context(), clerkID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch user profile", nil))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(user))
}
