import type { SupportedCurrencyCode } from "./currency";

export type CurrencyRateProviderId =
  | "open-er-api"
  | "frankfurter"
  | "currency-api-pages";

export type CurrencyRateProvider = {
  id: CurrencyRateProviderId;
  name: string;
  endpointTemplate: string;
};

export const CURRENCY_RATE_PROVIDERS: CurrencyRateProvider[] = [
  {
    id: "open-er-api",
    name: "Open ER API",
    endpointTemplate: "https://open.er-api.com/v6/latest/{base}",
  },
  {
    id: "frankfurter",
    name: "Frankfurter",
    endpointTemplate: "https://api.frankfurter.app/latest?from={base}",
  },
  {
    id: "currency-api-pages",
    name: "Currency API (pages.dev)",
    endpointTemplate:
      "https://latest.currency-api.pages.dev/v1/currencies/{baseLower}.json",
  },
];

export const CURRENCY_RATE_PROVIDER_TIMEOUT_MS = 4500;

export function providerEndpoint(
  endpointTemplate: string,
  baseCurrency: SupportedCurrencyCode,
): string {
  return endpointTemplate
    .replace("{base}", encodeURIComponent(baseCurrency))
    .replace("{baseLower}", encodeURIComponent(baseCurrency.toLowerCase()));
}
