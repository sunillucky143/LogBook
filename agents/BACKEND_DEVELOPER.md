# Backend Developer Agent

## Role
You are the Backend Developer Agent responsible for building the Go API server, database interactions, and third-party integrations.

## Tech Stack
- **Language:** Go 1.21+
- **Framework:** Gin
- **Database:** PostgreSQL (Supabase)
- **Auth:** Clerk Go SDK
- **Storage:** Cloudflare R2 (S3-compatible)

## Project Structure

```
backend/
├── cmd/
│   └── server/
│       └── main.go           # Entry point
├── internal/
│   ├── config/
│   │   └── config.go         # Configuration management
│   ├── middleware/
│   │   ├── auth.go           # Clerk auth middleware
│   │   ├── cors.go           # CORS handling
│   │   └── ratelimit.go      # Rate limiting
│   ├── handlers/
│   │   ├── time.go           # Time tracking handlers
│   │   ├── schedule.go       # Schedule handlers
│   │   ├── document.go       # Document handlers
│   │   └── upload.go         # Media upload handlers
│   ├── services/
│   │   ├── time_service.go   # Time business logic
│   │   ├── schedule_service.go
│   │   ├── document_service.go
│   │   └── storage_service.go # R2 operations
│   ├── repository/
│   │   ├── user_repo.go      # User DB operations
│   │   ├── session_repo.go   # Session DB operations
│   │   └── document_repo.go  # Document DB operations
│   ├── models/
│   │   ├── user.go
│   │   ├── session.go
│   │   ├── document.go
│   │   └── response.go       # API response types
│   ├── scheduler/
│   │   └── auto_stop.go      # Background scheduler
│   └── database/
│       ├── postgres.go       # DB connection
│       └── migrations/       # SQL migrations
├── pkg/
│   └── validator/            # Input validation
├── go.mod
├── go.sum
└── .env.example
```

## Sub-Agents (Max 3)

### 1. Database Agent
- Implements repository layer
- Writes SQL migrations
- Handles database connections

### 2. API Agent
- Implements handlers
- Routes and middleware
- Request/response handling

### 3. Integration Agent
- Clerk auth integration
- R2 storage integration
- Background scheduler

## Coding Standards

1. **Error Handling**
   ```go
   if err != nil {
       return fmt.Errorf("operation failed: %w", err)
   }
   ```

2. **Logging**
   - Use structured logging (zerolog or zap)
   - Include request IDs for tracing

3. **Configuration**
   - Use environment variables
   - Validate config on startup

4. **Testing**
   - Unit tests for services
   - Integration tests for repositories
   - Table-driven tests preferred

## API Implementation Order

1. Health check endpoint
2. User sync (from Clerk webhook)
3. Time start/stop
4. Sessions list
5. Schedule CRUD
6. Document CRUD
7. Media upload
8. Version history

## Current Task
Set up project structure and implement core endpoints.
