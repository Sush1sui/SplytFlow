import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/auth-context";
import { apiFetcher } from "../utils/api-fetcher";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { router } from "expo-router";
import type {
  UserProfile,
  RefreshResponse,
  MeResponse,
  LoginResponse,
} from "../types/auth";
import { requestOTP, verify } from "../utils/otp";
import { validateSignup } from "../utils/auth-validate";

// SecureStore keys. Must be non-empty and may contain only alphanumeric characters, '.', '-' and '_'.
const TOKEN_KEY =
  (process.env.TOKEN_KEY && process.env.TOKEN_KEY.trim()) ||
  "splytflow_session_token";

const REFRESH_TOKEN_KEY =
  (process.env.REFRESH_TOKEN_KEY && process.env.REFRESH_TOKEN_KEY.trim()) ||
  "splytflow_refresh_token";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On app startup, validate the stored session or silently refresh it
  useEffect(() => {
    checkExistingSession();
  }, []);

  /**
   * Exchange the stored refresh token for a new access + refresh token pair.
   * Persists the new tokens and returns the new access token, or null on failure.
   */
  const silentRefresh = async (): Promise<string | null> => {
    try {
      const storedRefreshToken =
        await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

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
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
      ]);

      return data.token;
    } catch {
      return null;
    }
  };

  const clearTokens = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
    setUser(null);
  };

  const checkExistingSession = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync(TOKEN_KEY);

      if (!token) return;

      // Try the stored access token first
      try {
        const data = await apiFetcher<MeResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setUser(data.user);
        return;
      } catch {
        // Access token expired or revoked — attempt silent refresh
      }

      const newToken = await silentRefresh();

      if (newToken) {
        const data = await apiFetcher<MeResponse>(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${newToken}` },
          },
        );
        setUser(data.user);
      } else {
        // Both tokens invalid — force the user to log in again
        await clearTokens();
      }
    } catch {
      await clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const data = await apiFetcher<LoginResponse>(
        `${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
      ]);

      setUser(data.user);
      router.replace("/");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (
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
        SecureStore.setItemAsync(TOKEN_KEY, data.token),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
      ]);

      // setUser(data.user);
      // router.replace("/");
      return data.user;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const OTP_signup = async (email: string) => {
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
  };

  const verifyOTP = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string,
    code: string,
  ): Promise<boolean> => {
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

      setUser(user);
      router.replace("/");
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const [token, refreshToken] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
      ]);

      if (token) {
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
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      await clearTokens();
      router.replace("/(auth)/sign-in");
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, OTP_signup, verifyOTP, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}
