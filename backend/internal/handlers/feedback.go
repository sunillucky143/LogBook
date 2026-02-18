package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type FeedbackHandler struct {
	feedbackService *services.FeedbackService
}

func NewFeedbackHandler(feedbackService *services.FeedbackService) *FeedbackHandler {
	return &FeedbackHandler{feedbackService: feedbackService}
}

// CreateFeedback submits user feedback
// POST /api/v1/feedback
func (h *FeedbackHandler) CreateFeedback(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.CreateFeedbackInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Name and message are required",
			err.Error(),
		))
		return
	}

	feedback, err := h.feedbackService.CreateFeedback(c.Request.Context(), clerkID, input)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to submit feedback",
			nil,
		))
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(feedback))
}

// ListFeedback returns the current user's submitted feedback
// GET /api/v1/feedback
func (h *FeedbackHandler) ListFeedback(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	feedbacks, err := h.feedbackService.ListUserFeedback(c.Request.Context(), clerkID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to fetch feedback",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(feedbacks))
}
