/**
 * Stamps the initial migration as applied without running it.
 * Use this when the DB tables already exist but Drizzle hasn't tracked them yet.
 */
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { join } from "path";
import { Client } from "../node_modules/@types/pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const migrationPath = join(
  import.meta.dir,
  "../drizzle/0000_useful_human_robot.sql",
);
const sql = readFileSync(migrationPath, "utf8");
const hash = createHash("sha256").update(sql).digest("hex");

const client = new Client({ connectionString: DATABASE_URL });
await client.connect();

// Create the drizzle migrations table if it doesn't exist
await client.query(`
  CREATE SCHEMA IF NOT EXISTS drizzle;
  CREATE TABLE IF NOT EXISTS drizzle."__drizzle_migrations" (
    id SERIAL PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  );
`);

// Check if already stamped
const { rows } = await client.query(
  `SELECT id FROM drizzle."__drizzle_migrations" WHERE hash = $1`,
  [hash],
);

if (rows.length > 0) {
  console.log("Migration already stamped, nothing to do.");
} else {
  await client.query(
    `INSERT INTO drizzle."__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
    [hash, Date.now()],
  );
  console.log(
    `✓ Stamped migration 0000_useful_human_robot (${hash.slice(0, 8)}...)`,
  );
}

await client.end();
