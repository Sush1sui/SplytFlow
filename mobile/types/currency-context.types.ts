import type {
  CurrencyOption,
  SupportedCurrencyCode,
} from "@/constants/currency";

export type CurrencyDecisionMode = "convert" | "keep";

export type CurrencySelectionResult = {
  ok: boolean;
  error?: string;
};

export type PersistedCurrencyState = {
  selectedCurrency: SupportedCurrencyCode;
  baseCurrency: SupportedCurrencyCode;
  initialDecisionMade: boolean;
};

export type CurrencyRateMap = Record<string, number>;

export type CurrencyRatesByBase = Partial<
  Record<SupportedCurrencyCode, CurrencyRateMap>
>;

export type CurrencyContextValue = {
  isReady: boolean;
  isUpdating: boolean;
  activeCurrency: SupportedCurrencyCode;
  selectedCurrency: SupportedCurrencyCode;
  baseCurrency: SupportedCurrencyCode;
  initialDecisionNeeded: boolean;
  currencyOptions: CurrencyOption[];
  currencySymbol: string;
  currentCurrencyLabel: string;
  conversionRate: number;
  convertStoredToDisplay: (amount: number) => number;
  convertDisplayToStored: (amount: number) => number;
  formatStoredAmount: (amount: number) => string;
  formatDisplayAmount: (amount: number) => string;
  applyCurrencySelection: (
    nextCurrency: SupportedCurrencyCode,
    mode: CurrencyDecisionMode,
  ) => Promise<CurrencySelectionResult>;
};
