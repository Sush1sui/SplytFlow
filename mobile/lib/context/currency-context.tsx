import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CURRENCY_OPTIONS,
  currencyLabel,
  currencySymbol,
  type SupportedCurrencyCode,
} from "@/constants/currency";
import {
  CONVERSION_RATE_UNAVAILABLE_MESSAGE,
  PROVIDERS_UNAVAILABLE_MESSAGE,
  RATES_UNAVAILABLE_ERROR,
  UPDATE_CURRENCY_FAILED_MESSAGE,
} from "@/constants/currency-context";
import {
  defaultCurrencyState,
  formatAmount,
  resolveConversionRate,
  roundToTwo,
} from "@/lib/utils/currency-helpers";
import { fetchConversionRatesWithFallback } from "@/lib/utils/currency-rates";
import {
  loadPersistedCurrencyState,
  persistCurrencyState,
} from "@/lib/utils/currency-storage";
import type {
  CurrencyContextValue,
  CurrencyDecisionMode,
  CurrencyRatesByBase,
  PersistedCurrencyState,
} from "@/types/currency-context.types";

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] =
    useState<PersistedCurrencyState>(defaultCurrencyState);
  const [isReady, setIsReady] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [ratesByBase, setRatesByBase] = useState<CurrencyRatesByBase>({});

  const activeCurrency = state.initialDecisionMade
    ? state.selectedCurrency
    : state.baseCurrency;

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const hydrated = await loadPersistedCurrencyState();
      if (!mounted) return;

      setState(hydrated);
      setIsReady(true);
    }

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const ensureRatesForBase = useCallback(
    async (base: SupportedCurrencyCode) => {
      const existing = ratesByBase[base];
      if (existing) {
        return existing;
      }

      const rates = await fetchConversionRatesWithFallback(base);
      setRatesByBase((previous) => ({
        ...previous,
        [base]: rates,
      }));

      return rates;
    },
    [ratesByBase],
  );

  useEffect(() => {
    if (!isReady) return;

    void ensureRatesForBase(state.baseCurrency).catch(() => {
      // Conversion gracefully falls back to 1 when rates are unavailable.
    });
  }, [ensureRatesForBase, isReady, state.baseCurrency]);

  const conversionRate = useMemo(() => {
    return resolveConversionRate(state, activeCurrency, ratesByBase);
  }, [
    activeCurrency,
    ratesByBase,
    state.baseCurrency,
    state.initialDecisionMade,
  ]);

  const convertStoredToDisplay = useCallback(
    (amount: number) => roundToTwo(amount * conversionRate),
    [conversionRate],
  );

  const convertDisplayToStored = useCallback(
    (amount: number) => {
      if (!Number.isFinite(amount)) return 0;
      if (!conversionRate || conversionRate <= 0) return amount;
      return roundToTwo(amount / conversionRate);
    },
    [conversionRate],
  );

  const formatDisplayAmount = useCallback(
    (amount: number) => formatAmount(amount, activeCurrency),
    [activeCurrency],
  );

  const formatStoredAmount = useCallback(
    (amount: number) => formatDisplayAmount(convertStoredToDisplay(amount)),
    [convertStoredToDisplay, formatDisplayAmount],
  );

  const applyCurrencySelection = useCallback(
    async (nextCurrency: SupportedCurrencyCode, mode: CurrencyDecisionMode) => {
      const nextBaseCurrency =
        mode === "convert" ? state.baseCurrency : nextCurrency;

      setIsUpdating(true);
      try {
        if (mode === "convert" && nextCurrency !== nextBaseCurrency) {
          const rates = await ensureRatesForBase(nextBaseCurrency);
          const candidateRate = rates[nextCurrency];

          if (!candidateRate || !Number.isFinite(candidateRate)) {
            return {
              ok: false,
              error: CONVERSION_RATE_UNAVAILABLE_MESSAGE,
            };
          }
        }

        const nextState: PersistedCurrencyState = {
          selectedCurrency: nextCurrency,
          baseCurrency: nextBaseCurrency,
          initialDecisionMade: true,
        };

        setState(nextState);
        await persistCurrencyState(nextState);

        return { ok: true };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === RATES_UNAVAILABLE_ERROR
        ) {
          return {
            ok: false,
            error: PROVIDERS_UNAVAILABLE_MESSAGE,
          };
        }

        return {
          ok: false,
          error: UPDATE_CURRENCY_FAILED_MESSAGE,
        };
      } finally {
        setIsUpdating(false);
      }
    },
    [ensureRatesForBase, state.baseCurrency],
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({
      isReady,
      isUpdating,
      activeCurrency,
      selectedCurrency: state.selectedCurrency,
      baseCurrency: state.baseCurrency,
      initialDecisionNeeded: !state.initialDecisionMade,
      currencyOptions: CURRENCY_OPTIONS,
      currencySymbol: currencySymbol(activeCurrency),
      currentCurrencyLabel: currencyLabel(state.selectedCurrency),
      conversionRate,
      convertStoredToDisplay,
      convertDisplayToStored,
      formatStoredAmount,
      formatDisplayAmount,
      applyCurrencySelection,
    }),
    [
      activeCurrency,
      applyCurrencySelection,
      conversionRate,
      convertDisplayToStored,
      convertStoredToDisplay,
      formatDisplayAmount,
      formatStoredAmount,
      isReady,
      isUpdating,
      state.baseCurrency,
      state.selectedCurrency,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export default function useCurrencySettings(): CurrencyContextValue {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrencySettings must be used inside CurrencyProvider");
  }

  return context;
}
