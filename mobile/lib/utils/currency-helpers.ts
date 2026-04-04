import {
  currencySymbol,
  type SupportedCurrencyCode,
} from "@/constants/currency";
import { DEFAULT_BASE_CURRENCY } from "@/constants/currency-context";
import type {
  CurrencyRatesByBase,
  PersistedCurrencyState,
} from "@/types/currency-context.types";

export function defaultCurrencyState(): PersistedCurrencyState {
  return {
    selectedCurrency: DEFAULT_BASE_CURRENCY,
    baseCurrency: DEFAULT_BASE_CURRENCY,
    initialDecisionMade: false,
  };
}

export function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatAmount(
  value: number,
  currencyCode: SupportedCurrencyCode,
): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  try {
    const number = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absolute);

    return `${sign}${currencySymbol(currencyCode)}${number}`;
  } catch {
    return `${sign}${currencySymbol(currencyCode)}${absolute.toFixed(2)}`;
  }
}

export function normalizeRates(
  rates: Record<string, unknown>,
  baseCurrency: SupportedCurrencyCode,
): Record<string, number> {
  const normalized: Record<string, number> = { [baseCurrency]: 1 };

  Object.entries(rates).forEach(([code, rate]) => {
    const numericRate = typeof rate === "number" ? rate : Number(rate);

    if (!Number.isFinite(numericRate) || numericRate <= 0) {
      return;
    }

    normalized[code.toUpperCase()] = numericRate;
  });

  return normalized;
}

export function resolveConversionRate(
  state: PersistedCurrencyState,
  activeCurrency: SupportedCurrencyCode,
  ratesByBase: CurrencyRatesByBase,
): number {
  if (!state.initialDecisionMade || activeCurrency === state.baseCurrency) {
    return 1;
  }

  const rates = ratesByBase[state.baseCurrency];
  const rate = rates?.[activeCurrency];

  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    return 1;
  }

  return rate;
}
