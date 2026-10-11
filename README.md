# Mini Ticket Tracker

A small support-ticket tracker: a REST API, a PostgreSQL database and a single-page React UI.

**Stack:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`), Zod, Vitest and Supertest on the backend; React, TypeScript, Vite and Tailwind CSS v4 on the frontend.

## Prerequisites

- Node.js 20 or newer
- A running PostgreSQL server (any recent version)

## Setup

### 1. Create two databases

```bash
createdb ticket_tracker
createdb ticket_tracker_test
```

You can also create them in pgAdmin. The test database is separate because the tests wipe the `tickets` table before every test.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env     # then edit .env and set your Postgres user and password
npm run migrate          # applies db/schema.sql to both databases
npm run dev              # API on http://localhost:3000
```

### 3. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev              # UI on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend and strips the `/api` prefix, so the API itself serves `/tickets` exactly as in the brief.

## Running the tests

```bash
cd backend
npm test
```

The integration tests use Vitest and Supertest against `ticket_tracker_test` and cover create, list with filter and pagination, stats, and PATCH, including validation and 404 cases. `TEST_DATABASE_URL` must be set in `.env` and the schema applied with `npm run migrate`.

## API

| Method | Path             | Description                                                                         |
| ------ | ---------------- | ----------------------------------------------------------------------------------- |
| POST   | `/tickets`       | Create a ticket. Body: `title` (required), `description?`, `priority?`              |
| GET    | `/tickets`       | List tickets. Query: `status?`, `page?` (default 1), `limit?` (default 10, max 100) |
| PATCH  | `/tickets/:id`   | Update `status` and/or `priority`. Unknown fields are rejected                      |
| GET    | `/tickets/stats` | Counts per status. All three keys are always present                                |

Errors use one shape: `{ "error": { "message": "...", "details": [...] } }`.

## Project structure

```
backend/   Express API: routes -> validation -> controllers -> services -> repositories
           db/ holds schema.sql and the migration script; tests/ holds integration tests
frontend/  React UI: components/, hooks/useTickets.ts, api/tickets.ts (all fetch calls), types/
```

## Decisions & Tradeoffs

I used a layered backend (route, validation, controller, service, repository) to keep HTTP handling, business rules and SQL separate, even though the service layer is thin at this size. SQL is written with raw `pg` and parameterised queries instead of an ORM, and the schema is applied by a small idempotent script rather than a migration tool, so there is no migration history or rollback. Pagination is offset-based with a stable `created_at, id` ordering, and a page past the end returns an empty list rather than an error; cursor pagination would scale better on large tables. The frontend refetches the list and stats after every change instead of using optimistic updates or React Query, which is simple and always correct but costs an extra request. Types are duplicated between frontend and backend, and with more time I would share them or generate them from an OpenAPI spec. There is no authentication, no editing or deletion beyond what the brief required, and styling is minimal Tailwind. `HttpError` lives in `middleware/`, which is a small layering compromise, and I would move it to a neutral module. With more time I would add frontend tests, CI that runs the test suite, a Docker setup for the whole stack, and a proper migration tool.

### Assumptions

- New tickets default to status `open` and priority `medium`.
- Results are ordered newest first, and `limit` is capped at 100.
- `PATCH` accepts only `status` and `priority`, and an empty body is a 400.
- `id` is an auto-incrementing integer (UUIDs would avoid exposing ticket counts).
