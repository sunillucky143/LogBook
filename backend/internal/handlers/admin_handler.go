package handlers

import (
	"net/http"

	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	adminService *services.AdminService
}

func NewAdminHandler(adminService *services.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

func (h *AdminHandler) GetGlobalStats(c *gin.Context) {
	stats, err := h.adminService.GetDashboardStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch dashboard stats", nil))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(stats))
}

func (h *AdminHandler) GetUserStats(c *gin.Context) {
	stats, err := h.adminService.GetUserStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch user stats", nil))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(stats))
}

func (h *AdminHandler) GetAIUsageStats(c *gin.Context) {
	stats, err := h.adminService.GetAIUsageStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch AI usage stats", nil))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(stats))
}

func (h *AdminHandler) GetFeedback(c *gin.Context) {
	feedback, err := h.adminService.GetFeedback(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch feedback", nil))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(feedback))
}

func (h *AdminHandler) GetPerUserAIUsage(c *gin.Context) {
	usage, err := h.adminService.GetPerUserAIUsage(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(models.ErrCodeInternal, "Failed to fetch per-user AI usage", nil))
		return
	}
	c.JSON(http.StatusOK, models.SuccessResponse(usage))
}
