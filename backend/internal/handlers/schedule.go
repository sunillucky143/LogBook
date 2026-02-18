package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type ScheduleHandler struct {
	scheduleService *services.ScheduleService
}

func NewScheduleHandler(scheduleService *services.ScheduleService) *ScheduleHandler {
	return &ScheduleHandler{scheduleService: scheduleService}
}

// CreateSchedule sets a scheduled end time for a session
// POST /api/v1/schedule
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.ScheduleInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	session, err := h.scheduleService.SetSchedule(c.Request.Context(), clerkID, input)
	if err != nil {
		switch err {
		case services.ErrSessionNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Session not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to modify this session",
				nil,
			))
		case services.ErrInvalidScheduleTime:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeBadRequest,
				"Scheduled time must be in the future",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to set schedule",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(session))
}

// GetSchedule returns schedule info for a session
// GET /api/v1/schedule/:id
func (h *ScheduleHandler) GetSchedule(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	sessionID := c.Param("id")

	schedule, err := h.scheduleService.GetSchedule(c.Request.Context(), clerkID, sessionID)
	if err != nil {
		switch err {
		case services.ErrSessionNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Session not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to view this session",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to fetch schedule",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(schedule))
}

// CancelSchedule removes the scheduled end time
// DELETE /api/v1/schedule/:id
func (h *ScheduleHandler) CancelSchedule(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	sessionID := c.Param("id")

	err := h.scheduleService.CancelSchedule(c.Request.Context(), clerkID, sessionID)
	if err != nil {
		switch err {
		case services.ErrSessionNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Session not found",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to modify this session",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to cancel schedule",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{"message": "Schedule cancelled"}))
}
