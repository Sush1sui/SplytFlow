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
