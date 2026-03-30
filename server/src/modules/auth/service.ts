import {
  signAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_EXPIRY_MS,
} from "../../utils/auth";
import type {
  AuthUser,
  AuthResponse,
  AuthUserWithPassword,
  IssuedTokenPair,
  UserProfile,
} from "./model";
import { AuthServiceError } from "./errors";
import { formatUserProfile, toAuthResponse } from "./mapper";
import {
  consumeRefreshTokenRecord,
  createRefreshTokenRecord,
  createUserRecord,
  deleteRefreshTokenRecord,
  findUserById,
  findUserByIdWithPassword,
  findUserWithPasswordByEmail,
  invalidateAllSessions,
} from "./repository";
import {
  assertSigninInput,
  assertSignupInput,
  normalizeEmail,
} from "./validators";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";

async function createUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthUser> {
  assertSignupInput(firstName, lastName, email, password, confirmPassword);
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await Bun.password.hash(password);

  return createUserRecord({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
  });
}

async function findUserByEmailAndPassword(
  email: string,
  password: string,
): Promise<AuthUserWithPassword> {
  assertSigninInput(email, password);
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserWithPasswordByEmail(normalizedEmail);

  if (!user) {
    throw new AuthServiceError(
      "invalid_credentials",
      "Invalid email or password",
    );
  }

  const passwordMatch = await Bun.password.verify(password, user.password);
  if (!passwordMatch) {
    throw new AuthServiceError(
      "invalid_credentials",
      "Invalid email or password",
    );
  }

  return user;
}

async function issueTokenPair(
  userId: string,
  email: string,
  tokenVersion: number,
): Promise<IssuedTokenPair> {
  const { token, expiresAt } = await signAccessToken(
    userId,
    email,
    tokenVersion,
  );

  const { rawToken, tokenHash } = generateRefreshToken();
  const refreshTokenExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await createRefreshTokenRecord(tokenHash, userId, refreshTokenExpiresAt);

  return { token, expiresAt, refreshToken: rawToken, refreshTokenExpiresAt };
}

export async function signin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const user = await findUserByEmailAndPassword(email, password);
  const tokens = await issueTokenPair(user.id, user.email, user.tokenVersion);

  return toAuthResponse("signin successful", user, tokens);
}

export async function signup(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  confirmPassword: string,
): Promise<AuthResponse> {
  const user = await createUser(
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  );
  const tokens = await issueTokenPair(user.id, user.email, user.tokenVersion);

  return toAuthResponse("Signup successful", user, tokens);
}

export async function me(userId: string): Promise<{ user: UserProfile }> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthServiceError("not_found", "User not found");
  }

  return { user: formatUserProfile(user) };
}

export async function refresh(rawRefreshToken: string): Promise<{
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}> {
  if (!rawRefreshToken) {
    throw new AuthServiceError("invalid_input", "Refresh token is required");
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  const consumed = await consumeRefreshTokenRecord(tokenHash);

  if (!consumed) {
    throw new AuthServiceError("unauthorized", "Invalid refresh token");
  }

  if (consumed.expiresAt < new Date()) {
    throw new AuthServiceError(
      "unauthorized",
      "Refresh token has expired, please log in again",
    );
  }

  const user = await findUserById(consumed.userId);
  if (!user) {
    throw new AuthServiceError("unauthorized", "Invalid refresh token");
  }

  const tokens = await issueTokenPair(user.id, user.email, user.tokenVersion);

  return {
    token: tokens.token,
    expiresAt: tokens.expiresAt.toISOString(),
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
  };
}

export async function logoutSingle(
  _jti: string,
  _userId: string,
  _tokenExp: number,
  rawRefreshToken?: string,
): Promise<void> {
  if (!rawRefreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(rawRefreshToken);
  await deleteRefreshTokenRecord(tokenHash);
}

export async function logoutAll(userId: string): Promise<void> {
  await invalidateAllSessions(userId);
}

export async function updateProfile(
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
): Promise<{ user: UserProfile }> {
  const user = await findUserById(userId);

  if (!user) {
    throw new AuthServiceError("not_found", "User not found");
  }

  const normalizedEmail = normalizeEmail(email);

  const [updated] = await db
    .update(users)
    .set({ firstName, lastName, email: normalizedEmail })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      tokenVersion: users.tokenVersion,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  if (!updated) {
    throw new AuthServiceError("not_found", "User not found after update");
  }

  return { user: formatUserProfile(updated) };
}

export async function updatePassword(
  userId: string,
  password: string,
  confirmPassword: string,
  type: "change" | "reset",
  oldPassword?: string,
) {
  if (!userId)
    throw new AuthServiceError("invalid_input", "User ID is required");

  if (password !== confirmPassword)
    throw new AuthServiceError("invalid_input", "Passwords do not match");

  if (type !== "change" && type !== "reset")
    throw new AuthServiceError("invalid_input", "Invalid password type");

  const user = await findUserByIdWithPassword(userId);
  if (!user) throw new AuthServiceError("not_found", "User not found");

  if (type === "change") {
    if (!oldPassword)
      throw new AuthServiceError(
        "invalid_input",
        "Old password is required for changing password",
      );

    const passwordMatch = await Bun.password.verify(oldPassword, user.password);
    if (!passwordMatch)
      throw new AuthServiceError("invalid_input", "Invalid old password");
  }

  const newPasswordHash = await Bun.password.hash(password);
  user.password = newPasswordHash;
  user.tokenVersion++;

  await db
    .update(users)
    .set({
      password: newPasswordHash,
      tokenVersion: user.tokenVersion,
    })
    .where(eq(users.id, userId));

  return {
    message: `Password ${type === "change" ? "changed" : "reset"} successfully`,
    user: formatUserProfile(user),
  };
}

export { AuthServiceError } from "./errors";
