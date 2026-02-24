# Task Management Service

A Task Management microservice built with Node.js 22, TypeScript, and Express, following Clean Architecture.

## Architecture

```
src/
├── domain/           # Entities, value objects, repository interfaces, domain errors
├── application/      # Use cases, DTOs, port interfaces
├── infrastructure/   # PostgreSQL/in-memory repositories, config, logger
└── interface/        # Express HTTP layer (controllers, routes, middleware, validators)
```

Dependencies flow inward: `interface → application → domain`. Infrastructure implements domain interfaces.

## Quick Start

```bash
npm install
npm run dev          # Starts with in-memory store (no DB needed)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/ready` | Readiness probe |
| `POST` | `/api/v1/tasks` | Create a task |
| `GET` | `/api/v1/tasks` | List tasks (paginated, filterable) |
| `GET` | `/api/v1/tasks/:id` | Get task by ID |
| `PATCH` | `/api/v1/tasks/:id` | Update task details |
| `PATCH` | `/api/v1/tasks/:id/status` | Transition task status |
| `DELETE` | `/api/v1/tasks/:id` | Delete a task |

### Query Parameters (List)

- `status` — `PENDING`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`
- `priority` — `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `assigneeId` — UUID
- `search` — text search on title/description
- `page` — page number (default: 1)
- `limit` — items per page (default: 20, max: 100)

### Status Transitions

```
PENDING → IN_PROGRESS → COMPLETED
PENDING → CANCELLED
IN_PROGRESS → CANCELLED
```

Terminal states (`COMPLETED`, `CANCELLED`) cannot transition further.

## Scripts

```bash
npm run dev           # Development with hot reload (tsx)
npm run build         # Compile TypeScript
npm start             # Run compiled output
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run typecheck     # Type check without emitting
npm run lint          # ESLint
```

## Configuration

Copy `.env.example` to `.env`. Key variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `USE_IN_MEMORY` | `true` | Use in-memory store instead of PostgreSQL |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `task_management` | Database name |
| `LOG_LEVEL` | `info` | Pino log level |

## Docker

```bash
# Full stack with PostgreSQL
docker compose up

# Build image only
docker build -t task-management-service .
```

## Tech Stack

- **Runtime**: Node.js 22 LTS
- **Language**: TypeScript (strict mode)
- **Framework**: Express
- **Validation**: Zod
- **Logging**: Pino
- **Database**: PostgreSQL (via `pg`) or in-memory
- **Testing**: Vitest + Supertest
- **Security**: Helmet, CORS, compression
