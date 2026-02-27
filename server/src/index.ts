import { Hono } from "hono";

// Import routes
import auth from "./routes/auth";
import split from "./routes/split";
import sales from "./routes/sales";

import { runJobs } from "./util/util";
import { runCleanup } from "./services/db/otp/service";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello SplytFlow!");
});

// ─── Routes ───────────────────────────────────────────────────────
app.route("/auth", auth);
app.route("/split", split);
app.route("/sales", sales);

// ─── Error Handling ───────────────────────────────────────────────
app.onError((err, c) => {
  console.error(
    "Unexpected error:",
    err instanceof Error ? err : new Error("An unknown error occurred"),
  );
  return c.json({ error: "Internal Server Error" }, 500);
});

// ─── Run Jobs ───────────────────────────────────────────────────────
runJobs([
  runCleanup, // Start OTP cleanup job
]);

export default {
  port: 3000,
  fetch: app.fetch,
};
