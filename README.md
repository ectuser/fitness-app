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
pnpm dev
```

The local app runs at `http://localhost:3000/`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm preview
pnpm typecheck
pnpm lint
pnpm test:e2e
```

## Deployment

`pnpm build` emits TanStack Start output under `dist/client` and `dist/server`. Deploy it to a target that supports the TanStack Start server output, or add a static adapter before deploying to static-only hosting.
