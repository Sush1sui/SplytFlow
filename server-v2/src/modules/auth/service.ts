import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../../utils/auth";
import { db } from "../../db";
import { users, refreshTokens } from "../../db/schema";
import { eq, sql } from "drizzle-orm";
import type { AuthResponse, UserProfile } from "./model";
import { create, findByEmailAndPassword } from "../../utils/db/auth";

function formatUserProfile(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): UserProfile {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePictureUrl: null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

async function issueTokenPair(
  userId: string,
  email: string,
  tokenVersion: number,
): Promise<{
  token: string;
  expiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}> {
  const { token, expiresAt } = await signAccessToken(
    userId,
    email,
    tokenVersion,
  );

  const { rawToken, tokenHash } = generateRefreshToken();
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await db
    .insert(refreshTokens)
    .values({ tokenHash, userId, expiresAt: refreshTokenExpiresAt });

  return { token, expiresAt, refreshToken: rawToken, refreshTokenExpiresAt };
}

// NOTE: Bun.password.hash/verify are CPU‑intensive and may block the
// event loop under heavy concurrency.  In production you should
// either introduce rate‑limiting on the /auth routes or delegate the
// hashing work to a worker thread. A very simple approach is to keep a
// small in‑memory token bucket per IP.
export async function signin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const user = await findByEmailAndPassword(email, password);

    const { token, expiresAt, refreshToken, refreshTokenExpiresAt } =
      await issueTokenPair(user.id, user.email, user.tokenVersion);

    return {
      message: "signin successful",
      user: formatUserProfile(user),
      token,
      expiresAt: expiresAt.toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function signup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthResponse> {
  try {
    const user = await create(
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
    );

    if (!user) throw new Error("Failed to create user");

    const { token, expiresAt, refreshToken, refreshTokenExpiresAt } =
      await issueTokenPair(user.id, user.email, user.tokenVersion);

    return {
      message: "Signup successful",
      user: formatUserProfile(user),
      token,
      expiresAt: expiresAt.toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function me(userId: string): Promise<{ user: UserProfile }> {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) throw new Error("User not found");

    return { user: formatUserProfile(user) };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function refresh(rawRefreshToken: string): Promise<{
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}> {
  try {
    const tokenHash = hashRefreshToken(rawRefreshToken);

    const [stored] = await db
      .select({
        id: refreshTokens.id,
        tokenHash: refreshTokens.tokenHash,
        expiresAt: refreshTokens.expiresAt,
        user: {
          id: users.id,
          email: users.email,
          tokenVersion: users.tokenVersion,
        },
      })
      .from(refreshTokens)
      .innerJoin(users, eq(refreshTokens.userId, users.id))
      .where(eq(refreshTokens.tokenHash, tokenHash));

    if (!stored) throw new Error("Invalid refresh token");
    if (stored.expiresAt < new Date()) {
      // Clean up the expired token
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash));
      throw new Error("Refresh token has expired, please log in again");
    }

    // Token rotation — delete old refresh token and issue a fresh pair
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash));

    const { token, expiresAt, refreshToken, refreshTokenExpiresAt } =
      await issueTokenPair(
        stored.user.id,
        stored.user.email,
        stored.user.tokenVersion,
      );

    return {
      token,
      expiresAt: expiresAt.toISOString(),
      refreshToken,
      refreshTokenExpiresAt: refreshTokenExpiresAt.toISOString(),
    };
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error("An unknown error occurred");
  }
}

export async function logoutSingle(
  _jti: string,
  _userId: string,
  _tokenExp: number,
  rawRefreshToken?: string,
): Promise<void> {
  try {
    if (rawRefreshToken) {
      const tokenHash = hashRefreshToken(rawRefreshToken);
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.tokenHash, tokenHash))
        .catch(() => {}); // ignore if already gone
    }
  } catch {
    throw new Error("Failed to revoke token");
  }
}

export async function logoutAll(userId: string): Promise<void> {
  try {
    await Promise.all([
      // Bump tokenVersion to invalidate all access tokens
      db
        .update(users)
        .set({ tokenVersion: sql`${users.tokenVersion} + 1` })
        .where(eq(users.id, userId)),
      // Delete all refresh tokens for this user
      db.delete(refreshTokens).where(eq(refreshTokens.userId, userId)),
    ]);
  } catch {
    throw new Error("Failed to invalidate all tokens");
  }
}
