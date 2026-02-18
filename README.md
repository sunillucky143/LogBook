<p align="center">
  <h1 align="center">LogBook</h1>
  <p align="center">
    Time-tracking and documentation platform for OPT students, interns, and volunteers.
    <br />
    <a href="#getting-started"><strong>Get Started</strong></a>
    &middot;
    <a href="https://github.com/sunillucky143/LogBook/issues/new?labels=bug&template=bug_report.md">Report Bug</a>
    &middot;
    <a href="https://github.com/sunillucky143/LogBook/issues/new?labels=enhancement&template=feature_request.md">Request Feature</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/sunillucky143/LogBook/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/sunillucky143/LogBook?style=flat-square" alt="MIT License" />
  </a>
  <a href="https://github.com/sunillucky143/LogBook/issues">
    <img src="https://img.shields.io/github/issues/sunillucky143/LogBook?style=flat-square" alt="Issues" />
  </a>
  <a href="https://github.com/sunillucky143/LogBook/pulls">
    <img src="https://img.shields.io/github/issues-pr/sunillucky143/LogBook?style=flat-square" alt="Pull Requests" />
  </a>
  <a href="https://github.com/sunillucky143/LogBook/stargazers">
    <img src="https://img.shields.io/github/stars/sunillucky143/LogBook?style=flat-square" alt="Stars" />
  </a>
</p>

---

## The Problem

Thousands of international students on OPT (Optional Practical Training) do unpaid internships, volunteer work, or self-directed projects. Immigration compliance and career advancement both require **proof of hours worked and activities performed** -- but most students end up with:

- Scattered notes across Google Docs, Notion, and random text files
- No reliable record of start/end times
- Hours spent reconstructing timelines when they need documentation
- No single source of truth to show employers, advisors, or USCIS

**LogBook fixes this.** Start a timer, write what you did, and LogBook keeps a clean, versioned, date-organized record of everything -- ready to export whenever you need it.

---

## What LogBook Does

| Feature | Description |
|---|---|
| **Time Tracking** | One-click start/stop timer with real-time elapsed display |
| **Auto-Stop Scheduling** | Set a timer to automatically stop after 1h, 2h, 4h, 8h, or a custom duration |
| **Daily Log Entries** | Rich text editor (bold, italic, lists, headings, links) tied to each day |
| **Image Uploads** | Drag-and-drop or paste images directly into log entries |
| **Version History** | Every save creates a version -- roll back to any previous state |
| **Dashboard** | Weekly/monthly hour summaries, recent sessions, and activity overview |
| **Session History** | Filterable list of all past sessions with date range and status filters |
| **Multi-Device** | Sessions track device IDs so you can work from anywhere |
| **Dark Mode** | Full dark/light theme toggle |
| **Auto-Save** | Documents save automatically with a 2-second debounce |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Go 1.24, Gin, PostgreSQL (Supabase), Clerk JWT Auth |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query |
| **Editor** | Tiptap (ProseMirror-based WYSIWYG) |
| **Storage** | Cloudflare R2 (S3-compatible object storage) |
| **Auth** | Clerk (JWT-based, handles signup/login/sessions) |

---

## Architecture

```
┌──────────────┐       ┌──────────────────────────────────────┐
│   Frontend   │       │              Backend                 │
│  React/Vite  │──────▶│  Gin HTTP Server                     │
│  port 5173   │       │  ┌──────────┐  ┌──────────────────┐  │
└──────────────┘       │  │Middleware │  │    Handlers      │  │
                       │  │ - Auth    │  │ - Time Tracking  │  │
                       │  │ - CORS    │  │ - Documents      │  │
                       │  │ - Rate    │  │ - Upload/Media   │  │
                       │  │   Limit   │  │ - Scheduling     │  │
                       │  └──────────┘  └────────┬─────────┘  │
                       │                         │             │
                       │              ┌──────────▼─────────┐   │
                       │              │     Services       │   │
                       │              └──────────┬─────────┘   │
                       │                         │             │
                       │              ┌──────────▼─────────┐   │
                       │              │    Repository      │   │
                       │              └──────────┬─────────┘   │
                       └─────────────────────────┼─────────────┘
                                                 │
                                    ┌────────────┼────────────┐
                                    ▼                         ▼
                             ┌────────────┐          ┌──────────────┐
                             │ PostgreSQL │          │ Cloudflare   │
                             │ (Supabase) │          │ R2 Storage   │
                             └────────────┘          └──────────────┘
```

---

## Project Structure

```
log_book/
├── backend/
│   ├── cmd/
│   │   ├── server/main.go          # Server entry point
│   │   └── migrate/main.go         # Database migration runner
│   ├── internal/
│   │   ├── config/                  # Environment & configuration
│   │   ├── database/                # DB connection & migrations
│   │   ├── middleware/              # Auth, CORS, rate limiting
│   │   ├── models/                  # Data models & response types
│   │   ├── handlers/                # HTTP request handlers
│   │   ├── services/                # Business logic layer
│   │   ├── repository/              # Database operations
│   │   └── scheduler/               # Background auto-stop jobs
│   ├── go.mod
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Button, Card, Input
│   │   │   ├── layout/              # Header, Sidebar, Layout
│   │   │   └── editor/              # Rich text editor toolbar
│   │   ├── pages/                   # Route-level page components
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── services/                # API client
│   │   ├── stores/                  # Zustand state stores
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Formatting & date helpers
│   ├── package.json
│   └── .env.example
│
├── docs/
│   ├── DESIGN.md                    # System design specification
│   └── UI_SPECIFICATIONS.md         # UI/UX design specs
│
├── agents/                          # AI agent team definitions
├── CLAUDE.md                        # Project instructions
├── LICENSE                          # MIT License
└── README.md
```

---

## Getting Started

### Prerequisites

- [Go](https://go.dev/dl/) 1.21+
- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) (or a [Supabase](https://supabase.com/) project)
- [Clerk](https://clerk.com/) account (free tier works)
- [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket (for media uploads)

### 1. Clone the repository

```bash
git clone https://github.com/sunillucky143/LogBook.git
cd LogBook
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
```

Fill in your `.env` file:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `8080`) |
| `DATABASE_URL` | PostgreSQL connection string |
| `CLERK_SECRET_KEY` | Clerk secret key (`sk_...`) |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 access key |
| `R2_SECRET_ACCESS_KEY` | R2 secret key |
| `R2_BUCKET_NAME` | R2 bucket name |

Run the server:

```bash
go run cmd/server/main.go
```

The API starts at `http://localhost:8080`. Health check: `GET /health`.

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
```

Fill in your `.env` file:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (default: `http://localhost:8080`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key (`pk_...`) |

Install dependencies and start:

```bash
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

---

## API Overview

All endpoints under `/api/v1/` require authentication (Clerk JWT Bearer token).

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check with DB status |
| `POST` | `/api/v1/time/start` | Start a new time session |
| `POST` | `/api/v1/time/stop` | Stop the active session |
| `GET` | `/api/v1/time/active` | Get current active session |
| `GET` | `/api/v1/sessions` | List sessions (paginated, filterable) |
| `POST` | `/api/v1/sessions/manual` | Record a past session manually |
| `POST` | `/api/v1/schedule` | Set auto-stop schedule |
| `GET` | `/api/v1/schedule/:id` | Get schedule details |
| `DELETE` | `/api/v1/schedule/:id` | Cancel a schedule |
| `POST` | `/api/v1/documents` | Create a log entry |
| `GET` | `/api/v1/documents` | List documents (paginated) |
| `GET` | `/api/v1/documents/:id` | Get document with content |
| `PUT` | `/api/v1/documents/:id` | Update document content |
| `DELETE` | `/api/v1/documents/:id` | Delete a document |
| `GET` | `/api/v1/documents/:id/versions` | Version history |
| `GET` | `/api/v1/documents/:id/versions/:v` | Get specific version |
| `POST` | `/api/v1/upload/presign` | Get presigned upload URL |
| `POST` | `/api/v1/upload/confirm` | Confirm media upload |
| `DELETE` | `/api/v1/media/:id` | Delete media file |

---

## Contributing

LogBook is built to be **contribution-first**. Whether you're fixing a typo, adding a feature, or improving docs -- every contribution matters.

### How to Contribute

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** -- follow the conventions below
4. **Test** your changes:
   ```bash
   # Backend
   cd backend && go test ./...

   # Frontend
   cd frontend && npm run lint && npm run build
   ```
5. **Commit** with a clear message:
   ```bash
   git commit -m "feat: add weekly export to PDF"
   ```
6. **Push** and open a **Pull Request**

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring, no behavior change |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, dependency updates |

### Good First Issues

Look for issues labeled [`good first issue`](https://github.com/sunillucky143/LogBook/labels/good%20first%20issue) -- these are curated for new contributors.

### Areas Where We Need Help

- **Testing** -- Unit tests for backend services and repository layer, component tests for frontend
- **Export** -- PDF and DOCX export of log entries and time summaries
- **Analytics** -- Charts and visualizations for time tracking data
- **Accessibility** -- WCAG compliance audit and improvements
- **Mobile** -- Responsive refinements and PWA support
- **CI/CD** -- GitHub Actions for lint, test, and build pipelines
- **Documentation** -- API docs (OpenAPI/Swagger), user guide, deployment guide
- **i18n** -- Internationalization support for non-English speakers
- **Notifications** -- Email or push reminders to start/stop tracking

### Development Guidelines

- **Backend**: Follow standard Go project layout. Business logic goes in `services/`, database queries in `repository/`, HTTP handling in `handlers/`.
- **Frontend**: Components in `components/`, pages in `pages/`, state in `stores/`. Use TypeScript strictly -- no `any` types.
- **Styling**: Use Tailwind CSS utility classes. Follow the existing design system in `components/ui/`.
- **State**: Server state via TanStack Query, client state via Zustand.
- **API Client**: Use the `useApi()` hook. Don't make raw `fetch` calls.

---

## Roadmap

- [x] Core time tracking (start/stop/manual)
- [x] Auto-stop scheduling
- [x] Rich text log entries with versioning
- [x] Image upload via Cloudflare R2
- [x] Clerk authentication
- [x] Dashboard with stats
- [x] Dark mode
- [ ] PDF/DOCX export
- [ ] Weekly/monthly summary reports
- [ ] Analytics dashboard with charts
- [ ] Email reminders
- [ ] PWA support
- [ ] GitHub Actions CI/CD
- [ ] OpenAPI documentation
- [ ] Docker Compose for local development
- [ ] Deployment guide (Railway / Fly.io / Vercel)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful in all interactions. Harassment, discrimination, and toxic behavior will not be tolerated.

By participating in this project, you agree to abide by the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).

---

## License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [Clerk](https://clerk.com/) for authentication
- [Cloudflare R2](https://developers.cloudflare.com/r2/) for object storage
- [Tiptap](https://tiptap.dev/) for the rich text editor
- [Supabase](https://supabase.com/) for managed PostgreSQL
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [TanStack Query](https://tanstack.com/query) for data fetching

---

<p align="center">
  Built by <a href="https://github.com/sunillucky143">Sunil Gundala</a>
  <br />
  If LogBook helps you, consider giving it a star.
</p>
