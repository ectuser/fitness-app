# Fitness Tracker

A mobile-first workout tracker built with React, TypeScript, TanStack Start, TanStack Router, Tailwind CSS, and shadcn/ui. Workouts, exercises, session progress, and exercise stats are stored locally in the browser.

## Features

- Create, edit, duplicate, complete, and reopen workouts.
- Run active workout sessions with per-set completion tracking.
- Manage a seeded exercise library and custom exercises.
- Create exercises inline while building a workout.
- View exercise history and stats from completed workouts.
- Restore the last visited app route on reload.

## Tech Stack

- React 19
- TanStack Start and TanStack Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui and Radix UI
- Playwright end-to-end tests
- Browser localStorage persistence

## Getting Started

```bash
pnpm install
cp .env.example .env.local
docker compose --env-file .env.local up -d --wait
pnpm db:migrate
pnpm dev
```

`pnpm dev` runs the web app at `http://localhost:3000/` and the API at `http://localhost:3001/` in parallel. Vite proxies `/api` and `/health` to the API. PostgreSQL (Docker Compose, loopback only) and migrations are started manually; `pnpm db:migrate` is a no-op until the first table exists, and `pnpm db:generate` writes new migrations to `apps/api/drizzle`. Stop the database with `docker compose --env-file .env.local down` (its volume is kept).

API tests need the same PostgreSQL running; they use a separate `fitness_test` database, created automatically.

## Scripts

```bash
pnpm dev
pnpm db:generate
pnpm db:migrate
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm test:e2e
```

## Deployment

`pnpm build` emits TanStack Start output under `apps/web/dist/client` and `apps/web/dist/server`. Deploy it to a target that supports the TanStack Start server output, or add a static adapter before deploying to static-only hosting.
