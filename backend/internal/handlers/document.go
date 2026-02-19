package handlers

import (
	"net/http"

	"log_book/internal/middleware"
	"log_book/internal/models"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

type DocumentHandler struct {
	documentService *services.DocumentService
}

func NewDocumentHandler(documentService *services.DocumentService) *DocumentHandler {
	return &DocumentHandler{documentService: documentService}
}

// CreateDocument creates a new document
// POST /api/v1/documents
func (h *DocumentHandler) CreateDocument(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)

	var input models.CreateDocumentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	doc, err := h.documentService.CreateDocument(c.Request.Context(), clerkID, input)
	if err != nil {
		switch err {
		case services.ErrDocumentExists:
			c.JSON(http.StatusConflict, models.ErrorResponse(
				models.ErrCodeConflict,
				"Only one document allowed per session, per day",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to create document",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusCreated, models.SuccessResponse(doc))
}

// GetDocument retrieves a document by ID
// GET /api/v1/documents/:id
func (h *DocumentHandler) GetDocument(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	docID := c.Param("id")

	doc, err := h.documentService.GetDocument(c.Request.Context(), clerkID, docID)
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
				"You don't have permission to view this document",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to fetch document",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(doc))
}

// UpdateDocument updates a document
// PUT /api/v1/documents/:id
func (h *DocumentHandler) UpdateDocument(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	docID := c.Param("id")

	var input models.UpdateDocumentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse(
			models.ErrCodeValidation,
			"Invalid input",
			err.Error(),
		))
		return
	}

	doc, err := h.documentService.UpdateDocument(c.Request.Context(), clerkID, docID, input)
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
				"You don't have permission to modify this document",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to update document",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(doc))
}

// ListDocuments returns user's documents
// GET /api/v1/documents
func (h *DocumentHandler) ListDocuments(c *gin.Context) {
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

	docs, total, err := h.documentService.ListDocuments(c.Request.Context(), clerkID, params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse(
			models.ErrCodeInternal,
			"Failed to fetch documents",
			nil,
		))
		return
	}

	totalPages := (total + params.PerPage - 1) / params.PerPage
	c.JSON(http.StatusOK, models.SuccessResponseWithPagination(docs, &models.Pagination{
		Page:       params.Page,
		PerPage:    params.PerPage,
		Total:      total,
		TotalPages: totalPages,
	}))
}

// DeleteDocument soft deletes a document
// DELETE /api/v1/documents/:id
func (h *DocumentHandler) DeleteDocument(c *gin.Context) {
	clerkID := middleware.GetClerkID(c)
	docID := c.Param("id")

	err := h.documentService.DeleteDocument(c.Request.Context(), clerkID, docID)
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
				"You don't have permission to delete this document",
				nil,
			))
		default:
			c.JSON(http.StatusInternalServerError, models.ErrorResponse(
				models.ErrCodeInternal,
				"Failed to delete document",
				nil,
			))
		}
		return
	}

	c.JSON(http.StatusOK, models.SuccessResponse(gin.H{"message": "Document deleted"}))
}
