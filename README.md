# Uptime Globe (MVP)

A simple production-minded uptime monitor built with Next.js App Router + TypeScript + Tailwind + Prisma + Postgres + NextAuth + Resend.

## Features

- Signup/login with credentials auth
- Add up to 25 URL monitors per user
- URL normalization (`example.com` -> `https://example.com`)
- SSRF baseline protection (blocks localhost/private/link-local/.local patterns)
- Status engine with false-alarm protection:
  - checks every `CHECK_INTERVAL_SECONDS` (default `60`)
  - DOWN after `FAIL_THRESHOLD` consecutive failures (default `2`)
  - UP after first success
- Alert transitions:
  - DOWN email on `UP -> DOWN`
  - Recovered email on `DOWN -> UP` (user toggle)
  - cooldown for repeated DOWN alerts: `ALERT_COOLDOWN_MINUTES`
- Dashboard with polling refresh every 15s
- Dev cron mode + prod cron endpoint mode

## Stack

- Next.js 14 + TypeScript + Tailwind
- Prisma + PostgreSQL
- NextAuth credentials provider
- Resend email provider wrapper

## Environment Variables

Create `.env` from `.env.example`:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `EMAIL_PROVIDER_API_KEY`
- `EMAIL_FROM`
- `CRON_SECRET`
- `CHECK_INTERVAL_SECONDS` (default: `60`)
- `FAIL_THRESHOLD` (default: `2`)
- `ALERT_COOLDOWN_MINUTES` (default: `30`)
- `ENABLE_DEV_CRON` (`true` enables in-app cron loop in dev)
- `DASHBOARD_URL`

## Local setup

1. Install deps:
   ```bash
   npm install
   ```
2. Start Postgres (example):
   ```bash
   docker compose up -d
   ```
3. Generate Prisma client + migrate:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```
4. Run app:
   ```bash
   npm run dev
   ```

## Cron modes

### 1) Dev mode

Set:

```bash
ENABLE_DEV_CRON=true
```

The app starts an internal timer that executes checks every `CHECK_INTERVAL_SECONDS`.

### 2) Prod mode

Use external scheduler to call:

```bash
POST /api/cron/check
```

Include one:

- header `x-cron-secret: <CRON_SECRET>`
- or query `?secret=<CRON_SECRET>`

Example:

```bash
curl -X POST "http://localhost:3000/api/cron/check?secret=$CRON_SECRET"
```

## Testing alerts locally

1. Add a real website monitor and one intentionally failing URL.
2. Trigger cron manually with curl command above.
3. After 2 failures, monitor transitions to DOWN and sends one down email.
4. Fix URL to valid site and run cron again; monitor transitions to UP and recovery email is sent (if enabled).

## Notes

- Paused monitors are skipped.
- `CheckEvent` keeps lightweight check history.
- If `EMAIL_PROVIDER_API_KEY` is empty, email sends are logged to console.
