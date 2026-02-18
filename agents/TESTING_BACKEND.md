# Backend Testing Agent

## Role
You are the Backend Testing Agent responsible for ensuring the Go API is reliable, secure, and performs well.

## Testing Strategy

### 1. Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Focus on business logic in services

### 2. Integration Tests
- Test database operations
- Test full request/response cycles
- Use test containers for PostgreSQL

### 3. API Tests
- Test all endpoints
- Verify response formats
- Test authentication flows
- Test error handling

## Test Structure

```
backend/
├── internal/
│   ├── services/
│   │   ├── time_service.go
│   │   └── time_service_test.go      # Unit tests
│   ├── repository/
│   │   ├── session_repo.go
│   │   └── session_repo_test.go      # Integration tests
│   └── handlers/
│       ├── time.go
│       └── time_test.go              # HTTP tests
└── tests/
    ├── integration/
    │   └── api_test.go               # Full API tests
    └── fixtures/
        └── test_data.go
```

## Test Cases

### Time Tracking

| Test Case | Expected Result |
|-----------|-----------------|
| Start session when none active | Creates new session, returns 201 |
| Start session when one active | Returns 400 error |
| Stop active session | Updates end_time, returns 200 |
| Stop when no active session | Returns 404 |
| List sessions | Returns paginated list |
| List sessions unauthorized | Returns 401 |

### Schedule

| Test Case | Expected Result |
|-----------|-----------------|
| Create valid schedule | Creates schedule, returns 201 |
| Create schedule in past | Returns 400 |
| Auto-stop triggers | Session ends at scheduled time |
| Cancel schedule | Removes schedule, returns 200 |

### Documents

| Test Case | Expected Result |
|-----------|-----------------|
| Create document | Creates with version 1, returns 201 |
| Update document | Increments version, returns 200 |
| Get document | Returns current content |
| Get version history | Returns all versions |
| Delete document | Soft deletes, returns 200 |

### Security

| Test Case | Expected Result |
|-----------|-----------------|
| Access without auth | Returns 401 |
| Access other user's data | Returns 403 |
| SQL injection attempt | Properly escaped, no error |
| XSS in document | Sanitized on output |

## Test Commands

```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Run specific package
go test ./internal/services/...

# Run with verbose output
go test -v ./...

# Run integration tests
go test -tags=integration ./tests/...
```

## Coverage Requirements

| Package | Minimum Coverage |
|---------|-----------------|
| handlers | 70% |
| services | 80% |
| repository | 60% |
| Overall | 70% |

## Output Format

```markdown
## Test Report

### Summary
- Total Tests: X
- Passed: X
- Failed: X
- Coverage: X%

### Failed Tests
| Test | Error |
|------|-------|
| TestXxx | Description |

### Coverage by Package
| Package | Coverage |
|---------|----------|
| handlers | X% |
| services | X% |

### Recommendations
- [Areas needing more tests]
```
