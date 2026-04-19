# Trackify

Habit tracking, fitness recording, and time management app.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6 + shadcn/ui (Figma Make) |
| Backend | Hono 4 + Node.js 22 |
| Database | PostgreSQL 16 + Prisma 5 |
| Auth | JWT (jsonwebtoken) |
| Validation | Zod |
| Deployment | Docker + Traefik (IthacaServer) |

## Architecture

```
Trackify/
├── apps/
│   ├── web/                    ← Figma Make SPA (READ-ONLY upstream)
│   ├── api/                    ← Hono HTTP backend
│   └── web-overrides/          ← Fork layer + Vite plugin
├── packages/
│   ├── db/                     ← Prisma client + PostgreSQL schema
│   └── shared/                 ← Zod schemas + API envelope
├── scripts/                    ← Sync, docker, drift detection
├── docker/                     ← DB init scripts
├── docker-compose.yml          ← Dev (PostgreSQL only + full profile)
└── docker-compose.prod.yml     ← Prod (Traefik + backups)
```

## Critical Rules

1. **Never edit `apps/web/src/**` directly** — Figma Make will overwrite on next sync. Use `apps/web-overrides/` instead.
2. **One sanctioned self-fork**: Only `apps/web/vite.config.ts` may be edited in place. Update `FORK_REGISTRY.yaml` if changed.
3. **Validate payloads with Zod** — Every external input must be validated with `@trackify/shared` schemas.
4. **Immutability by default** — Use spread/update, never mutate existing objects.
5. **Small files** — Prefer <400 lines per file.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment template
cp .env.example .env.local
# Edit passwords and JWT_SECRET

# 3. Start PostgreSQL
pnpm docker:postgres

# 4. Set up database
pnpm db:generate
pnpm db:migrate
pnpm db:seed

# 5. Start dev servers (api + web)
pnpm dev
```

## Figma Sync

```bash
pnpm figma:sync              # Sync from GitHub (YuudachiXMMY/Trackify-Figma)
pnpm figma:sync:github        # Explicit GitHub sync
pnpm figma:check-forks        # Check for drift in forked files
```

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /health | No | Health check (DB connectivity) |
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Login, returns JWT |
| GET | /api/auth/me | Yes | Current user profile |
| GET | /api/habits | Yes | List habits |
| POST | /api/habits | Yes | Create habit |
| POST | /api/habits/:id/logs | Yes | Log habit completion |
| GET | /api/habits/:id/logs | Yes | Get habit logs (date range) |
| DELETE | /api/habits/:id | Yes | Delete habit |
| GET | /api/workouts | Yes | List workouts (date range) |
| POST | /api/workouts | Yes | Create workout with exercises |
| GET | /api/workouts/:id | Yes | Get workout detail |
| DELETE | /api/workouts/:id | Yes | Delete workout |
| GET | /api/time-entries | Yes | List time entries (date range) |
| POST | /api/time-entries | Yes | Start time entry |
| PATCH | /api/time-entries/:id/stop | Yes | Stop running timer |
| DELETE | /api/time-entries/:id | Yes | Delete time entry |
| GET | /api/categories | Yes | List categories |
| POST | /api/categories | Yes | Create category |
| DELETE | /api/categories/:id | Yes | Delete category |

## Docker

```bash
pnpm docker:postgres          # Start PostgreSQL only (dev)
pnpm docker:full              # Full stack in containers
./scripts/docker-fullstack.sh  # Helper (up/down/logs/health/reset)
```

## Database

```bash
pnpm db:generate              # Regenerate Prisma client
pnpm db:migrate               # Create + apply migration
pnpm db:studio                # Open Prisma Studio
pnpm db:seed                  # Seed demo user + data
```
