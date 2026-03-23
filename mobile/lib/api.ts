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
export class ApiError extends Error {
  status: number;
  statusText: string;
  body: unknown;

  constructor(status: number, statusText: string, body: unknown) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

export type ApiFetcherOptions = RequestInit & {
  includeStatus?: boolean;
};

export type ApiFetcherResult<T> = {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  rawBody: unknown;
};

export function apiFetcher<T = any>(
  url: string,
  options: ApiFetcherOptions & { includeStatus: true },
): Promise<ApiFetcherResult<T>>;

export function apiFetcher<T = any>(
  url: string,
  options?: ApiFetcherOptions & { includeStatus?: false | undefined },
): Promise<T>;

export async function apiFetcher<T = any>(
  url: string,
  options?: ApiFetcherOptions,
): Promise<T | ApiFetcherResult<T>> {
  const { includeStatus, ...fetchOptions } = options ?? {};

  const response = await fetch(url, fetchOptions as RequestInit);
  const contentType = response.headers.get("content-type") || "";

  const parseBody = async (): Promise<unknown> => {
    if (response.status === 204) return null;

    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch {
        return null;
      }
    }

    try {
      return await response.text();
    } catch {
      return null;
    }
  };

  const body = await parseBody();

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, body);
  }

  if (includeStatus) {
    return {
      data: body as T,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      rawBody: body,
    } as ApiFetcherResult<T>;
  }

  return body as T;
}
