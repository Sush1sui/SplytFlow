import * as SecureStore from "expo-secure-store";
import { apiFetcher, ApiError } from "./api-fetcher";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import type { RefreshResponse } from "../types/auth";

// SecureStore key for the session token. Must be non-empty and may contain only
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

let refreshInFlight: Promise<string | null> | null = null;

const isAuthStatusError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 401 || error.status === 403;
  }

  const message = error instanceof Error ? error.message : "";
  return /API Error: (401|403)\b/.test(message);
};

const setAuthHeaders = (token: string, options?: RequestInit): HeadersInit => ({
  ...options?.headers,
  Authorization: `Bearer ${token}`,
});

const clearStoredTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
};

const performSilentRefresh = async (): Promise<string | null> => {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const data = await apiFetcher<RefreshResponse>(
      `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      },
    );

    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, data.token),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, data.refreshToken),
    ]);

    return data.token;
  } catch {
    await clearStoredTokens();
    return null;
  }
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = performSilentRefresh().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

/**
 * Get the stored session token
 */
export async function getToken(): Promise<string | null> {
  if (!TOKEN_KEY) throw new Error("TOKEN_KEY is not defined");
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Make an authenticated API request with the stored token
 * @param endpoint - API endpoint (relative to base URL)
 * @param options - Fetch options
 * @returns Promise resolving to the parsed JSON response
 *
 * @example
 * ```tsx
 * const user = await authenticatedFetch<User>("/auth/me");
 *
 * const data = await authenticatedFetch<Response>("/api/protected", {
 *   method: "POST",
 *   body: JSON.stringify({ foo: "bar" })
 * });
 * ```
 */
export async function authenticatedFetch<T = any>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    return await apiFetcher<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: setAuthHeaders(token, options),
    });
  } catch (error) {
    if (!isAuthStatusError(error)) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw new Error("Session expired. Please sign in again.");
    }

    return apiFetcher<T>(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: setAuthHeaders(refreshedToken, options),
    });
  }
}

async function fetchTextWithToken(
  endpoint: string,
  token: string,
  options?: RequestInit,
) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: setAuthHeaders(token, options),
  });

  const bodyText = await response.text();

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, bodyText);
  }

  return bodyText;
}

export async function authenticatedFetchText(
  endpoint: string,
  options?: RequestInit,
): Promise<string> {
  const token = await getToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    return await fetchTextWithToken(endpoint, token, options);
  } catch (error) {
    if (!isAuthStatusError(error)) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      throw new Error("Session expired. Please sign in again.");
    }

    return fetchTextWithToken(endpoint, refreshedToken, options);
  }
}
