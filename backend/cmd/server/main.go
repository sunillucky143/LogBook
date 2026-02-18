package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"log_book/internal/config"
	"log_book/internal/database"
	"log_book/internal/handlers"
	"log_book/internal/middleware"
	"log_book/internal/repository"
	"log_book/internal/scheduler"
	"log_book/internal/services"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Set Gin mode
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialize Clerk
	middleware.InitClerk(cfg.ClerkSecret)

	// Connect to database
	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	documentRepo := repository.NewDocumentRepository(db)
	mediaRepo := repository.NewMediaRepository(db)

	// Initialize services
	timeService := services.NewTimeService(sessionRepo, userRepo)
	scheduleService := services.NewScheduleService(sessionRepo, userRepo)
	documentService := services.NewDocumentService(documentRepo, userRepo)
	storageService := services.NewStorageService(mediaRepo, documentRepo, userRepo, cfg.R2Config)

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler(db)
	timeHandler := handlers.NewTimeHandler(timeService)
	scheduleHandler := handlers.NewScheduleHandler(scheduleService)
	documentHandler := handlers.NewDocumentHandler(documentService)
	uploadHandler := handlers.NewUploadHandler(storageService)

	// Initialize rate limiter
	rateLimiter := middleware.NewRateLimiter(100, time.Minute)

	// Setup Gin router
	router := gin.Default()

	// Global middleware
	router.Use(middleware.CORSMiddleware())

	// Health check endpoints (no auth required)
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)

	// API v1 routes
	v1 := router.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware())
	v1.Use(middleware.RateLimitMiddleware(rateLimiter))
	{
		// Time tracking
		time := v1.Group("/time")
		{
			time.POST("/start", timeHandler.StartSession)
			time.POST("/stop", timeHandler.StopSession)
			time.GET("/active", timeHandler.GetActiveSession)
		}

		// Sessions
		v1.GET("/sessions", timeHandler.ListSessions)
		v1.POST("/sessions/manual", timeHandler.CreateManualSession)

		// Schedule
		schedule := v1.Group("/schedule")
		{
			schedule.POST("", scheduleHandler.CreateSchedule)
			schedule.GET("/:id", scheduleHandler.GetSchedule)
			schedule.DELETE("/:id", scheduleHandler.CancelSchedule)
		}

		// Documents
		documents := v1.Group("/documents")
		{
			documents.POST("", documentHandler.CreateDocument)
			documents.GET("", documentHandler.ListDocuments)
			documents.GET("/:id", documentHandler.GetDocument)
			documents.PUT("/:id", documentHandler.UpdateDocument)
			documents.DELETE("/:id", documentHandler.DeleteDocument)
			documents.GET("/:id/versions", documentHandler.GetVersionHistory)
			documents.GET("/:id/versions/:version", documentHandler.GetVersion)
		}

		// Upload
		upload := v1.Group("/upload")
		{
			upload.POST("/presign", uploadHandler.GetPresignedURL)
			upload.POST("/confirm", uploadHandler.ConfirmUpload)
		}

		// Media
		v1.DELETE("/media/:id", uploadHandler.DeleteMedia)
	}

	// Start scheduler for auto-stop
	sched := scheduler.New(scheduleService, time.Minute)
	sched.Start()

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server starting on port %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Stop scheduler
	sched.Stop()

	// Shutdown HTTP server with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
