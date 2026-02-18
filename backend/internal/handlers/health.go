package handlers

import (
	"net/http"

	"log_book/internal/database"
	"log_book/internal/models"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	db *database.DB
}

func NewHealthHandler(db *database.DB) *HealthHandler {
	return &HealthHandler{db: db}
}

func (h *HealthHandler) Health(c *gin.Context) {
	// Check database connection
	if err := h.db.Health(c.Request.Context()); err != nil {
		c.JSON(http.StatusServiceUnavailable, models.ErrorResponse(
			"SERVICE_UNAVAILABLE",
			"Database connection failed",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{
		"status":  "healthy",
		"service": "log_book_api",
		"version": "1.0.0",
	}))
}

func (h *HealthHandler) Ready(c *gin.Context) {
	if err := h.db.Health(c.Request.Context()); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"ready": false})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ready": true})
}
