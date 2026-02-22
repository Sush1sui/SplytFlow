import { Hono } from "hono";
import { isSignedIn } from "../middleware/isSignedIn";
import * as authService from "../services/auth/service";
import type { AppVariables } from "../util/auth/types";
import { create as otpCreate, verify } from "../services/auth/db/otp/service";

const auth = new Hono<{ Variables: AppVariables }>();

// ─── Public Routes ────────────────────────────────────────────────

/**
 * POST /auth/signin
 * Body: { email, password }
 */
auth.post("/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const result = await authService.signin(email, password);
    return c.json(result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 401);
  }
});

/**
 * POST /auth/signup
 * Body: { firstName, lastName, email, password, confirmPassword }
 */
auth.post("/signup", async (c) => {
  try {
    const { firstName, lastName, email, password, confirmPassword } =
      await c.req.json();

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return c.json({ error: "All fields are required" }, 400);
    }

    const result = await authService.signup(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    );
    return c.json(result, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    if (message === "Email is already in use")
      return c.json({ error: message }, 409);
    return c.json({ error: message }, 400);
  }
});

/**
 * POST /auth/otp
 * Body: { email, purpose }
 * Generates an OTP for the given email and purpose (e.g. "signup", "password-reset").
 */
auth.post("/otp", async (c) => {
  try {
    const { email, purpose } = await c.req.json();

    if (!email || !purpose)
      return c.json({ error: "Email and purpose are required" }, 400);

    const otp = await otpCreate(email, purpose);

    if (!otp) return c.json({ error: "Failed to generate OTP" }, 500);

    return c.json({ message: "OTP generated successfully" }, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 400);
  }
});

/**
 * POST /auth/otp/verify
 * Body: { email, purpose, code }
 * Verifies the provided OTP for the given email and purpose.
 */
auth.post("/otp/verify", async (c) => {
  try {
    const { email, purpose, code } = await c.req.json();
    if (!email || !purpose || !code)
      return c.json({ error: "Email, purpose, and code are required" }, 400);

    // JSON numbers are valid – coerce to string to match the DB column type
    const isValid = await verify(email, String(code), purpose);
    if (!isValid) return c.json({ error: "Invalid or expired OTP" }, 400);

    return c.json({ message: "OTP verified successfully" }, 200);
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      400,
    );
  }
});

// ─── Semi-public Routes ──────────────────────────────────────────

/**
 * POST /auth/refresh
 * Body: { refreshToken }
 * Issues a new access token + rotated refresh token.
 */
auth.post("/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();

    if (!refreshToken) {
      return c.json({ error: "Refresh token is required" }, 400);
    }

    const result = await authService.refresh(refreshToken);
    return c.json(result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 401);
  }
});

// ─── Protected Routes (require valid JWT) ─────────────────────────

/**
 * GET /auth/me
 * Returns the currently authenticated user's profile.
 */
auth.get("/me", isSignedIn, async (c) => {
  try {
    const userId = c.get("userId") as string;
    const result = await authService.me(userId);
    return c.json(result, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 400);
  }
});

/**
 * POST /auth/logout
 * Revokes the current token (single-device logout).
 */
auth.post("/logout", isSignedIn, async (c) => {
  try {
    const userId = c.get("userId") as string;
    const jti = c.get("jti") as string;
    const tokenExp = c.get("tokenExp") as number;

    // refreshToken is optional — client should always send it for full cleanup
    const body = await c.req.json().catch(() => ({}));
    const refreshToken: string | undefined = body?.refreshToken;

    await authService.logoutSingle(jti, userId, tokenExp, refreshToken);
    return c.json({ message: "Logged out successfully" }, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 400);
  }
});

/**
 * POST /auth/logout-all
 * Invalidates all tokens for the current user (all-device logout).
 */
auth.post("/logout-all", isSignedIn, async (c) => {
  try {
    const userId = c.get("userId") as string;

    await authService.logoutAll(userId);
    return c.json({ message: "Logged out from all devices" }, 200);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return c.json({ error: message }, 400);
  }
});

export default auth;
