/**
 * ============================================================
 *  Drizzle ORM – Database Client
 * ============================================================
 *
 *  FIRST-TIME SETUP (fresh database / new dev environment)
 *  ─────────────────────────────────────────────────────────
 *  1. Make sure DATABASE_URL is set in your .env file.
 *
 *  2. Push the schema directly to the database without
 *     creating migration files (great for first-time setup
 *     or local dev when you just want the tables to exist):
 *
 *       bun run db:push
 *
 *     ⚠️  db:push is destructive on column renames/drops.
 *         Use migrations in production instead (see below).
 *
 * ─────────────────────────────────────────────────────────
 *  MIGRATION WORKFLOW (recommended for production/staging)
 * ─────────────────────────────────────────────────────────
 *  Whenever you change src/db/schema.ts, follow these steps:
 *
 *  1. Generate a SQL migration file from your schema diff:
 *
 *       bun run db:generate
 *
 *     → Creates a new timestamped file in ./drizzle/
 *       (e.g. drizzle/0001_add_users_table.sql)
 *     → Always review the generated SQL before applying it.
 *
 *  2. Apply all pending migrations to the database:
 *
 *       bun run db:migrate
 *
 *     → Runs every .sql file in ./drizzle/ that hasn't been
 *       applied yet. Drizzle tracks this in the
 *       __drizzle_migrations table inside your database.
 *
 * ─────────────────────────────────────────────────────────
 *  OTHER USEFUL COMMANDS
 * ─────────────────────────────────────────────────────────
 *  Open Drizzle Studio (visual DB browser, like Prisma Studio):
 *
 *    bun run db:studio
 *
 *  → Opens a web UI at https://local.drizzle.studio
 *    where you can browse and edit your data.
 *
 * ─────────────────────────────────────────────────────────
 *  QUICK REFERENCE
 * ─────────────────────────────────────────────────────────
 *  db:push      → Apply schema directly (no migration files)
 *  db:generate  → Generate SQL migration file from schema diff
 *  db:migrate   → Run pending migration files on the database
 *  db:studio    → Open visual database browser
 * ============================================================
 */

import { drizzle } from "drizzle-orm/bun-sql";
import * as schema from "./schema";

export const db = drizzle({
  connection: process.env.DATABASE_URL!,
  schema,
});
