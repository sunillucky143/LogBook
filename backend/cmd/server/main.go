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
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	middleware.InitClerk(cfg.ClerkSecret)

	db, err := database.New(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Repositories
	userRepo := repository.NewUserRepository(db)
	sessionRepo := repository.NewSessionRepository(db)
	documentRepo := repository.NewDocumentRepository(db)
	mediaRepo := repository.NewMediaRepository(db)
	feedbackRepo := repository.NewFeedbackRepository(db)
	adminRepo := repository.NewAdminRepository(db)

	// Services
	timeService := services.NewTimeService(sessionRepo, userRepo)
	scheduleService := services.NewScheduleService(sessionRepo, userRepo)
	documentService := services.NewDocumentService(documentRepo, userRepo)
	storageService := services.NewStorageService(mediaRepo, documentRepo, userRepo, cfg.R2Config)
	feedbackService := services.NewFeedbackService(feedbackRepo, userRepo)
	summarizeService := services.NewSummarizeService(documentRepo, userRepo, adminRepo, cfg.ClaudeAPIKey)
	adminService := services.NewAdminService(adminRepo)

	// Handlers
	healthHandler := handlers.NewHealthHandler(db)
	timeHandler := handlers.NewTimeHandler(timeService)
	scheduleHandler := handlers.NewScheduleHandler(scheduleService)
	documentHandler := handlers.NewDocumentHandler(documentService)
	uploadHandler := handlers.NewUploadHandler(storageService)
	feedbackHandler := handlers.NewFeedbackHandler(feedbackService)
	authHandler := handlers.NewAuthHandler(userRepo)
	summarizeHandler := handlers.NewSummarizeHandler(summarizeService)
	adminHandler := handlers.NewAdminHandler(adminService)

	rateLimiter := middleware.NewRateLimiter(100, time.Minute)

	router := gin.Default()
	router.Use(middleware.CORSMiddleware(cfg.AllowedOrigins))

	// Request body size limit (10MB)
	router.MaxMultipartMemory = 10 << 20

	// Health (no auth)
	router.GET("/health", healthHandler.Health)
	router.GET("/ready", healthHandler.Ready)

	// API v1 (auth + rate limit)
	v1 := router.Group("/api/v1")
	v1.Use(middleware.AuthMiddleware(userRepo))
	v1.Use(middleware.RateLimitMiddleware(rateLimiter))
	{
		// Auth
		v1.GET("/me", authHandler.GetMe)

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
			documents.GET("/summarize/quota", summarizeHandler.GetQuota)
			documents.GET("/summarize", summarizeHandler.Summarize)

			documents.GET("/:id", documentHandler.GetDocument)
			documents.PUT("/:id", documentHandler.UpdateDocument)
			documents.DELETE("/:id", documentHandler.DeleteDocument)
		}

		// Upload
		upload := v1.Group("/upload")
		{
			upload.POST("/presign", uploadHandler.GetPresignedURL)
			upload.POST("/confirm", uploadHandler.ConfirmUpload)
			upload.POST("/delete-by-url", uploadHandler.DeleteMediaByURL)
		}

		// Media
		v1.DELETE("/media/:id", uploadHandler.DeleteMedia)

		// Feedback
		v1.POST("/feedback", feedbackHandler.CreateFeedback)
		v1.GET("/feedback", feedbackHandler.ListFeedback)

		// Admin
		admin := v1.Group("/admin")
		admin.Use(middleware.AdminMiddleware(userRepo))
		{
			admin.GET("/stats", adminHandler.GetGlobalStats)
			admin.GET("/users", adminHandler.GetUserStats)
			admin.GET("/ai-usage", adminHandler.GetAIUsageStats)
			admin.GET("/ai-usage/users", adminHandler.GetPerUserAIUsage)
			admin.GET("/feedback", adminHandler.GetFeedback)
		}
	}

	// Background scheduler
	sched := scheduler.New(scheduleService, time.Minute)
	sched.Start()

	// HTTP server — WriteTimeout set high enough for SSE streaming
	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 10 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      120 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20, // 1MB
	}

	go func() {
		log.Printf("Server starting on port %s (%s)", cfg.Port, cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	sched.Stop()
	rateLimiter.Stop()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
