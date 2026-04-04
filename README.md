# SplytFlow

SplytFlow is a sales tracking app with split-aware analytics, OTP-based auth flows, currency-aware reporting, and CSV exports.

This repository contains two main apps:

- `mobile/` - Expo React Native client
- `server/` - Bun + Elysia API

## Current Highlights

- Email/password sign in and sign up
- OTP verification for sign up and password reset
- Forgot-password flow with secure reset token handoff
- Sales analytics by range with split impact insights
- Currency preference with local persistence and conversion options
- Sales records store both original entered amount/currency and normalized amount for stable analytics
- CSV export based on selected analytics range, grouped by sale date

## Workspace Layout

- `mobile/` - mobile app, UI, routing, local state, API calls
- `server/` - API modules, auth, OTP, sales, splits, DB access
- `ui-reference/` - design/reference assets

## Quick Start

### 1) Start the API

```bash
cd server
bun install
bun run dev
```

Set required environment variables before running:

- `DATABASE_URL`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `PORT` (optional, default `3001`)

### 2) Start the Mobile App

```bash
cd mobile
bun install
bun run start
```

For device testing, configure:

- `LOCAL_IP`
- `LOCAL_PORT`

In addition, set secure-store key names used by the app:

- `EXPO_PUBLIC_TOKEN_KEY`
- `EXPO_PUBLIC_REFRESH_TOKEN_KEY`
- `EXPO_PUBLIC_RECENT_LOGS_KEY`

## Support

For help requests, contact:

- `splytflow.whatsbakin@gmail.com`
