# CRM

Simple CRM to manage contacts, sales pipeline (kanban), activities, and
follow-up reminders. Built with the same architecture as CreatorOS:

- **Backend:** FastAPI, SQLAlchemy, Alembic, PostgreSQL, JWT + Google Sign-in
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Infra:** Docker Compose (frontend + backend + db)

## Features

- Email/password auth + Google Sign-in
- Contact management (create, edit, delete)
- Sales pipeline as a drag-and-drop kanban board (New -> Contacted ->
  Qualified -> Proposal -> Negotiation -> Won/Lost)
- Activity timeline per contact (calls, emails, meetings, notes)
- Follow-up reminders with due dates, surfaced on the dashboard

## Getting started

### Prerequisites

- Docker and Docker Compose

### Setup

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
docker compose up -d --build
```

- Frontend: http://localhost:3000
- Backend API + docs: http://localhost:8000/docs

### First run: apply migrations

```bash
docker compose exec backend alembic upgrade head
```

(The backend also auto-creates tables on startup for convenience during
development, but Alembic migrations are the source of truth going forward
-- use `alembic revision --autogenerate -m "..."` for future schema changes.)

### Google Sign-in setup (optional)

1. Create OAuth credentials in the Google Cloud Console.
2. Set the authorized redirect URI to
   `http://localhost:8000/api/v1/auth/google/callback`.
3. Fill `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `backend/.env`.

## Project structure

```
backend/    FastAPI app (auth, contacts, deals, activities, followups)
frontend/   Next.js app (login, dashboard, contacts, pipeline)
```
