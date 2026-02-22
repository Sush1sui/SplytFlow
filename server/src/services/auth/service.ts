import * as userService from "./db/user/service";
import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../../util/auth/jwt";
import dbClient from "../../db/dbClient";
import type { UserProfile, AuthResponse } from "../../util/auth/types";

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

  await dbClient.refreshToken.create({
    data: { tokenHash, userId, expiresAt: refreshTokenExpiresAt },
  });

  return { token, expiresAt, refreshToken: rawToken, refreshTokenExpiresAt };
}

export async function signin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  try {
    const user = await userService.findByEmailAndPassword(email, password);

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
    const user = await userService.create(
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
    const user = await dbClient.user.findUnique({ where: { id: userId } });

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

    const stored = await dbClient.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) throw new Error("Invalid refresh token");
    if (stored.expiresAt < new Date()) {
      // Clean up the expired token
      await dbClient.refreshToken.delete({ where: { tokenHash } });
      throw new Error("Refresh token has expired, please log in again");
    }

    // Token rotation — delete old refresh token and issue a fresh pair
    await dbClient.refreshToken.delete({ where: { tokenHash } });

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
      await dbClient.refreshToken
        .delete({ where: { tokenHash } })
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
      dbClient.user.update({
        where: { id: userId },
        data: { tokenVersion: { increment: 1 } },
      }),
      // Delete all refresh tokens for this user
      dbClient.refreshToken.deleteMany({ where: { userId } }),
    ]);
  } catch {
    throw new Error("Failed to invalidate all tokens");
  }
}
