/**
 * ============================================================
 *  Drizzle ORM – Database Client (PostgreSQL via bun-sql)
 * ============================================================
 *
 *  FIRST-TIME SETUP (fresh database / new dev environment)
 *  ─────────────────────────────────────────────────────────
 *  1. Make sure DATABASE_URL is set in your .env file.
 *
 *  2a. If the database is empty, push the schema directly
 *      without creating migration files:
 *
 *        bun run db:push
 *
 *      ⚠️  db:push is destructive on column renames/drops.
 *          Use migrations in production instead (see below).
 *
 *  2b. If the tables already exist but Drizzle hasn't tracked
 *      them yet (e.g. DB was created outside of Drizzle),
 *      stamp the baseline migration as applied without re-
 *      running the SQL:
 *
 *        bun run db:stamp
 *
 *      → Inserts the hash of 0000_useful_human_robot.sql into
 *        drizzle.__drizzle_migrations so Drizzle considers the
 *        baseline already applied.
 *      → Safe to run multiple times (idempotent).
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
 *     → Creates a new numbered file in ./drizzle/
 *       (e.g. drizzle/0001_some_description.sql)
 *     → Always review the generated SQL before applying it.
 *
 *  2. Apply all pending migrations to the database:
 *
 *       bun run db:migrate
 *
 *     → Runs every .sql file in ./drizzle/ that hasn't been
 *       applied yet. Drizzle tracks applied migrations in
 *       the drizzle.__drizzle_migrations table.
 *
 * ─────────────────────────────────────────────────────────
 *  OTHER USEFUL COMMANDS
 * ─────────────────────────────────────────────────────────
 *  Open Drizzle Studio (visual DB browser):
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
 *  db:stamp     → Mark baseline migration as applied (no SQL run)
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
