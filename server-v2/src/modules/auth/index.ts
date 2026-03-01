import { Elysia } from "elysia";
import {
  me,
  refresh,
  signin,
  signup,
  logoutSingle,
  logoutAll,
} from "./service";
import {
  LogoutSingleBody,
  RefreshTokenBody,
  SignInBody,
  SignUpBody,
} from "./model";
import { validateSignup } from "../../utils/auth";
import { isSignedIn } from "../../plugins/isSignedIn";

const auth = new Elysia({ prefix: "/api/auth" })
  /**
   * POST /auth/signin
   * Body: { email, password }
   * Response: { token, user }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields)
   * - 401: Invalid credentials
   * - 500: Server error
   */
  .post("/signin", async ({ body, set }) => {
    try {
      const { email, password } = body as SignInBody;

      if (!email || !password) {
        set.status = 400;
        return { error: "Email and password are required" };
      }

      const result = await signin(email, password);

      set.status = 200;
      return result;
    } catch (error) {
      set.status = 500;
      return {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      };
    }
  })
  /**
   * POST /auth/signup
   * Body: { firstName, lastName, email, password, confirmPassword }
   * Response: { token, user }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, password mismatch, weak password)
   * - 409: Email already in use
   * - 500: Server error
   */
  .post("/signup", async ({ body, set }) => {
    try {
      const { firstName, lastName, email, password, confirmPassword } =
        body as SignUpBody;

      const errors = validateSignup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      );
      if (errors.length > 0) {
        set.status = 400;
        return { error: "Invalid signup data", errors };
      }

      const result = await signup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      );

      set.status = 201;
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      if (message === "Email is already in use") {
        set.status = 409;
        return { error: message };
      }
      set.status = 500;
      return { error: message };
    }
  })
  // ─── Semi-public Routes ──────────────────────────────────────────
  /**
   * POST /auth/refresh
   * Body: { refreshToken }
   * Response: { token, user }
   * Possible errors:
   * - 400: Missing refresh token
   * - 401: Invalid refresh token
   */
  .post("/refresh", async ({ body, set }) => {
    try {
      const { refreshToken } = body as RefreshTokenBody;

      if (!refreshToken) {
        set.status = 400;
        return { error: "Refresh token is required" };
      }

      const result = await refresh(refreshToken);

      if (!result || "error" in result) {
        set.status = 401;
        return { error: "Invalid refresh token" };
      }

      set.status = 200;
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 401;
      return { error: message };
    }
  })
  // ─── Protected Routes ───────────────────────────────────────────
  .guard({}, (app) =>
    app
      .use(isSignedIn)
      /**
       * GET /auth/me
       * Response: { user }
       */
      .get("/me", async ({ userId, set }) => {
        try {
          const result = await me(userId);
          set.status = 200;
          return result;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          set.status = 400;
          return { error: message };
        }
      })
      /**
       * POST /auth/logout
       * Body: { refreshToken? }
       * Response: { message }
       * Possible errors:
       * - 400: Invalid refresh token (if provided)
       */
      .post("/logout", async ({ userId, jti, tokenExp, body, set }) => {
        try {
          const refreshToken = (body as LogoutSingleBody)?.refreshToken;
          await logoutSingle(jti, userId, tokenExp, refreshToken);
          set.status = 200;
          return { message: "Logged out successfully" };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          set.status = 400;
          return { error: message };
        }
      })
      /**
       * POST /auth/logout-all
       * Response: { message }
       * Possible errors:
       * - 400: Server error
       */
      .post("/logout-all", async ({ userId, set }) => {
        try {
          await logoutAll(userId);
          set.status = 200;
          return { message: "Logged out from all devices" };
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "An unknown error occurred";
          set.status = 400;
          return { error: message };
        }
      }),
  );

export default auth;
