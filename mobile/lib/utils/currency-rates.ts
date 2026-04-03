import type { SupportedCurrencyCode } from "@/constants/currency";
import {
  CURRENCY_RATE_PROVIDER_TIMEOUT_MS,
  CURRENCY_RATE_PROVIDERS,
  providerEndpoint,
  type CurrencyRateProvider,
} from "@/constants/currency-api";
import { RATES_UNAVAILABLE_ERROR } from "@/constants/currency-context";
import type { CurrencyRateMap } from "@/types/currency-context.types";
import { normalizeRates } from "./currency-helpers";

type CurrencyRatesPayload = {
  result?: string;
  rates?: Record<string, unknown>;
  [key: string]: unknown;
};

async function fetchJsonWithTimeout(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    CURRENCY_RATE_PROVIDER_TIMEOUT_MS,
  );

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function extractRatesFromPayload(
  provider: CurrencyRateProvider,
  payload: unknown,
  baseCurrency: SupportedCurrencyCode,
): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as CurrencyRatesPayload;

  if (provider.id === "open-er-api") {
    if (data.result !== "success" || !data.rates) {
      return null;
    }

    return data.rates;
  }

  if (provider.id === "frankfurter") {
    return data.rates ?? null;
  }

  if (provider.id === "currency-api-pages") {
    const baseRates = data[baseCurrency.toLowerCase()];

    if (!baseRates || typeof baseRates !== "object") {
      return null;
    }

    return baseRates as Record<string, unknown>;
  }

  return null;
}

export async function fetchConversionRatesWithFallback(
  baseCurrency: SupportedCurrencyCode,
): Promise<CurrencyRateMap> {
  for (const provider of CURRENCY_RATE_PROVIDERS) {
    try {
      const endpoint = providerEndpoint(
        provider.endpointTemplate,
        baseCurrency,
      );
      const payload = await fetchJsonWithTimeout(endpoint);
      const providerRates = extractRatesFromPayload(
        provider,
        payload,
        baseCurrency,
      );

      if (!providerRates) {
        continue;
      }

      const normalized = normalizeRates(providerRates, baseCurrency);

      if (Object.keys(normalized).length > 1) {
        return normalized;
      }
    } catch {
      // Keep trying remaining free providers.
    }
  }

  throw new Error(RATES_UNAVAILABLE_ERROR);
}
