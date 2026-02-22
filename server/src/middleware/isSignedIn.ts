import { createMiddleware } from "hono/factory";
import { verifyAccessToken } from "../util/auth/jwt";
import dbClient from "../db/dbClient";
import type { AppVariables } from "../util/auth/types";

export const isSignedIn = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: missing token" }, 401);
    }

    const token = authHeader.slice(7);

    try {
      const payload = await verifyAccessToken(token);

      // Check token version against user record (logout-all invalidation)
      const user = await dbClient.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return c.json({ error: "Unauthorized: user not found" }, 401);
      }

      if (user.tokenVersion !== payload.tokenVersion) {
        return c.json({ error: "Unauthorized: token is no longer valid" }, 401);
      }

      // Attach user info to context for downstream handlers
      c.set("userId", user.id);
      c.set("userEmail", user.email);
      c.set("jti", payload.jti);
      c.set("tokenExp", payload.exp);

      await next();
    } catch {
      return c.json({ error: "Unauthorized: invalid token" }, 401);
    }
  },
);
