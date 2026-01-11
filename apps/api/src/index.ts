import { Hono } from "hono";
import { db } from "@splytflow/db";
import { dbRoutes } from "./routes/db.route";
import { authRoutes } from "./routes/auth.route";
import { earningsRoutes } from "./routes/earnings.route";
import { splitConfigsRoutes } from "./routes/splitConfigs.route";

const app = new Hono();

app.route("/db", dbRoutes);
app.route("/auth", authRoutes);
app.route("/earnings", earningsRoutes);
app.route("/split-configs", splitConfigsRoutes);

export type AppType = typeof app;
export type DbType = typeof db;
export { app };
export default { port: process.env.PORT || 3000, fetch: app.fetch };
