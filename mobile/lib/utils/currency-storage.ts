import * as SecureStore from "expo-secure-store";
import { isSupportedCurrency } from "@/constants/currency";
import {
  CURRENCY_STORAGE_KEY,
  DEFAULT_BASE_CURRENCY,
} from "@/constants/currency-context";
import type { PersistedCurrencyState } from "@/types/currency-context.types";
import {
  defaultCurrencyState,
  resolveDeviceCurrency,
} from "./currency-helpers";

export async function loadPersistedCurrencyState(): Promise<PersistedCurrencyState> {
  const raw = await SecureStore.getItemAsync(CURRENCY_STORAGE_KEY);

  if (!raw) {
    return defaultCurrencyState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedCurrencyState>;

    return {
      selectedCurrency: isSupportedCurrency(parsed.selectedCurrency)
        ? parsed.selectedCurrency
        : resolveDeviceCurrency(),
      baseCurrency: isSupportedCurrency(parsed.baseCurrency)
        ? parsed.baseCurrency
        : DEFAULT_BASE_CURRENCY,
      initialDecisionMade: Boolean(parsed.initialDecisionMade),
    };
  } catch {
    return defaultCurrencyState();
  }
}

export async function persistCurrencyState(
  state: PersistedCurrencyState,
): Promise<void> {
  await SecureStore.setItemAsync(CURRENCY_STORAGE_KEY, JSON.stringify(state));
}
