import { Hono } from "hono";
import { createUserProfile } from "../services/auth.service";

const authRoutes = new Hono();

authRoutes.post("/create-user", async (c) => {
  try {
    const { access_token } = await c.req.json();

    if (!access_token) {
      return c.json({ error: "Missing access token" }, 400);
    }

    const user = await createUserProfile(access_token);
    return c.json({ success: true, user });
  } catch (error: any) {
    console.error("[AuthRoute] Error:", error);

    if (error.message.includes("Invalid")) {
      return c.json({ error: error.message }, 401);
    }

    return c.json({ error: error.message || "Failed to create user" }, 500);
  }
});

export { authRoutes };
