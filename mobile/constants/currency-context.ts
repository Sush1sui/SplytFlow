import type { SupportedCurrencyCode } from "./currency";

export const CURRENCY_STORAGE_KEY = "splytflow_currency_settings_v1";
export const DEFAULT_BASE_CURRENCY: SupportedCurrencyCode = "PHP";
export const RATES_UNAVAILABLE_ERROR = "RATES_UNAVAILABLE_ERROR";

export const CONVERSION_RATE_UNAVAILABLE_MESSAGE =
  "Conversion rate unavailable. Try again shortly.";

export const PROVIDERS_UNAVAILABLE_MESSAGE =
  "All free currency providers are unavailable right now. Please try again in a moment.";

export const UPDATE_CURRENCY_FAILED_MESSAGE =
  "Could not update currency setting. Please try again.";
