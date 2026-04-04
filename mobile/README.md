# SplytFlow Mobile

React Native app built with Expo Router, Tamagui, and Redux Toolkit.

## Current Features

- Sign in and sign up flows with OTP verification
- Forgot-password flow:
  - request reset code via email
  - verify OTP with purpose `password-reset`
  - reset password from auth screen
- Sales tracking and history editing
- Split-aware analytics and range snapshot insights
- CSV export for the active range
- CSV export for the active range, grouped by date
- Currency preferences with local persistence:
  - default currency is `PHP` if no local setting exists
  - user can switch currency and choose `convert amounts` or `keep numbers`
- Sales currency stability:
  - each sale row keeps the original entered amount and entry currency for edit/history accuracy
  - a normalized stored amount is used for analytics and totals

## Key Folders

- `app/` - route files (Expo Router)
- `components/pages/` - feature-level screens and UI blocks
- `lib/context/` - auth, toast, currency contexts
- `lib/store/` - Redux slices and hooks
- `lib/utils/` - formatting, OTP, CSV, and helpers
- `constants/` - API endpoints, sales constants, currency constants

## Setup

Install dependencies:

```bash
bun install
```

Configure environment values used by the app:

- `LOCAL_IP`
- `LOCAL_PORT`
- `EXPO_PUBLIC_TOKEN_KEY`
- `EXPO_PUBLIC_REFRESH_TOKEN_KEY`
- `EXPO_PUBLIC_RECENT_LOGS_KEY`

`LOCAL_IP` and `LOCAL_PORT` are read via `app.config.js` and used for API base URL in development.

## Commands

Start dev server:

```bash
bun run start
```

Run on platforms:

```bash
bun run android
bun run ios
bun run web
```

Quality checks:

```bash
bun run lint
bun run typecheck
```

## Notes

- Android CSV export uses direct Downloads storage. Test this on a development build.
- Support contact in-app points to `splytflow.whatsbakin@gmail.com`.
