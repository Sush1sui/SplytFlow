import { Hono } from "hono";
import { db } from "@splytflow/db";
import { dbRoutes } from "./routes/db.route";

const app = new Hono();

app.route("/", dbRoutes);

export type AppType = typeof app;
export type DbType = typeof db;
export { app };
export default { port: process.env.PORT || 3000, fetch: app.fetch };
