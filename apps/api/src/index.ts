import { Hono } from "hono";
import { db } from "@splytflow/db";
import { dbRoutes } from "./routes/db.route";
import { authRoutes } from "./routes/auth.route";

const app = new Hono();

app.route("/db", dbRoutes);
app.route("/auth", authRoutes);

export type AppType = typeof app;
export type DbType = typeof db;
export { app };
export default { port: process.env.PORT || 3000, fetch: app.fetch };
