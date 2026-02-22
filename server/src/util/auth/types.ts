/** Hono context variables set by the isSignedIn middleware */
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
  [key: string]: unknown; // required by hono/jwt
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

export interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}
