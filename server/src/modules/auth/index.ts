import { Elysia, t } from "elysia";
import {
  me,
  refresh,
  signin,
  signup,
  logoutSingle,
  logoutAll,
} from "./service";
import {
  SignInBody,
  SignUpBody,
  authSchemas,
  authErrorPayload,
  authErrorStatus,
} from "./model";
import { isSignedIn } from "../../plugins/isSignedIn";
import { checkRateLimit } from "../../utils/rate-limit";
import { getClientIp } from "../../utils/request";

// 5 attempts per 15 minutes per IP for CPU-heavy auth endpoints
const AUTH_RATE_LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };

const auth = new Elysia({ prefix: "/auth" })
  .onAfterHandle(({ set, path }) => {
    // LOGGER
    console.log(`< Response for ${path}: ${set.status}`);
  })
  /**
   * POST /auth/signin
   * Body: { email, password }
   * Response: { token, user }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields)
   * - 401: Invalid credentials
   * - 500: Server error
   */
  .post(
    "/signin",
    async ({ body, set, request }) => {
      try {
        const ip = getClientIp(request.headers);
        if (
          !checkRateLimit(
            `signin:${ip}`,
            AUTH_RATE_LIMIT.max,
            AUTH_RATE_LIMIT.windowMs,
          )
        ) {
          set.status = 429;
          return { error: "Too many requests. Please try again later." };
        }

        const { email, password } = body as SignInBody;

        if (!email || !password) {
          set.status = 400;
          return { error: "Email and password are required" };
        }

        const result = await signin(email, password);

        set.status = 200;
        return result;
      } catch (error) {
        set.status = authErrorStatus(error);
        return authErrorPayload(error);
      }
    },
    {
      body: authSchemas.signInBody,
    },
  )

  /**
   * POST /auth/signup
   * Body: { firstName, lastName, email, password, confirmPassword }
   * Response: { token, user }
   * Possible errors:
   * - 400: Invalid input (e.g. missing fields, password mismatch, weak password)
   * - 409: Email already in use
   * - 500: Server error
   */
  .post(
    "/signup",
    async ({ body, set, request }) => {
      try {
        const ip = getClientIp(request.headers);
        if (
          !checkRateLimit(
            `signup:${ip}`,
            AUTH_RATE_LIMIT.max,
            AUTH_RATE_LIMIT.windowMs,
          )
        ) {
          set.status = 429;
          return { error: "Too many requests. Please try again later." };
        }

        const { firstName, lastName, email, password, confirmPassword } =
          body as SignUpBody;

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
        set.status = authErrorStatus(error);
        return authErrorPayload(error);
      }
    },
    {
      body: authSchemas.signUpBody,
    },
  )

  // ─── Semi-public Routes ──────────────────────────────────────────
  /**
   * POST /auth/refresh
   * Body: { refreshToken }
   * Response: { token, user }
   * Possible errors:
   * - 400: Missing refresh token
   * - 401: Invalid refresh token
   */
  .post(
    "/refresh",
    async ({ body, set }) => {
      try {
        const { refreshToken } = body;

        if (!refreshToken) {
          set.status = 400;
          return { error: "Refresh token is required" };
        }

        const result = await refresh(refreshToken);
        set.status = 200;
        return result;
      } catch (error) {
        set.status = authErrorStatus(error);
        return authErrorPayload(error);
      }
    },
    {
      body: authSchemas.refreshBody,
    },
  )

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
          set.status = authErrorStatus(error);
          return authErrorPayload(error);
        }
      })

      /**
       * POST /auth/logout
       * Body: { refreshToken? }
       * Response: { message }
       * Possible errors:
       * - 400: Invalid refresh token (if provided)
       */
      .post(
        "/logout",
        async ({ userId, jti, tokenExp, body, set }) => {
          try {
            const refreshToken = body.refreshToken;
            await logoutSingle(jti, userId, tokenExp, refreshToken);
            set.status = 200;
            return { message: "Logged out successfully" };
          } catch (error) {
            set.status = authErrorStatus(error);
            return authErrorPayload(error);
          }
        },
        {
          body: authSchemas.logoutBody,
        },
      )

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
          set.status = authErrorStatus(error);
          return authErrorPayload(error);
        }
      }),
  );

export default auth;
