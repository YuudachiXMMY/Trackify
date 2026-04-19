# syntax=docker/dockerfile:1.7
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /workspace

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

FROM deps AS dev
COPY . .
RUN pnpm --filter './packages/db' exec prisma generate
EXPOSE 3010
CMD ["pnpm", "--filter", "./apps/api", "dev"]

# ── Production target ──────────────────────────
# Build: docker build --target prod -t trackify-api .
FROM deps AS prod
COPY . .
RUN pnpm --filter './packages/db' exec prisma generate
EXPOSE 3010
ENV NODE_ENV=production
CMD ["npx", "tsx", "apps/api/src/server.ts"]
