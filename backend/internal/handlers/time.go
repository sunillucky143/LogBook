package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type TimeHandler struct {
	timeService *services.TimeService
}

func NewTimeHandler(timeService *services.TimeService) *TimeHandler {
	return &TimeHandler{timeService: timeService}
}

// StartSession starts a new time tracking session
// POST /api/v1/time/start
func (h *TimeHandler) StartSession(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.StartSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		// Input is optional, continue with empty
	}

	session, err := h.timeService.StartSession(c.Request.Context(), clerkID, input.DeviceID)
	if err != nil {
		switch err {
		case services.ErrSessionAlreadyActive:
			c.JSON(http.StatusConflict, models.ErrorResponse(
				models.ErrCodeSessionActive,
				"You already have an active session",
				nil,
			))
		case services.ErrSessionExistsForDate:
			c.JSON(http.StatusConflict, models.ErrorResponse(
				models.ErrCodeValidation,
				"A session already exists for today. Only one session per day is allowed.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to start session",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(session))
}

// StopSession stops an active time tracking session
// POST /api/v1/time/stop
func (h *TimeHandler) StopSession(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.StopSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	session, err := h.timeService.StopSession(c.Request.Context(), clerkID, input.SessionID)
	if err != nil {
		switch err {
		case services.ErrSessionNotFound:
			c.JSON(http.StatusNotFound, models.ErrorResponse(
				models.ErrCodeNotFound,
				"Session not found",
				nil,
			))
		case services.ErrNoActiveSession:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeNoActiveSession,
				"No active session to stop",
				nil,
			))
		case services.ErrUnauthorized:
			c.JSON(http.StatusForbidden, models.ErrorResponse(
				models.ErrCodeForbidden,
				"You don't have permission to stop this session",
				nil,
			))
		case services.ErrSessionTooShort:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeValidation,
				"Session must run for at least 4 hours before stopping.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to stop session",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(session))
}

// CreateManualSession creates a completed session with custom start/end times
// POST /api/v1/sessions/manual
func (h *TimeHandler) CreateManualSession(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.ManualSessionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input: start_time and end_time are required (ISO 8601 format)",
			err.Error(),
		))
		return
	}

	session, err := h.timeService.CreateManualSession(c.Request.Context(), clerkID, input)
	if err != nil {
		switch err {
		case services.ErrInvalidTimeRange:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeValidation,
				"End time must be after start time",
				nil,
			))
		case services.ErrSessionTooShort:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeValidation,
				"Session must be at least 4 hours.",
				nil,
			))
		case services.ErrSessionTooLong:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeValidation,
				"Session duration cannot exceed 24 hours",
				nil,
			))
		case services.ErrFutureEndTime:
			c.JSON(http.StatusBadRequest, models.ErrorResponse(
				models.ErrCodeValidation,
				"End time cannot be in the future",
				nil,
			))
		case services.ErrSessionExistsForDate:
			c.JSON(http.StatusConflict, models.ErrorResponse(
				models.ErrCodeValidation,
				"A session already exists for this date. Only one session per day is allowed.",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to create session",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(session))
}

// ListSessions returns user's time sessions
// GET /api/v1/sessions
func (h *TimeHandler) ListSessions(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var params models.SessionListParams
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid query parameters",
			err.Error(),
		))
		return
	}

	sessions, total, err := h.timeService.ListSessions(c.Request.Context(), clerkID, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to fetch sessions",
			nil,
		))
		return
	}

	totalPages := (total + params.PerPage - 1) / params.PerPage
	c.JSON(http.StatusOK, models.SuccessResponseWithPagination(sessions, &models.Pagination{
		Page:       params.Page,
		PerPage:    params.PerPage,
		Total:      total,
		TotalPages: totalPages,
	}))
}

// GetActiveSession returns the user's current active session if any
// GET /api/v1/time/active
func (h *TimeHandler) GetActiveSession(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	session, err := h.timeService.GetActiveSession(c.Request.Context(), clerkID)
	if err != nil {
		if err == services.ErrNoActiveSession {
			c.JSON(http.StatusOK, models.SuccessResponse(nil))
			return
		}
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to fetch active session",
			nil,
		))
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(session))
}
