const DEFAULT_SELF_PING_INTERVAL_MINUTES = 10;
const DEFAULT_SELF_PING_TIMEOUT_MS = 8_000;

function isSelfPingEnabled(): boolean {
  const raw = process.env.SELF_PING_ENABLED?.trim().toLowerCase();

  if (!raw) {
    return true;
  }

  return raw !== "false" && raw !== "0" && raw !== "off";
}

function parseIntervalMinutes(defaultValue: number): number {
  const raw = process.env.SELF_PING_INTERVAL_MINUTES?.trim();

  if (!raw) {
    return defaultValue;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue;
  }

  return parsed;
}

function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function resolveSelfPingBaseUrl(): string | null {
  const explicitUrl = process.env.SELF_PING_URL?.trim();
  if (explicitUrl) {
    return normalizeBaseUrl(explicitUrl);
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL?.trim();
  if (renderUrl) {
    return normalizeBaseUrl(renderUrl);
  }

  return null;
}

async function pingRoot(baseUrl: string): Promise<void> {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    DEFAULT_SELF_PING_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${baseUrl}/`, {
      method: "GET",
      signal: controller.signal,
      headers: {
        "user-agent": "splytflow-self-ping/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`Self ping returned status ${response.status}`);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function runSelfPing(
  minuteInterval = DEFAULT_SELF_PING_INTERVAL_MINUTES,
): Promise<void> {
  if (!isSelfPingEnabled()) {
    console.log("Self ping disabled by SELF_PING_ENABLED");
    return;
  }

  const baseUrl = resolveSelfPingBaseUrl();
  if (!baseUrl) {
    console.log(
      "Self ping disabled (set SELF_PING_URL or RENDER_EXTERNAL_URL to enable)",
    );
    return;
  }

  const intervalMinutes = parseIntervalMinutes(minuteInterval);

  // Validate connectivity once on startup, then keep pinging at interval.
  await pingRoot(baseUrl).catch((error) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`Initial self ping failed: ${message}`);
  });

  setInterval(
    () => {
      void pingRoot(baseUrl).catch((error) => {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Self ping failed: ${message}`);
      });
    },
    60 * 1000 * intervalMinutes,
  );

  console.log(
    `Self ping enabled for ${baseUrl}/ every ${intervalMinutes} minute(s)`,
  );
}
