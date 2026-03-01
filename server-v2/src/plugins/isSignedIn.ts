import { Elysia } from "elysia";
import { verifyAccessToken } from "../utils/auth";

/**
 * Reusable Elysia plugin that verifies the Authorization Bearer token and
 * injects `userId`, `userEmail`, `jti`, and `tokenExp` into the request context.
 *
 * Use inside a `.guard()` block to scope it only to protected routes.
 */
export const isSignedIn = new Elysia({ name: "isSignedIn" }).derive(
  { as: "scoped" },
  async ({ headers, set }) => {
    const authorization = headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      set.status = 401;
      throw new Error(
        "Unauthorized – missing or malformed Authorization header",
      );
    }

    const token = authorization.slice(7);

    try {
      const payload = await verifyAccessToken(token);
      return {
        userId: payload.sub,
        userEmail: payload.email,
        jti: payload.jti,
        tokenExp: payload.exp,
      };
    } catch {
      set.status = 401;
      throw new Error("Invalid or expired access token");
    }
  },
);
