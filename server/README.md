# Elysia with Bun runtime

## Getting Started

To get started with this template, simply paste this command into your terminal:

```bash
bun create elysia ./elysia-example
```

## Development

To start the development server run:

```bash
bun run dev
```

Open http://localhost:3000/ with your browser to see the result.

## Development Database Utilities

### Reset only sales domain data (development)

This project includes a safe reset utility for sales-domain tables only:

- Sale
- Split
- SplitHistory

It does not touch User, Auth, RefreshToken, or OTP records.

Preview what would be deleted:

```bash
bun run db:reset:domain --dry-run
```

Execute for all users (destructive):

```bash
bun run db:reset:domain --yes
```

Execute for one user only:

```bash
bun run db:reset:domain --user-id <user-uuid> --yes
```

Warning: this command is development-only and permanently deletes rows from the listed tables.
