# Log Book Project

## Overview
Time-tracking API for OPT students doing unpaid work/volunteering, with rich documentation capabilities.

## Agent Team Structure

```
                    ┌─────────────────┐
                    │   TEAM LEAD     │
                    │   (Orchestrator)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ System Design │    │   Backend     │    │   Frontend    │
│    Agent      │    │   Developer   │    │    Team       │
└───────────────┘    └───────┬───────┘    └───────┬───────┘
                             │                    │
                    ┌────────┼────────┐    ┌──────┴──────┐
                    ▼        ▼        ▼    ▼             ▼
                  [DB]    [API]  [Integr] [Design]  [Developer]
                             │                          │
                             ▼                          ▼
                    ┌───────────────┐          ┌───────────────┐
                    │ Backend Tests │          │Frontend Tests │
                    └───────────────┘          └───────────────┘
```

## Quick Reference

- **Design Spec:** `/docs/DESIGN.md`
- **Agent Definitions:** `/agents/*.md`
- **Backend Code:** `/backend/`
- **Frontend Code:** `/frontend/`

## Commands

```bash
# Backend
cd backend && go run cmd/server/main.go

# Frontend
cd frontend && npm run dev

# Tests
cd backend && go test ./...
cd frontend && npm test
```

## Environment Variables

Backend (.env):
```
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=sk_...
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=logbook-media
```

Frontend (.env):
```
VITE_API_URL=http://localhost:8080
VITE_CLERK_PUBLISHABLE_KEY=pk_...
```
