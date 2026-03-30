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
  login: (email: string, password: string) => Promise<boolean>;
  OTP_signup: (email: string) => Promise<boolean>;
  verifyOTP: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (
    firstName: string,
    lastName: string,
    email: string,
  ) => Promise<void>;
  updatePassword: (
    oldPassword: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  loading: boolean;
};

export type AuthState = Pick<AuthContext, "user" | "loading">;

export type AuthActions = Pick<
  AuthContext,
  "login" | "OTP_signup" | "verifyOTP" | "logout" | "updateProfile" | "updatePassword"
>;

export type SignUpParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code?: string;
  purpose?: "signup" | "password-reset";
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

export interface UpdateProfileResponse {
  user: UserProfile;
}

export interface RefreshResponse {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
