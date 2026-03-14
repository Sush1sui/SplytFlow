type RetryOptions = {
  retries?: number;
  delayMs?: number;
};

export function isTransientDbConnectionError(error: unknown) {
  const maybe = error as { code?: string; message?: string };
  const message = (maybe.message || "").toLowerCase();

  return (
    maybe.code === "ERR_POSTGRES_CONNECTION_TIMEOUT" ||
    message.includes("connection timeout") ||
    message.includes("connection terminated") ||
    message.includes("connection reset")
  );
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions,
) {
  const retries = options?.retries ?? 1;
  const delayMs = options?.delayMs ?? 350;

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const shouldRetry =
        attempt < retries && isTransientDbConnectionError(error);

      if (!shouldRetry) throw error;

      // Bun provides a built-in sleep utility for lightweight retry backoff.
      await Bun.sleep(delayMs * (attempt + 1));
    }
  }

  throw lastError;
}
