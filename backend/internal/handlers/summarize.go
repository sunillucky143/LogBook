package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type SummarizeHandler struct {
	summarizeService *services.SummarizeService
}

func NewSummarizeHandler(summarizeService *services.SummarizeService) *SummarizeHandler {
	return &SummarizeHandler{summarizeService: summarizeService}
}

// Summarize streams an AI-generated summary of matching documents
// GET /api/v1/documents/summarize
func (h *SummarizeHandler) Summarize(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var params models.DocumentListParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid query parameters",
			err.Error(),
		))
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")

	flusher, ok := c.Writer.(http.Flusher)
	if !ok {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Streaming not supported",
			nil,
		))
		return
	}

	err := h.summarizeService.StreamSummary(c.Request.Context(), clerkID, params, c.Writer, flusher)
	if err != nil {
		errMsg := err.Error()
		if strings.HasPrefix(errMsg, "RATE_LIMITED:") {
			// Send rate limit as a structured SSE error the frontend can parse
			fmt.Fprintf(c.Writer, "data: {\"error\":\"%s\"}\n\n", strings.TrimPrefix(errMsg, "RATE_LIMITED: "))
			flusher.Flush()
			fmt.Fprintf(c.Writer, "data: [DONE]\n\n")
			flusher.Flush()
			return
		}
		c.SSEvent("error", errMsg)
		flusher.Flush()
	}
}

// GetQuota returns the user's remaining AI summarize quota for the current month.
// GET /api/v1/documents/summarize/quota
func (h *SummarizeHandler) GetQuota(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	used, limit, err := h.summarizeService.GetMonthlyUsage(c.Request.Context(), clerkID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch quota", nil))
		return
	}

	remaining := limit - used
	if remaining < 0 {
		remaining = 0
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{
		"used":      used,
		"limit":     limit,
		"remaining": remaining,
	}))
}
