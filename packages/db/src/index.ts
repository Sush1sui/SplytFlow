import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionStr = process.env.DATABASE_URL;
if (!connectionStr) throw new Error("DATABASE_URL is not set");

const client = postgres(connectionStr, { prepare: false });

export const db = drizzle(client, { schema });
export * from "./schema";
