package migrations

import (
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
)

func Run() {
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is empty")
	}

	// Use relative path from working directory (backend folder)
	sourceURL := "file://internal/database/migrations"

	m, err := migrate.New(sourceURL, dbURL)
	if err != nil {
		log.Fatalf("Migration setup failed: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Migration completed successfully")
}