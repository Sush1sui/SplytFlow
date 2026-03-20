import type {
  AuthResponse,
  AuthUser,
  IssuedTokenPair,
  UserProfile,
} from "./model";

export function formatUserProfile(user: AuthUser): UserProfile {
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

export function toAuthResponse(
  message: string,
  user: AuthUser,
  tokens: IssuedTokenPair,
): AuthResponse {
  return {
    message,
    user: formatUserProfile(user),
    token: tokens.token,
    expiresAt: tokens.expiresAt.toISOString(),
    refreshToken: tokens.refreshToken,
    refreshTokenExpiresAt: tokens.refreshTokenExpiresAt.toISOString(),
  };
}
