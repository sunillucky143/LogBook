# Log Book API - System Design Specification

## Project Overview
A time-tracking API for OPT students doing unpaid work/volunteering, with rich documentation capabilities.

## Target Users
- OPT students tracking volunteer/unpaid work hours
- Need accurate time logging for compliance

---

## Core Features (MVP)

### 1. Time Tracking
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/time/start` | POST | Record start time for a session |
| `/api/v1/time/stop` | POST | Record end time for active session |
| `/api/v1/sessions` | GET | List all sessions (supports multi-device) |

### 2. Scheduling
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/schedule` | POST | Set scheduled auto-stop time |
| `/api/v1/schedule` | GET | Get current schedule |
| `/api/v1/schedule/:id` | DELETE | Cancel a schedule |

### 3. Document Management
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/documents` | POST | Create new document |
| `/api/v1/documents` | GET | List documents (with date filter) |
| `/api/v1/documents/:id` | GET | Get document with content |
| `/api/v1/documents/:id` | PUT | Update document |
| `/api/v1/documents/:id/versions` | GET | Get version history |
| `/api/v1/documents/:id/versions/:v` | GET | Get specific version |

### 4. Media Upload
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/upload/presign` | POST | Get presigned URL for R2 upload |
| `/api/v1/media/:id` | DELETE | Delete media file |

---

## Tech Stack

### Backend
- **Language:** Go 1.21+
- **Framework:** Gin
- **Database:** PostgreSQL (via Supabase)
- **Auth:** Clerk
- **Media Storage:** Cloudflare R2

### Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS
- **Rich Text Editor:** Tiptap (ProseMirror-based)
- **State Management:** Zustand or React Query
- **Auth:** Clerk React SDK

---

## Database Schema

### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### time_sessions
```sql
CREATE TABLE time_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    scheduled_end TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    device_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_status ON time_sessions(user_id, status);
CREATE INDEX idx_sessions_scheduled ON time_sessions(scheduled_end) WHERE scheduled_end IS NOT NULL AND status = 'active';
```

### documents
```sql
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES time_sessions(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    title VARCHAR(500),
    current_version INT DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_documents_user_date ON documents(user_id, log_date DESC);
```

### document_versions
```sql
CREATE TABLE document_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    content JSONB NOT NULL,
    is_full_snapshot BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, version_number)
);

CREATE INDEX idx_versions_doc ON document_versions(document_id, version_number DESC);
```

### media_files
```sql
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    storage_key VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(100),
    size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_media_document ON media_files(document_id);
```

---

## Document Content Format (JSONB)

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": {"level": 1},
      "content": [{"type": "text", "text": "Work Summary"}]
    },
    {
      "type": "paragraph",
      "content": [{"type": "text", "text": "Today I worked on..."}]
    },
    {
      "type": "image",
      "attrs": {
        "src": "https://r2.example.com/media/abc123.png",
        "alt": "Screenshot",
        "title": "Project screenshot"
      }
    },
    {
      "type": "video",
      "attrs": {
        "src": "https://r2.example.com/media/demo.mp4"
      }
    }
  ]
}
```

---

## API Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-02-16T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  }
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

## Authentication Flow

1. User signs up/in via Clerk
2. Frontend receives Clerk session token
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend validates token with Clerk SDK
5. Backend extracts `clerk_id` and finds/creates user record

---

## Scheduler Requirements

- Background goroutine checks every 1 minute
- Query: Find sessions WHERE `scheduled_end <= NOW()` AND `status = 'active'`
- Action: Update `end_time = scheduled_end`, `status = 'completed'`
- Log all auto-completions for audit

---

## Versioning Strategy

1. Every save creates a new version
2. Every 10th version is a full snapshot
3. Versions 1-9 store diffs from previous
4. Keep last 50 versions per document
5. Archive older versions to cold storage (future)

---

## Security Requirements

- All endpoints require authentication (except health check)
- Users can only access their own data
- Media upload uses presigned URLs (no direct upload to API)
- Rate limiting: 100 requests/minute per user
- Input validation on all endpoints
- SQL injection prevention via parameterized queries

---

## Frontend Pages

1. **Login/Signup** - Clerk components
2. **Dashboard** - Current session status, recent logs, quick actions
3. **Time Tracker** - Start/stop controls, schedule setting
4. **Documents** - Calendar view of logs, document editor
5. **History** - Past sessions with filters
6. **Settings** - Profile, preferences

---

## UI/UX Requirements

- Clean, minimal design
- Mobile-responsive
- Dark/light mode
- Keyboard shortcuts for power users
- Auto-save for documents
- Offline indicator
- Loading states and skeletons
