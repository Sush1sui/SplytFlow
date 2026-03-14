import * as SecureStore from "expo-secure-store";
import { apiFetcher } from "./api-fetcher";
import { API_BASE_URL } from "@/constants/api";

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

  return apiFetcher<T>(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
