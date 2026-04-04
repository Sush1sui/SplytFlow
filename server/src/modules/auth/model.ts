import { t } from "elysia";
import { AuthServiceError } from "./errors";

export type AppVariables = {
  userId: string;
  userEmail: string;
  jti: string;
  tokenExp: number;
};

export interface JWTPayload {
  sub: string; // user id
  email: string;
  tokenVersion: number;
  jti: string; // unique token id for revocation
  exp: number;
  iat: number;
}

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  message: string;
  user: UserProfile;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type SignInBody = {
  email: string;
  password: string;
};

export type SignUpBody = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RefreshTokenBody = {
  refreshToken: string;
};

export type LogoutSingleBody = {
  refreshToken?: string;
};

export type AuthServiceErrorCode =
  | "invalid_input"
  | "invalid_credentials"
  | "unauthorized"
  | "conflict"
  | "not_found";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AuthUserWithPassword = AuthUser & {
  password: string;
};

export type IssuedTokenPair = {
  token: string;
  expiresAt: Date;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export type RefreshTokenUser = {
  id: string;
  email: string;
  tokenVersion: number;
};

export type RefreshTokenRecord = {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  user: RefreshTokenUser;
};

export type ConsumedRefreshTokenRecord = {
  userId: string;
  expiresAt: Date;
};

export const authSchemas = {
  signInBody: t.Object({
    email: t.String(),
    password: t.String(),
  }),
  signUpBody: t.Object({
    firstName: t.String(),
    lastName: t.String(),
    email: t.String(),
    password: t.String(),
    confirmPassword: t.String(),
  }),
  refreshBody: t.Object({
    refreshToken: t.String(),
  }),
  logoutBody: t.Object({
    refreshToken: t.Optional(t.String()),
  }),
  updateProfileBody: t.Object({
    firstName: t.String(),
    lastName: t.String(),
    email: t.String(),
  }),
  updatePasswordBody: t.Object({
    oldPassword: t.String(),
    password: t.String(),
    confirmPassword: t.String(),
  }),
  resetPasswordBody: t.Object({
    resetToken: t.String(),
    password: t.String(),
    confirmPassword: t.String(),
  }),
};

export function authErrorPayload(error: unknown) {
  if (error instanceof AuthServiceError) {
    if (error.details && error.details.length > 0) {
      return { error: error.message, errors: error.details };
    }

    return { error: error.message };
  }

  return {
    error: error instanceof Error ? error.message : "An unknown error occurred",
  };
}

export function authErrorStatus(error: unknown) {
  if (!(error instanceof AuthServiceError)) {
    return 500;
  }

  if (error.code === "invalid_input") {
    return 400;
  }

  if (error.code === "invalid_credentials" || error.code === "unauthorized") {
    return 401;
  }

  if (error.code === "conflict") {
    return 409;
  }

  if (error.code === "not_found") {
    return 404;
  }

  return 500;
}
