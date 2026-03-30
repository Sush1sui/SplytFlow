import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthActionsContext, AuthStateContext } from "../context/auth-context";
import { apiFetcher, ApiError } from "../api";
import { API_ENDPOINTS, API_BASE_URL } from "@/constants/api";
import { router } from "expo-router";
import type {
  UserProfile,
  LoginResponse,
  MeResponse,
  RefreshResponse,
  AuthActions,
  AuthState,
} from "@/types/auth.types";
import { requestOTP, verify } from "../utils/otp";
import { validateSignup } from "../utils/auth-validate";

// SecureStore keys. Must be non-empty and may contain only
// alphanumeric characters, '.', '-' and '_'. Expo inlines EXPO_PUBLIC_*
// variables at build time from your .env file.
const TOKEN_KEY =
  process.env.EXPO_PUBLIC_TOKEN_KEY && process.env.EXPO_PUBLIC_TOKEN_KEY.trim();
if (!TOKEN_KEY) {
  throw new Error(
    "EXPO_PUBLIC_TOKEN_KEY environment variable is required and cannot be empty",
  );
}

const REFRESH_TOKEN_KEY =
  process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY &&
  process.env.EXPO_PUBLIC_REFRESH_TOKEN_KEY.trim();
if (!REFRESH_TOKEN_KEY) {
  throw new Error(
    "EXPO_PUBLIC_REFRESH_TOKEN_KEY environment variable is required and cannot be empty",
  );
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);

  const setUserSafe = useCallback((nextUser: UserProfile | null) => {
    if (isMountedRef.current) {
      setUser(nextUser);
    }
  }, []);

  const setLoadingSafe = useCallback((nextLoading: boolean) => {
    if (isMountedRef.current) {
      setLoading(nextLoading);
    }
  }, []);

  /**
   * Exchange the stored refresh token for a new access + refresh token pair.
   * Persists the new tokens and returns the new access token, or null on failure.
   */
  const silentRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync(
        REFRESH_TOKEN_KEY!,
      );

      if (!storedRefreshToken) return null;

      const data = await apiFetcher<RefreshResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: storedRefreshToken }),
        },
      );

      // Persist the rotated tokens
      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY!, data.token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY!, data.refreshToken),
      ]);

      return data.token;
    } catch {
      return null;
    }
  }, []);

  const clearTokens = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY!),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY!),
    ]);
    setUserSafe(null);
  }, [setUserSafe]);

  const checkExistingSession = useCallback(async () => {
    try {
      setLoadingSafe(true);
      const token = await SecureStore.getItemAsync(TOKEN_KEY!);

      if (!token) return;

      // Try the stored access token first
      try {
        const response = await apiFetcher<MeResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            includeStatus: true,
          },
        );

        setUserSafe(response.data.user);
        return;
      } catch (error) {
        if (error instanceof ApiError && error.status !== 401) {
          // non-auth errors should clear session immediately
          throw error;
        }
        // Access token expired or revoked (401) — attempt silent refresh
      }

      const newToken = await silentRefresh();

      if (newToken) {
        const response = await apiFetcher<MeResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${newToken}` },
            includeStatus: true,
          },
        );
        setUserSafe(response.data.user);
      } else {
        // Both tokens invalid — force the user to log in again
        await clearTokens();
      }
    } catch {
      await clearTokens();
    } finally {
      setLoadingSafe(false);
    }
  }, [clearTokens, setLoadingSafe, setUserSafe, silentRefresh]);

  // On app startup, validate the stored session or silently refresh it
  useEffect(() => {
    checkExistingSession();

    return () => {
      isMountedRef.current = false;
    };
  }, [checkExistingSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await apiFetcher<LoginResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            includeStatus: true,
          },
        );

        if (response.status === 401) {
          throw new Error("Invalid email or password. Please try again.");
        }

        const { data } = response;

        await Promise.all([
          SecureStore.setItemAsync(TOKEN_KEY!, data.token),
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY!, data.refreshToken),
        ]);

        if (!data.user) throw new Error("Login failed. Please try again.");

        setUserSafe(data.user);
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [setUserSafe],
  );

  const signup = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) => {
      const errors = validateSignup(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      );

      if (errors.length > 0) {
        throw new Error(errors.join("\n"));
      }

      try {
        const data = await apiFetcher<LoginResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.SIGNUP}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName,
              lastName,
              email,
              password,
              confirmPassword,
            }),
          },
        );

        await Promise.all([
          SecureStore.setItemAsync(TOKEN_KEY!, data.token),
          SecureStore.setItemAsync(REFRESH_TOKEN_KEY!, data.refreshToken),
        ]);
        return data.user;
      } catch (error) {
        console.error("Signup failed:", error);
        throw error;
      }
    },
    [],
  );

  const OTP_signup = useCallback(async (email: string) => {
    try {
      const success = await requestOTP(email);
      if (!success) {
        throw new Error("Failed to send OTP. Please try again.");
      }

      return true;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  const verifyOTP = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
      code: string,
    ) => {
      try {
        const success = await verify(email, code);
        if (!success) {
          throw new Error(
            "OTP verification failed. Please check the code and try again.",
          );
        }

        const user = await signup(
          firstName,
          lastName,
          email,
          password,
          confirmPassword,
        );

        if (!user) throw new Error("Signup failed. Please try again.");

        setUserSafe(user);
        return true;
      } catch (error) {
        console.error("OTP verification failed:", error);
        throw error;
      }
    },
    [signup, setUserSafe],
  );

  const logout = useCallback(async () => {
    try {
      let [token, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY!),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY!),
      ]);

      if (token) {
        try {
          await apiFetcher(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refreshToken: refreshToken ?? undefined,
            }),
          });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            // Access token already expired — attempt a silent refresh so we
            // can send the server a valid token to blacklist the refresh token.
            const newToken = await silentRefresh();
            if (newToken) {
              refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY!);
              try {
                await apiFetcher(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${newToken}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    refreshToken: refreshToken ?? undefined,
                  }),
                });
              } catch {
                // Server-side logout failed after refresh — local cleanup is
                // sufficient; don't surface this as an error.
              }
            }
            // If silentRefresh also fails the refresh token is already invalid,
            // so there is nothing left to revoke on the server.
          } else {
            // Unexpected non-auth error — log it but still clear the session.
            console.error("Logout failed:", error);
          }
        }
      }
    } finally {
      await clearTokens();
      router.replace("/(auth)/signin");
    }
  }, [clearTokens, silentRefresh]);

  const authStateValue = useMemo<AuthState>(
    () => ({ user, loading }),
    [user, loading],
  );

  const authActionsValue = useMemo<AuthActions>(
    () => ({ login, OTP_signup, verifyOTP, logout }),
    [login, OTP_signup, verifyOTP, logout],
  );

  return (
    <AuthActionsContext.Provider value={authActionsValue}>
      <AuthStateContext.Provider value={authStateValue}>
        {children}
      </AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  );
}
