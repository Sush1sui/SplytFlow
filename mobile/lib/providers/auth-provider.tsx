import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { AuthContext, UserProfile } from "../context/auth-context";
import { apiFetcher } from "../utils/api-fetcher";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { router } from "expo-router";

// SecureStore keys. Must be non-empty and may contain only alphanumeric
// characters, '.', '-' and '_'.
const TOKEN_KEY =
  (process.env.TOKEN_KEY && process.env.TOKEN_KEY.trim()) ||
  "splytflow_session_token";

const REFRESH_TOKEN_KEY =
  (process.env.REFRESH_TOKEN_KEY && process.env.REFRESH_TOKEN_KEY.trim()) ||
  "splytflow_refresh_token";

interface LoginResponse {
  message: string;
  user: UserProfile;
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

interface MeResponse {
  user: UserProfile;
}

interface RefreshResponse {
  token: string;
  expiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

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

      setUser(data.user);
      router.replace("/");
    } catch (error) {
      console.error("Signup failed:", error);
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
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
