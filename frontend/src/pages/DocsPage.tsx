import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { Footer } from '../components/layout/Footer'
import {
  Moon,
  Sun,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Clock,
  FileText,
  Zap,
  Terminal,
  Database,
  HelpCircle,
  Rocket,
  Users,
  Bot,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────

interface DocSection {
  id: string
  title: string
  icon: React.ElementType
  items: DocItem[]
}

interface DocItem {
  id: string
  title: string
  content: React.ReactNode
}

// ─── Documentation Content ──────────────────────────────────────────

const sections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Rocket,
    items: [
      {
        id: 'introduction',
        title: 'Introduction',
        content: (
          <>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              LogBook is a time-tracking and documentation platform built for OPT students,
              interns, and volunteers who need to maintain proof of hours worked and activities performed.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <FeatureCard icon={Clock} title="Track Time" desc="One-click start/stop timer with real-time display" />
              <FeatureCard icon={FileText} title="Document Work" desc="Rich text editor with images, versioning, and auto-save" />
              <FeatureCard icon={Bot} title="AI Summaries" desc="Claude-powered activity summaries from your logs" />
            </div>
            <h3>Who is LogBook for?</h3>
            <ul>
              <li><strong>OPT students</strong> - maintain employment documentation for USCIS compliance</li>
              <li><strong>Interns & volunteers</strong> - track hours and activities for employers and advisors</li>
              <li><strong>Freelancers</strong> - keep a clean record of work done across projects</li>
            </ul>
          </>
        ),
      },
      {
        id: 'quick-start',
        title: 'Quick Start',
        content: (
          <>
            <p className="mb-4">Get up and running with LogBook in under a minute:</p>
            <div className="space-y-6">
              <Step n={1} title="Sign Up">
                Click <strong>Sign In</strong> on the landing page. Create an account with your email or Google. LogBook uses Clerk for secure authentication.
              </Step>
              <Step n={2} title="Start Your Timer">
                Go to <strong>Time Tracker</strong> and click the start button. The timer begins counting immediately. You get one session per day with a minimum of 4 hours.
              </Step>
              <Step n={3} title="Write Your Log">
                Navigate to <strong>Documents</strong> and create a new entry for today. Use the rich text editor to describe what you worked on - add headings, lists, images, and more.
              </Step>
              <Step n={4} title="Stop & Review">
                When you're done (after at least 4 hours), stop your timer. Check your <strong>Dashboard</strong> for weekly and monthly summaries of your activity.
              </Step>
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: 'user-guide',
    title: 'User Guide',
    icon: Users,
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        content: (
          <>
            <p className="mb-4">
              The Dashboard is your home screen. It provides an at-a-glance overview of your activity.
            </p>
            <h3>Stats Cards</h3>
            <ul>
              <li><strong>This Week</strong> - total hours tracked in the current week</li>
              <li><strong>This Month</strong> - total hours tracked in the current month</li>
              <li><strong>Total Sessions</strong> - lifetime count of completed sessions</li>
              <li><strong>Documents</strong> - total number of log entries created</li>
            </ul>
            <h3>Recent Activity</h3>
            <p>Below the stats, you'll see your 5 most recent sessions and documents for quick access.</p>
          </>
        ),
      },
      {
        id: 'time-tracking',
        title: 'Time Tracking',
        content: (
          <>
            <p className="mb-4">
              LogBook's time tracker lets you record your work hours with precision.
            </p>
            <h3>Starting a Session</h3>
            <p>Click the <strong>Start</strong> button on the Time Tracker page. The timer will begin counting immediately and display elapsed time in real-time.</p>
            <Callout type="info" title="One Session Per Day">
              You can only have one session per calendar day (UTC). If you've already completed a session today, you won't be able to start another one.
            </Callout>
            <h3>Stopping a Session</h3>
            <p>Click <strong>Stop</strong> when you're finished. Your session will be saved with the exact start and end times.</p>
            <Callout type="warning" title="4-Hour Minimum">
              Sessions must run for at least 4 hours before they can be stopped. This ensures meaningful work periods are recorded.
            </Callout>
            <h3>Auto-Stop Scheduling</h3>
            <p>Don't want to remember to stop your timer? Set an auto-stop schedule:</p>
            <ul>
              <li>Choose from preset durations: 1h, 2h, 4h, 8h</li>
              <li>Or set a custom duration</li>
              <li>The session will automatically stop when the time is up</li>
            </ul>
          </>
        ),
      },
      {
        id: 'manual-sessions',
        title: 'Manual Sessions',
        content: (
          <>
            <p className="mb-4">
              Forgot to start your timer? You can record past sessions manually.
            </p>
            <h3>Creating a Manual Session</h3>
            <p>On the Time Tracker page, click <strong>Manual Entry</strong> and fill in:</p>
            <ul>
              <li><strong>Start time</strong> - when you began working (ISO 8601 / date-time picker)</li>
              <li><strong>End time</strong> - when you finished working</li>
            </ul>
            <h3>Validation Rules</h3>
            <table>
              <thead>
                <tr><th>Rule</th><th>Details</th></tr>
              </thead>
              <tbody>
                <tr><td>Minimum duration</td><td>4 hours</td></tr>
                <tr><td>Maximum duration</td><td>24 hours</td></tr>
                <tr><td>Future dates</td><td>End time cannot be in the future</td></tr>
                <tr><td>One per day</td><td>Only one session allowed per calendar day</td></tr>
                <tr><td>Time order</td><td>End time must be after start time</td></tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        id: 'documents',
        title: 'Documents & Editor',
        content: (
          <>
            <p className="mb-4">
              Documents are your daily log entries. Each document is tied to a date and contains a rich text description of what you worked on.
            </p>
            <h3>Creating a Document</h3>
            <p>Go to <strong>Documents</strong> and click <strong>New Document</strong>. A document is created for today's date with a rich text editor.</p>
            <h3>Rich Text Features</h3>
            <ul>
              <li><strong>Formatting</strong> - Bold, italic, underline, strikethrough</li>
              <li><strong>Headings</strong> - H1, H2, H3 for organizing your content</li>
              <li><strong>Lists</strong> - Bullet lists and numbered lists</li>
              <li><strong>Blockquotes</strong> - For highlighting important notes</li>
              <li><strong>Code blocks</strong> - For technical content</li>
              <li><strong>Links</strong> - Add URLs to reference materials</li>
              <li><strong>Images</strong> - Drag-and-drop or paste images directly</li>
            </ul>
            <h3>Auto-Save</h3>
            <p>Documents save automatically 2 seconds after you stop typing. You'll see a save indicator in the editor toolbar.</p>
            <h3>Version History</h3>
            <p>Every save creates a new version. You can view all previous versions and restore any one of them from the version history panel.</p>
          </>
        ),
      },
      {
        id: 'ai-summarize',
        title: 'AI Summarize',
        content: (
          <>
            <p className="mb-4">
              LogBook uses Claude AI to generate summaries of your daily activities based on your log entries.
            </p>
            <h3>How It Works</h3>
            <ol>
              <li>Navigate to the <strong>Documents</strong> page</li>
              <li>Click the <strong>AI Summarize</strong> button</li>
              <li>LogBook sends your documents (for the selected date range) to Claude</li>
              <li>A concise summary streams in real-time, highlighting key accomplishments and patterns</li>
            </ol>
            <Callout type="info" title="Monthly Limit">
              Each user gets <strong>3 AI summaries per month</strong>. Your remaining quota is displayed next to the Summarize button. The limit resets on the 1st of each month.
            </Callout>
            <h3>What the Summary Includes</h3>
            <ul>
              <li>Key accomplishments for the period</li>
              <li>Activity patterns and trends</li>
              <li>A brief overview suitable for reports or sharing</li>
            </ul>
          </>
        ),
      },
      {
        id: 'search-filter',
        title: 'Search & Filter',
        content: (
          <>
            <p className="mb-4">
              Find your documents and sessions quickly with built-in search and filtering.
            </p>
            <h3>Document Search</h3>
            <p>Use the search bar on the Documents page to find entries by title or content. Results update as you type.</p>
            <h3>Session Filters</h3>
            <p>On the History page, filter sessions by:</p>
            <ul>
              <li><strong>Date range</strong> - from/to date pickers</li>
              <li><strong>Status</strong> - active, completed, or all</li>
            </ul>
            <h3>Sorting</h3>
            <p>Sort results by date (newest/oldest first) using the sort controls.</p>
          </>
        ),
      },
      {
        id: 'settings-feedback',
        title: 'Settings & Feedback',
        content: (
          <>
            <h3>Settings</h3>
            <ul>
              <li><strong>Dark Mode</strong> - toggle between light and dark themes from the header or Settings page</li>
              <li><strong>Profile</strong> - managed through Clerk (click your avatar)</li>
            </ul>
            <h3>Feedback</h3>
            <p>Found a bug or have a feature idea? Use the <strong>Feedback</strong> page to submit:</p>
            <ul>
              <li><strong>Bug Reports</strong> - describe what went wrong</li>
              <li><strong>Feature Requests</strong> - suggest improvements</li>
              <li><strong>General Feedback</strong> - anything else</li>
            </ul>
            <p>All feedback goes directly to the admin dashboard for review.</p>
          </>
        ),
      },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    icon: Terminal,
    items: [
      {
        id: 'api-auth',
        title: 'Authentication',
        content: (
          <>
            <p className="mb-4">
              All API endpoints (except <code>/health</code>) require a valid Clerk JWT token.
            </p>
            <h3>Making Authenticated Requests</h3>
            <p>Include the JWT token in the <code>Authorization</code> header:</p>
            <CodeBlock lang="bash">{`curl -X GET https://your-api.com/api/v1/sessions \\
  -H "Authorization: Bearer YOUR_CLERK_JWT_TOKEN" \\
  -H "Content-Type: application/json"`}</CodeBlock>
            <h3>Getting a Token</h3>
            <p>
              If you're using the frontend, tokens are automatically injected via the <code>useApi()</code> hook.
              For direct API access, obtain a session token from the Clerk SDK.
            </p>
            <h3>Response Format</h3>
            <p>All responses follow a consistent format:</p>
            <CodeBlock lang="json">{`// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description",
    "details": null
  }
}`}</CodeBlock>
          </>
        ),
      },
      {
        id: 'api-time',
        title: 'Time Tracking Endpoints',
        content: (
          <>
            <EndpointDoc
              method="POST"
              path="/api/v1/time/start"
              desc="Start a new time tracking session"
              body={`{ "device_id": "optional-device-identifier" }`}
              response={`{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "start_time": "2026-02-18T09:00:00Z",
    "status": "active",
    "device_id": "macbook-pro"
  }
}`}
              errors={[
                ['409', 'Active session already exists'],
                ['409', 'Session already exists for today'],
              ]}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/time/stop"
              desc="Stop the active session (must be running for at least 4 hours)"
              body={`{ "session_id": "uuid" }`}
              response={`{
  "success": true,
  "data": {
    "id": "uuid",
    "start_time": "2026-02-18T09:00:00Z",
    "end_time": "2026-02-18T17:00:00Z",
    "status": "completed"
  }
}`}
              errors={[
                ['400', 'Session must run for at least 4 hours'],
                ['404', 'Session not found'],
              ]}
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/time/active"
              desc="Get the current active session (if any)"
              response={`{
  "success": true,
  "data": null  // or session object if active
}`}
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/sessions"
              desc="List sessions with pagination and filters"
              query="?page=1&per_page=10&status=completed&from_date=2026-01-01&to_date=2026-02-18"
              response={`{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 25,
    "total_pages": 3
  }
}`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/sessions/manual"
              desc="Create a completed session with custom times"
              body={`{
  "start_time": "2026-02-17T08:00:00Z",
  "end_time": "2026-02-17T16:00:00Z",
  "device_id": "optional"
}`}
              errors={[
                ['400', 'Duration must be 4–24 hours'],
                ['400', 'End time cannot be in the future'],
                ['409', 'Session already exists for this date'],
              ]}
            />
          </>
        ),
      },
      {
        id: 'api-documents',
        title: 'Document Endpoints',
        content: (
          <>
            <EndpointDoc
              method="POST"
              path="/api/v1/documents"
              desc="Create a new document"
              body={`{ "title": "Feb 18 Log", "content": "<p>Worked on...</p>", "date": "2026-02-18" }`}
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents"
              desc="List documents with pagination"
              query="?page=1&per_page=10&search=keyword"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents/:id"
              desc="Get a single document with full content"
            />
            <EndpointDoc
              method="PUT"
              path="/api/v1/documents/:id"
              desc="Update document content (creates a new version)"
              body={`{ "title": "Updated Title", "content": "<p>Updated content...</p>" }`}
            />
            <EndpointDoc
              method="DELETE"
              path="/api/v1/documents/:id"
              desc="Delete a document"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents/:id/versions"
              desc="Get version history for a document"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents/:id/versions/:version"
              desc="Get a specific version of a document"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents/summarize"
              desc="AI-powered summary (SSE stream). Returns Server-Sent Events."
              query="?date=2026-02-18"
            />
            <EndpointDoc
              method="GET"
              path="/api/v1/documents/summarize/quota"
              desc="Check remaining AI summary quota"
              response={`{
  "success": true,
  "data": {
    "used": 1,
    "limit": 3,
    "remaining": 2
  }
}`}
            />
          </>
        ),
      },
      {
        id: 'api-other',
        title: 'Upload, Feedback & Admin',
        content: (
          <>
            <h3>Upload</h3>
            <EndpointDoc
              method="POST"
              path="/api/v1/upload/presign"
              desc="Get a presigned URL for uploading media to Cloudflare R2"
              body={`{ "filename": "screenshot.png", "content_type": "image/png" }`}
            />
            <EndpointDoc
              method="POST"
              path="/api/v1/upload/confirm"
              desc="Confirm a media upload after uploading to R2"
              body={`{ "upload_id": "uuid", "document_id": "uuid" }`}
            />
            <h3>Feedback</h3>
            <EndpointDoc
              method="POST"
              path="/api/v1/feedback"
              desc="Submit feedback"
              body={`{ "type": "bug|feature|general", "message": "Your feedback..." }`}
            />
            <h3>Admin Endpoints</h3>
            <Callout type="warning" title="Admin Only">
              These endpoints require the <code>admin</code> role. Regular users will receive a 403 error.
            </Callout>
            <table>
              <thead>
                <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><MethodBadge m="GET" /></td><td><code>/api/v1/admin/stats</code></td><td>Global dashboard statistics</td></tr>
                <tr><td><MethodBadge m="GET" /></td><td><code>/api/v1/admin/users</code></td><td>All users with usage stats</td></tr>
                <tr><td><MethodBadge m="GET" /></td><td><code>/api/v1/admin/ai-usage</code></td><td>Daily AI usage breakdown</td></tr>
                <tr><td><MethodBadge m="GET" /></td><td><code>/api/v1/admin/ai-usage/users</code></td><td>Per-user AI token usage</td></tr>
                <tr><td><MethodBadge m="GET" /></td><td><code>/api/v1/admin/feedback</code></td><td>All user feedback</td></tr>
              </tbody>
            </table>
          </>
        ),
      },
    ],
  },
  {
    id: 'developer-guide',
    title: 'Developer Guide',
    icon: Database,
    items: [
      {
        id: 'tech-stack',
        title: 'Tech Stack',
        content: (
          <>
            <table>
              <thead>
                <tr><th>Layer</th><th>Technology</th></tr>
              </thead>
              <tbody>
                <tr><td>Backend</td><td>Go 1.24, Gin framework, PostgreSQL (Supabase)</td></tr>
                <tr><td>AI</td><td>Claude API (Sonnet 4.5) for document summarization</td></tr>
                <tr><td>Frontend</td><td>React 18, TypeScript, Vite, Tailwind CSS</td></tr>
                <tr><td>State</td><td>Zustand (client), TanStack Query (server)</td></tr>
                <tr><td>Editor</td><td>Tiptap (ProseMirror-based WYSIWYG)</td></tr>
                <tr><td>Storage</td><td>Cloudflare R2 (S3-compatible)</td></tr>
                <tr><td>Auth</td><td>Clerk (JWT-based)</td></tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        id: 'project-structure',
        title: 'Project Structure',
        content: (
          <>
            <CodeBlock lang="text">{`log_book/
├── backend/
│   ├── cmd/
│   │   ├── server/main.go        # Server entry point
│   │   └── migrate/main.go       # Migration runner
│   ├── internal/
│   │   ├── config/                # Environment config
│   │   ├── database/              # DB connection & migrations
│   │   ├── middleware/            # Auth, CORS, rate limiting
│   │   ├── models/                # Data models & responses
│   │   ├── handlers/              # HTTP handlers
│   │   ├── services/              # Business logic
│   │   ├── repository/            # Database queries
│   │   └── scheduler/             # Background jobs
│   └── go.mod
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route-level pages
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── services/              # API client
│   │   ├── stores/                # Zustand stores
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Helpers
│   └── package.json
│
├── docs/                          # Design specs
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
└── README.md`}</CodeBlock>
            <h3>Architecture</h3>
            <p>The backend follows a clean layered architecture:</p>
            <ul>
              <li><strong>Handlers</strong> - parse HTTP requests, validate input, return responses</li>
              <li><strong>Services</strong> - business logic, validation rules, orchestration</li>
              <li><strong>Repository</strong> - database queries, data access</li>
            </ul>
            <p>The frontend follows a page-based architecture with shared components and centralized state management.</p>
          </>
        ),
      },
      {
        id: 'local-setup',
        title: 'Local Development Setup',
        content: (
          <>
            <h3>Prerequisites</h3>
            <ul>
              <li><strong>Go</strong> 1.21+</li>
              <li><strong>Node.js</strong> 18+</li>
              <li><strong>PostgreSQL</strong> (or a Supabase project)</li>
              <li><strong>Clerk</strong> account (free tier works)</li>
              <li><strong>Cloudflare R2</strong> bucket (for media uploads)</li>
            </ul>
            <h3>1. Clone & Setup Backend</h3>
            <CodeBlock lang="bash">{`git clone https://github.com/sunillucky143/LogBook.git
cd LogBook/backend
cp .env.example .env
# Fill in your .env variables (see Environment Variables section)
go run cmd/server/main.go`}</CodeBlock>
            <h3>2. Setup Frontend</h3>
            <CodeBlock lang="bash">{`cd LogBook/frontend
cp .env.example .env
# Fill in VITE_API_BASE_URL and VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev`}</CodeBlock>
            <p>Backend runs at <code>http://localhost:8080</code>, frontend at <code>http://localhost:5173</code>.</p>
          </>
        ),
      },
      {
        id: 'env-vars',
        title: 'Environment Variables',
        content: (
          <>
            <h3>Backend (.env)</h3>
            <table>
              <thead>
                <tr><th>Variable</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>PORT</code></td><td>Server port (default: 8080)</td></tr>
                <tr><td><code>DATABASE_URL</code></td><td>PostgreSQL connection string</td></tr>
                <tr><td><code>CLERK_SECRET_KEY</code></td><td>Clerk secret key (<code>sk_...</code>)</td></tr>
                <tr><td><code>ANTHROPIC_API_KEY</code></td><td>Anthropic API key for AI summarization</td></tr>
                <tr><td><code>R2_ACCOUNT_ID</code></td><td>Cloudflare account ID</td></tr>
                <tr><td><code>R2_ACCESS_KEY_ID</code></td><td>R2 access key</td></tr>
                <tr><td><code>R2_SECRET_ACCESS_KEY</code></td><td>R2 secret key</td></tr>
                <tr><td><code>R2_BUCKET_NAME</code></td><td>R2 bucket name</td></tr>
              </tbody>
            </table>
            <h3>Frontend (.env)</h3>
            <table>
              <thead>
                <tr><th>Variable</th><th>Description</th></tr>
              </thead>
              <tbody>
                <tr><td><code>VITE_API_BASE_URL</code></td><td>Backend URL (default: <code>http://localhost:8080</code>)</td></tr>
                <tr><td><code>VITE_CLERK_PUBLISHABLE_KEY</code></td><td>Clerk publishable key (<code>pk_...</code>)</td></tr>
              </tbody>
            </table>
          </>
        ),
      },
      {
        id: 'contributing',
        title: 'Contributing',
        content: (
          <>
            <p className="mb-4">
              We welcome contributions! See our full <a href="https://github.com/sunillucky143/LogBook/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing Guide</a> for details.
            </p>
            <h3>Quick Overview</h3>
            <ol>
              <li>Fork the repository</li>
              <li>Create a feature branch: <code>git checkout -b feature/your-feature</code></li>
              <li>Make your changes following our coding conventions</li>
              <li>Test: <code>cd backend && go build ./...</code> and <code>cd frontend && npm run build</code></li>
              <li>Commit with conventional commits: <code>feat:</code>, <code>fix:</code>, <code>docs:</code>, etc.</li>
              <li>Open a Pull Request</li>
            </ol>
            <h3>Coding Conventions</h3>
            <ul>
              <li><strong>Backend</strong> - standard Go layout, business logic in <code>services/</code>, queries in <code>repository/</code></li>
              <li><strong>Frontend</strong> - strict TypeScript (no <code>any</code>), Tailwind CSS, use <code>useApi()</code> hook for API calls</li>
              <li><strong>Security</strong> - never expose internal errors, use parameterized SQL queries</li>
            </ul>
          </>
        ),
      },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: HelpCircle,
    items: [
      {
        id: 'faq-general',
        title: 'Frequently Asked Questions',
        content: (
          <>
            <FaqItem q="Why can I only have one session per day?">
              LogBook is designed for daily work tracking. One session per day keeps your records clean and maps directly to
              calendar days, making it easy to generate reports and maintain compliance documentation.
            </FaqItem>
            <FaqItem q="Why is there a 4-hour minimum session?">
              The 4-hour minimum ensures that sessions represent meaningful work periods.
              This helps maintain accurate records for employment documentation.
            </FaqItem>
            <FaqItem q="What happens to my AI summary limit at the end of the month?">
              Your quota resets to 3 on the 1st of every month. Unused summaries do not roll over.
            </FaqItem>
            <FaqItem q="Can I export my data?">
              PDF/DOCX export is on our roadmap. Currently, you can copy content from individual documents.
            </FaqItem>
            <FaqItem q="Is my data secure?">
              Yes. All API endpoints require Clerk JWT authentication. Data is stored in PostgreSQL with row-level
              access control - you can only access your own data. Media files are stored in Cloudflare R2 with
              presigned URLs. See our <a href="https://github.com/sunillucky143/LogBook/blob/main/SECURITY.md" target="_blank" rel="noopener noreferrer">Security Policy</a> for details.
            </FaqItem>
            <FaqItem q="Can I use LogBook on my phone?">
              LogBook is responsive and works in mobile browsers. A PWA (Progressive Web App) is on our roadmap for a native-like mobile experience.
            </FaqItem>
            <FaqItem q="How do I report a bug?">
              Use the in-app <strong>Feedback</strong> page or open an issue on <a href="https://github.com/sunillucky143/LogBook/issues" target="_blank" rel="noopener noreferrer">GitHub</a>.
            </FaqItem>
            <FaqItem q="I'm a developer - how can I contribute?">
              Check our <a href="https://github.com/sunillucky143/LogBook/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer">Contributing Guide</a> and
              look for issues labeled <strong>good first issue</strong>.
            </FaqItem>
          </>
        ),
      },
    ],
  },
]

// ─── Helper Components ──────────────────────────────────────────────

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
      <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-3" />
      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{desc}</p>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
        {n}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400">{children}</p>
      </div>
    </div>
  )
}

function Callout({ type, title, children }: { type: 'info' | 'warning'; title: string; children: React.ReactNode }) {
  const styles = {
    info: 'bg-primary-50 border-primary-200 dark:bg-primary-950/30 dark:border-primary-800',
    warning: 'bg-warning-50 border-warning-500/30 dark:bg-yellow-950/20 dark:border-yellow-700/50',
  }
  const iconColor = {
    info: 'text-primary-600 dark:text-primary-400',
    warning: 'text-warning-600 dark:text-yellow-400',
  }
  return (
    <div className={`rounded-lg border p-4 my-4 ${styles[type]}`}>
      <div className="flex items-center gap-2 mb-1">
        <Zap className={`h-4 w-4 ${iconColor[type]}`} />
        <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{title}</span>
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 ml-6">{children}</div>
    </div>
  )
}

function CodeBlock({ lang, children }: { lang: string; children: string }) {
  return (
    <div className="relative my-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-4 py-1.5 text-xs font-mono border-b border-gray-200 dark:border-gray-700">
        {lang}
      </div>
      <pre className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  )
}

function EndpointDoc({
  method,
  path,
  desc,
  body,
  query,
  response,
  errors,
}: {
  method: string
  path: string
  desc: string
  body?: string
  query?: string
  response?: string
  errors?: string[][]
}) {
  return (
    <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
        <MethodBadge m={method} />
        <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{path}</code>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-gray-600 dark:text-gray-400">{desc}</p>
        {query && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Query Parameters</span>
            <code className="block mt-1 text-sm text-gray-700 dark:text-gray-300">{query}</code>
          </div>
        )}
        {body && <CodeBlock lang="json">{body}</CodeBlock>}
        {response && (
          <>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Response</span>
            <CodeBlock lang="json">{response}</CodeBlock>
          </>
        )}
        {errors && errors.length > 0 && (
          <div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase">Error Responses</span>
            <ul className="mt-1 space-y-1">
              {errors.map(([code, msg], i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                  <code className="text-error-500">{code}</code> - {msg}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

function MethodBadge({ m }: { m: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    POST: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${colors[m] || 'bg-gray-100 text-gray-700'}`}>
      {m}
    </span>
  )
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-gray-100">{q}</span>
        {open ? <ChevronDown className="h-4 w-4 flex-shrink-0" /> : <ChevronRight className="h-4 w-4 flex-shrink-0" />}
      </button>
      {open && (
        <div className="pb-4 text-gray-600 dark:text-gray-400 text-sm animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────

export function DocsPage() {
  const { isSignedIn } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('introduction')
  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map(s => s.id))
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'))
  const contentRef = useRef<HTMLDivElement>(null)

  // Flatten all items for prev/next navigation
  const allItems = sections.flatMap(s => s.items)
  const currentIndex = allItems.findIndex(item => item.id === activeItem)

  // Toggle dark mode
  const toggleDark = useCallback(() => {
    const next = !isDarkMode
    setIsDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try { localStorage.setItem('logbook-dark-mode', JSON.stringify(next)) } catch {}
  }, [isDarkMode])

  // Scroll spy: update activeItem based on scroll position
  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveItem(entry.target.id)
          }
        }
      },
      { root: container, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
    )

    const sections = container.querySelectorAll('[data-doc-section]')
    sections.forEach(s => observer.observe(s))

    return () => observer.disconnect()
  }, [])

  function scrollToItem(id: string) {
    setActiveItem(id)
    setSidebarOpen(false)
    const el = document.getElementById(id)
    if (el && contentRef.current) {
      contentRef.current.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' })
    }
  }

  function toggleSection(id: string) {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <img
                src={isDarkMode ? '/logo-dark.png' : '/logo-light.png'}
                alt="LogBook"
                className="h-10 w-auto"
              />
              <span className="text-gray-400 dark:text-gray-600 mx-1">/</span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">Docs</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/sunillucky143/LogBook"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hidden sm:flex"
              title="GitHub"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={toggleDark}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {isSignedIn ? (
              <Link
                to="/"
                className="ml-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Go to App
              </Link>
            ) : (
              <Link
                to="/"
                className="ml-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex max-w-screen-2xl mx-auto">
        {/* ─── Mobile overlay ─── */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-gray-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ─── Sidebar ─── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-72 pt-14 bg-white dark:bg-gray-950
            border-r border-gray-200 dark:border-gray-800
            transform transition-transform duration-200
            lg:translate-x-0 lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)] lg:z-auto
            overflow-y-auto
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <nav className="p-4 space-y-1">
            {sections.map(section => {
              const isExpanded = expandedSections.includes(section.id)
              const Icon = section.icon
              return (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-500 dark:text-gray-500" />
                      {section.title}
                    </span>
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                  {isExpanded && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-gray-100 dark:border-gray-800 pl-3">
                      {section.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => scrollToItem(item.id)}
                          className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors ${
                            activeItem === item.id
                              ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-950/30'
                              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                        >
                          {item.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </aside>

        {/* ─── Main Content ─── */}
        <main
          ref={contentRef}
          className="flex-1 min-w-0 lg:h-[calc(100vh-3.5rem)] overflow-y-auto"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {sections.map(section =>
              section.items.map(item => (
                <section
                  key={item.id}
                  id={item.id}
                  data-doc-section
                  className="mb-16 scroll-mt-20"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-3 border-b border-gray-200 dark:border-gray-800">
                    {item.title}
                  </h2>
                  <div className="prose-doc">
                    {item.content}
                  </div>
                </section>
              ))
            )}

            {/* ─── Prev / Next ─── */}
            <div className="flex items-center justify-between py-8 border-t border-gray-200 dark:border-gray-800">
              {currentIndex > 0 ? (
                <button
                  onClick={() => scrollToItem(allItems[currentIndex - 1].id)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {allItems[currentIndex - 1].title}
                </button>
              ) : <div />}
              {currentIndex < allItems.length - 1 ? (
                <button
                  onClick={() => scrollToItem(allItems[currentIndex + 1].id)}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {allItems[currentIndex + 1].title}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : <div />}
            </div>

            {/* ─── Footer ─── */}
            {/* ─── Footer ─── */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  )
}
