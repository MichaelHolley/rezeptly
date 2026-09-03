# Contributing

Local setup for development and testing.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/)

## Setup

```bash
pnpm install
cp .env.example .env   # then edit with your credentials
pnpm db:start          # start PostgreSQL (Docker must be running)
pnpm db:push           # apply schema
```

## Seed (optional)

Requires `db:start` and `db:push` first.

```bash
pnpm db:seed              # interactive menu
pnpm db:seed -- --clear   # clear + seed
pnpm db:seed -- --seed    # seed, keep existing data
```

## Run

```bash
pnpm dev
```

## Test

```bash
pnpm test       # unit and component tests
pnpm test:e2e   # isolated database, app server, and Playwright tests
```

The E2E command requires Docker. It creates a disposable PostgreSQL container and removes it
after the test run, leaving the development database untouched.
