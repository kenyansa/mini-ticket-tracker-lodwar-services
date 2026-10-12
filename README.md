# Mini Ticket Tracker

A small support-ticket tracker: a REST API, a PostgreSQL database and a single-page React UI. Built as a take-home assignment for Lodwar Services.

**Stack**

- **Backend:** Node.js, Express 5, TypeScript, PostgreSQL (`pg`), Zod, Vitest and Supertest
- **Frontend:** React, TypeScript, Vite, Tailwind CSS v4
- **Infrastructure:** Docker Compose

## Features

- Create tickets with a title, optional description and priority
- List tickets with a status filter and pagination, newest first
- Change a ticket's status from the list (priority can be changed through the API)
- Live counts per status
- Consistent validation and error responses

## Project structure

```
mini-ticket-tracker/
├── README.md
├── docker-compose.yml
├── docker/initdb/01-create-test-db.sql  
│
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── db/
│   │   ├── schema.sql                    # enums, tickets table, indexes (idempotent)
│   │   └── migrate.ts                    # applies schema.sql to the dev and test databases
│   ├── src/
│   │   ├── server.ts                     # starts the HTTP listener, graceful shutdown
│   │   ├── app.ts                        # builds the Express app (no listen, so tests can import it)
│   │   ├── config.ts                     # env vars; picks the test DB when NODE_ENV=test
│   │   ├── db.ts                         # shared pg Pool
│   │   ├── routes/                       # URL -> middleware -> controller
│   │   ├── controllers/                  # HTTP in and out only
│   │   ├── services/                     # business rules (404s, stats shaping, pagination envelope)
│   │   ├── repositories/                 # all SQL lives here
│   │   ├── validation/                   # Zod schemas; TypeScript types are inferred from them
│   │   └── middleware/                   # validation, error handling
│   └── tests/                            # Vitest + Supertest integration tests
│
└── frontend/
    ├── Dockerfile
    ├── nginx.conf                        # serves the UI and proxies /api to the backend (Docker)
    └── src/
        ├── App.tsx                       # the single page
        ├── api/tickets.ts                # all fetch calls in one place
        ├── hooks/useTickets.ts           # filter, page, data, loading and error state
        ├── components/                   # TicketForm, TicketList, TicketRow, StatusFilter,
        │                                 # Pagination, StatsBar, Badge
        └── types/ticket.ts               # Ticket, Status, Priority and API response types
```

Request flow in the backend: **route → validation → controller → service → repository → database**.

## Prerequisites

Choose one:

- **Local setup:** Node.js 20 or newer, and a running PostgreSQL server
- **Docker setup:** Docker with Compose v2 (no Node or PostgreSQL needed)

## Setup (local)

### 1. Create two databases

```bash
createdb ticket_tracker
createdb ticket_tracker_test
```

You can also create them in pgAdmin (right-click **Databases → Create → Database**). The test database is separate because the tests wipe the `tickets` table before every test.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env     
npm run migrate        
npm run dev              # API on http://localhost:3000
```

### 3. Frontend (in a second terminal)

```bash
cd frontend
npm install
npm run dev              # UI on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to the backend and strips the `/api` prefix, so the API itself serves `/tickets` exactly as written in the brief and no CORS configuration is needed.

### Environment variables (`backend/.env`)

| Variable            | Purpose                                  | Example                                                                |
| ------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `PORT`              | API port                                 | `3000`                                                                 |
| `DATABASE_URL`      | Development database                     | `postgres://postgres:your_password@localhost:5432/ticket_tracker`      |
| `TEST_DATABASE_URL` | Test database, used when `NODE_ENV=test` | `postgres://postgres:your_password@localhost:5432/ticket_tracker_test` |

## Setup (Docker)

If you don't have Node or PostgreSQL installed, you only need Docker:

```bash
docker compose up --build
```

- UI: http://localhost:8080
- API: http://localhost:3000
- PostgreSQL: host port **5433** (user `postgres`, password `postgres`, local use only)

The API container applies the schema to both databases on every start, which is safe because the schema script is idempotent. To run the tests from your machine against the containerised database, set this in `backend/.env` and run `npm test` in `backend/`:

```
TEST_DATABASE_URL=postgres://postgres:postgres@localhost:5433/ticket_tracker_test
```

Reset all data with:

```bash
docker compose down -v
```

The Docker setup runs production builds, so there is no hot reload. Use the local setup while developing.

## Running the tests

```bash
cd backend
npm test
```

The integration tests use Vitest and Supertest against `ticket_tracker_test`, and the table is truncated before every test so each one starts from a known state. They cover:

- **Create:** defaults, missing title, invalid priority, unknown fields
- **Stats:** zero counts on an empty table, and grouped counts including zeros
- **List:** newest-first pagination, status filter, invalid filter
- **PATCH:** status and priority update, unknown id (404), invalid status, empty body, unknown fields

Prerequisites: `TEST_DATABASE_URL` is set in `.env` and the schema has been applied with `npm run migrate`.

## Scripts

**Backend** (`backend/`)

| Script              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Run the API with `tsx` in watch mode                |
| `npm run build`     | Compile TypeScript to `dist/`                       |
| `npm start`         | Run the compiled API                                |
| `npm run migrate`   | Apply `db/schema.sql` to the dev and test databases |
| `npm test`          | Run the integration tests                           |
| `npm run typecheck` | Type-check without emitting                         |

**Frontend** (`frontend/`)

| Script          | Description                           |
| --------------- | ------------------------------------- |
| `npm run dev`   | Vite dev server with the `/api` proxy |
| `npm run build` | Type-check and build for production   |

## API

| Method | Path             | Description                                                                              | Success                  |
| ------ | ---------------- | ---------------------------------------------------------------------------------------- | ------------------------ |
| POST   | `/tickets`       | Create a ticket. Body: `title` (required, max 200 chars), `description?`, `priority?`    | `201` + ticket           |
| GET    | `/tickets`       | List tickets. Query: `status?`, `page?` (default 1), `limit?` (default 10, max 100)      | `200` + paginated result |
| PATCH  | `/tickets/:id`   | Update `status` and/or `priority`. At least one is required, unknown fields are rejected | `200` + ticket           |
| GET    | `/tickets/stats` | Counts per status. All three keys are always present                                     | `200` + counts           |
| GET    | `/health`        | Liveness check                                                                           | `200`                    |

### Examples

```bash
# create
curl -X POST localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"VPN down","description":"Nobody can connect","priority":"high"}'

# list, second page of open tickets, 5 per page
curl "localhost:3000/tickets?status=open&page=2&limit=5"

# change status
curl -X PATCH localhost:3000/tickets/1 \
  -H "Content-Type: application/json" -d '{"status":"in_progress"}'

# stats
curl localhost:3000/tickets/stats
```

### Response shapes

A ticket:

```json
{
  "id": 1,
  "title": "VPN down",
  "description": "Nobody can connect",
  "status": "open",
  "priority": "high",
  "createdAt": "2026-10-11T09:30:00.000Z"
}
```

A list result:

```json
{
  "data": [
    /* tickets */
  ],
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3
}
```

Stats:

```json
{ "open": 2, "in_progress": 1, "closed": 0 }
```

### Errors

All errors use one shape:

```json
{
  "error": {
    "message": "Validation failed",
    "details": [{ "field": "title", "message": "Title is required" }]
  }
}
```

| Status | When                                                                        |
| ------ | --------------------------------------------------------------------------- |
| `400`  | Validation failure, malformed JSON, or an invalid id, page, limit or status |
| `404`  | Unknown ticket id, or an unknown route                                      |
| `500`  | Unexpected error (details are logged on the server, not returned)           |

## Data model

| Field         | Type                                 | Notes                                                                   |
| ------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| `id`          | `BIGSERIAL`                          | Primary key                                                             |
| `title`       | `VARCHAR(200) NOT NULL`              | Blank titles are rejected by a `CHECK` constraint as well as by the API |
| `description` | `TEXT`                               | Optional                                                                |
| `status`      | enum `open`, `in_progress`, `closed` | Defaults to `open`                                                      |
| `priority`    | enum `low`, `medium`, `high`         | Defaults to `medium`                                                    |
| `created_at`  | `TIMESTAMPTZ NOT NULL DEFAULT now()` | Set by the database                                                     |

Indexes: `(status)` for the filter and stats, and `(created_at DESC, id DESC)` for stable newest-first pagination.

## Decisions & Tradeoffs

- I used a layered backend (route, validation, controller, service, repository) to keep HTTP handling, business rules and SQL separate, even though the service layer is thin at this size. 
- SQL is written with raw `pg` and parameterised queries instead of an ORM, and the schema is applied by a small idempotent script rather than a migration tool, so there is no migration history or rollback. 
- Pagination is offset-based with a stable `created_at, id` ordering, and a page past the end returns an empty list rather than an error; cursor pagination would scale better on large tables. 
- The frontend refetches the list and stats after every change instead of using optimistic updates or React Query, which is simple and always correct but costs an extra request. 
- Types are duplicated between frontend and backend, and with more time I would share them or generate them from an OpenAPI spec. 
- There is no authentication, no editing or deletion beyond what the brief required, and styling is minimal Tailwind. 
- `HttpError` lives in `middleware/`, which is a small layering compromise, and I would move it to a neutral module. 
- The Docker setup runs production builds with no hot reload and uses throwaway local credentials, so it is for evaluation rather than deployment. With more time I would add frontend tests, CI that runs the test suite, and a proper migration tool.

### Assumptions

- New tickets default to status `open` and priority `medium`.
- Results are ordered newest first, and `limit` is capped at 100.
- `PATCH` accepts only `status` and `priority`; unknown fields and an empty body return `400`.
- If a status filter is active and a ticket is changed so it no longer matches, it leaves the list after the refetch, and the stats cards show where it went.
- `id` is an auto-incrementing integer (UUIDs would avoid exposing ticket counts).
- The API serves `/tickets` directly, as in the brief. The `/api` prefix exists only in the browser and is stripped by the Vite dev proxy or nginx.
- `GET /tickets/stats` is declared before `/tickets/:id` so `stats` is never treated as an id.
