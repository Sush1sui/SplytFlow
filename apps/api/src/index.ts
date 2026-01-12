import { Hono } from "hono";
import { cors } from "hono/cors";
import { db } from "@splytflow/db";
import { authRoutes } from "./routes/auth.route";
import { earningsRoutes } from "./routes/earnings.route";
import { splitConfigsRoutes } from "./routes/splitConfigs.route";

const app = new Hono();

// Enable CORS for mobile app
app.use(
  "/*",
  cors({
    origin: "*", // In production, set this to your specific domain
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "X-User-Id"],
  })
);

app.route("/auth", authRoutes);
app.route("/earnings", earningsRoutes);
app.route("/split-configs", splitConfigsRoutes);

export type AppType = typeof app;
export type DbType = typeof db;
export { app };
export default { port: process.env.PORT || 3000, fetch: app.fetch };
