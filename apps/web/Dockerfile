# syntax=docker/dockerfile:1.7
# ── Trackify Web — Production Build ────────────
# Multi-stage: pnpm install → Vite build → Nginx serve

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.28.0 --activate
WORKDIR /workspace

# ── Dependencies ───────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/web-overrides/package.json ./apps/web-overrides/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile

# ── Build ──────────────────────────────────────
FROM deps AS builder
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm --filter './apps/web' build

# ── Production (Nginx) ─────────────────────────
FROM nginx:alpine AS prod

RUN addgroup -g 1001 -S appgroup && \
    adduser -S -D -H -u 1001 -G appgroup appuser

COPY --from=builder /workspace/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
