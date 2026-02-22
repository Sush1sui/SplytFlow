export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthContext = {
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

export interface LoginResponse {
  message: string;
  user: UserProfile;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export interface MeResponse {
  user: UserProfile;
}

export interface RefreshResponse {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
