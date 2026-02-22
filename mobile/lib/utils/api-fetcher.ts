/**
 * A flexible API utility function that makes HTTP requests and returns typed responses
 * @template T The type of data returned by the API
 * @param url The URL to fetch
 * @param options Standard fetch options (method, headers, body, etc.)
 * @returns Promise resolving to the parsed JSON response
 *
 * @example
 * ```tsx
 * interface User { id: string; name: string; }
 *
 * const user = await apiFetcher<User>("/api/users/123", {
 *   method: "GET"
 * });
 *
 * const newUser = await apiFetcher<User>("/api/users", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify({ name: "John" })
 * });
 * ```
 */
export async function apiFetcher<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data as T;
}
