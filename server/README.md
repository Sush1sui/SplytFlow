# SplytFlow Server

Backend API for SplytFlow built with Bun, Elysia, Drizzle ORM, and PostgreSQL.

## Current Scope

- Auth:
  - `POST /auth/signin`
  - `POST /auth/signup`
  - `POST /auth/refresh`
  - `POST /auth/password-reset` (public reset using short-lived reset token)
  - protected profile/password/logout routes
- OTP:
  - `POST /otp` for code generation (`signup` and `password-reset`)
  - `POST /otp/verify` for code verification
  - returns `resetToken` for `password-reset` purpose
- Sales, split categories, and splits modules

## Sales Data Notes

- Sale records persist:
  - `originalAmount`: exact user-entered number
  - `currencyCode`: original entry currency
  - `amount`: normalized amount used for analytics/totals
- Same-day upsert behavior is currency-aware.
- Sales range/list queries can be filtered by `currencyCode`.

## Environment Variables

Required:

- `DATABASE_URL`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

Optional:

- `PORT` (defaults to `3001`)

## Development

Install dependencies:

```bash
bun install
```

Start dev server:

```bash
bun run dev
```

## Database Commands

Generate migration:

```bash
bun run db:generate
```

Apply migrations:

```bash
bun run db:migrate
```

Push schema directly:

```bash
bun run db:push
```

Open Drizzle Studio:

```bash
bun run db:studio
```

## Tests

Run all unit tests:

```bash
bun run test
```

Run auth-focused unit tests:

```bash
bun run test:unit:auth
```

Run endpoint unit tests:

```bash
bun run test:unit:endpoints
```

## Notes

- OTP records are cleaned up by a background cleanup job.
- Password reset depends on OTP verification plus a signed short-lived reset token.
