# apps/api — Hono Backend

## Stack
- **Hono 4** — Lightweight HTTP framework
- **Node.js 22** — Runtime
- **Prisma 5** — ORM (PostgreSQL)
- **JWT** — Authentication via jsonwebtoken
- **Zod** — Request validation via @hono/zod-validator

## Route Pattern

Every route follows this pattern:
1. Extract params/body from request
2. Query Prisma
3. Return 404 if not found
4. Re-shape: Convert Prisma types to JSON-safe (Date → ISO string)
5. Respond with `ApiResult<T>` envelope: `{ ok: true, data }` or `{ ok: false, error }`

## Adding a New Route

1. Create `src/routes/new-route.ts`
2. Import and mount in `src/server.ts`: `app.route('/api/new-route', newRoute)`
3. Add Zod schemas to `packages/shared/src/`
4. Protect with `authGuard` middleware if auth required

## Environment Variables

| Var | Default | Purpose |
|-----|---------|---------|
| `DATABASE_URL` | (required) | Prisma PostgreSQL connection |
| `API_PORT` | `3010` | Server port |
| `API_HOST` | `0.0.0.0` | Server bind address |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `JWT_SECRET` | `dev-secret-change-me` | JWT signing secret |
