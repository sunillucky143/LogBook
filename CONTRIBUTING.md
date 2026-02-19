# Contributing to LogBook

Thank you for your interest in contributing to LogBook! This guide will help you get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior by opening an issue.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/LogBook.git
   cd LogBook
   ```
3. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites

- [Go](https://go.dev/dl/) 1.21+
- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) (or a [Supabase](https://supabase.com/) project)
- [Clerk](https://clerk.com/) account
- [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket

### Backend

```bash
cd backend
cp .env.example .env    # Fill in your environment variables
go run cmd/server/main.go
```

### Frontend

```bash
cd frontend
cp .env.example .env    # Fill in your environment variables
npm install
npm run dev
```

## Project Structure

```
backend/
├── cmd/server/          # Entry point
├── internal/
│   ├── config/          # Environment & configuration
│   ├── database/        # DB connection & migrations
│   ├── middleware/       # Auth, CORS, rate limiting
│   ├── models/          # Data models & response types
│   ├── handlers/        # HTTP request handlers
│   ├── services/        # Business logic
│   ├── repository/      # Database queries
│   └── scheduler/       # Background jobs

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Route-level pages
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API client
│   ├── stores/          # Zustand state stores
│   ├── types/           # TypeScript definitions
│   └── utils/           # Helpers & formatters
```

## Development Guidelines

### Backend (Go)

- Follow standard Go project layout
- Business logic belongs in `services/`, database queries in `repository/`, HTTP handling in `handlers/`
- Use meaningful error messages - never expose internal errors to clients
- All new endpoints must be authenticated via Clerk JWT middleware
- Use parameterized queries - never concatenate SQL strings

### Frontend (TypeScript/React)

- Use TypeScript strictly - no `any` types
- Components go in `components/`, pages in `pages/`, state in `stores/`
- Use Tailwind CSS utility classes following the existing design system
- Server state via TanStack Query, client state via Zustand
- Use the `useApi()` hook for API calls - no raw `fetch`

### General

- Write clear, self-documenting code
- Keep functions focused and small
- Handle errors explicitly - don't swallow them silently
- Test your changes locally before submitting

## Submitting Changes

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

### Pull Request Process

1. **Update your branch** with the latest `main`:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Test your changes**:
   ```bash
   # Backend
   cd backend && go build ./... && go test ./...

   # Frontend
   cd frontend && npm run lint && npm run build
   ```
3. **Push** your branch and open a Pull Request
4. **Fill in the PR template** - describe what changed and why
5. **Link related issues** using `Closes #123` in the PR description
6. Wait for review - maintainers may request changes

### What Makes a Good PR

- Focused on a single concern (one feature or one bug fix)
- Includes a clear description of the change
- Follows existing code style and conventions
- Does not introduce unrelated changes
- Passes all existing tests

## Reporting Bugs

Use the [Bug Report](https://github.com/sunillucky143/LogBook/issues/new?labels=bug&template=bug_report.md) template and include:

- Steps to reproduce
- Expected behavior vs actual behavior
- Browser/OS/environment details
- Screenshots if applicable

## Requesting Features

Use the [Feature Request](https://github.com/sunillucky143/LogBook/issues/new?labels=enhancement&template=feature_request.md) template and describe:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

## Good First Issues

Look for issues labeled [`good first issue`](https://github.com/sunillucky143/LogBook/labels/good%20first%20issue) - these are curated for new contributors.

## Areas Where We Need Help

- **Testing** - Unit tests for backend services, component tests for frontend
- **Export** - PDF and DOCX export of log entries and time summaries
- **Accessibility** - WCAG compliance audit and improvements
- **Mobile** - Responsive refinements and PWA support
- **CI/CD** - GitHub Actions pipelines
- **Documentation** - OpenAPI/Swagger specs, user guide
- **i18n** - Internationalization support

## Questions?

If you have questions about contributing, feel free to open a [Discussion](https://github.com/sunillucky143/LogBook/discussions) or an issue.
