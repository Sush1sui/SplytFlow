import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { SaleRow } from "@/types/sale.types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addSale,
  deleteSale,
  fetchSales,
  fetchSalesHistory,
  fetchSalesRange,
  invalidateSalesCache,
  updateSale,
} from "@/lib/store/saleSlice";
import { fetchSplitGroupsWithSplits } from "@/lib/store/splitSlice";
import {
  computeNetSale,
  computePercentChange,
  getSalesRangeQueryByPreset,
} from "@/lib/utils/sale";
import { useAuthState } from "@/lib/context/auth-context";
import { ApiError, apiFetcher } from "@/lib/api";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import {
  ranges,
  RANGE_SALES_KEYS,
  COMPARISON_SALES_KEYS,
  COMPARISON_LABELS,
  SPLIT_COLORS,
  RANGE_PRESET_MAPPING,
} from "@/constants/sales";
import useTabResponsive from "../shared/use-tab-responsive";
import useToast from "@/lib/context/toast-context";
import useAlertDialog from "@/components/shared/use-alert-dialog";
import { buildSalesCsv } from "@/lib/utils/sales-csv";
import { saveSalesCsvToDevice } from "@/lib/utils/sales-csv-file";
import useCurrencySettings from "@/lib/context/currency-context";
import { isSupportedCurrency } from "@/constants/currency";

const CACHE_TTL = 60_000;

function isStale(lastFetched: number | null): boolean {
  return lastFetched === null || Date.now() - lastFetched > CACHE_TTL;
}

function toFileNameToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCsvFileName(rangeLabel: string): string {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `splytflow-sales-${toFileNameToken(rangeLabel)}-${stamp}.csv`;
}

export function useSalesScreen() {
  const router = useRouter();
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const { isNarrow, font, space } = useTabResponsive();
  const { showToast } = useToast();
  const { alertDialogProps, showConfirm } = useAlertDialog();
  const {
    activeCurrency,
    convertStoredToDisplay,
    convertInputToStored,
    formatDisplayAmount,
    formatStoredAmount,
  } = useCurrencySettings();

  const [selectedRange, setSelectedRange] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeSale, setActiveSale] = useState<SaleRow | null>(null);
  const [mutating, setMutating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const saleState = useAppSelector((state) => state.sale);
  const splitState = useAppSelector((state) => state.split);

  // History sourced from Redux — updated optimistically on addSale/updateSale/deleteSale
  // and also refreshed via fetchSalesHistory. This lets QuickAddSale on the Home tab
  // trigger updates here without needing access to local state.
  const historyRows = saleState.history.slice(0, 5);
  const historyLoading = saleState.historyStatus === "loading";

  const selectedPreset = RANGE_PRESET_MAPPING[selectedRange] ?? "today";

  // Keep a ref to the latest sale state so callbacks don't need it as a dep
  const saleStateRef = useRef(saleState);
  useEffect(() => {
    saleStateRef.current = saleState;
  }, [saleState]);

  // ─── Data fetching ────────────────────────────────────────────────────────

  const refreshAllData = useCallback(
    async (force = false) => {
      if (!user?.id) return;
      // Read lastFetched from ref — no reactive dep, no re-render cascade
      if (!force && !isStale(saleStateRef.current.lastFetched)) return;
      try {
        await Promise.all([
          dispatch(fetchSales(user.id)).unwrap(),
          dispatch(fetchSplitGroupsWithSplits(user.id)).unwrap(),
          dispatch(fetchSalesHistory(user.id)).unwrap(),
        ]);
      } catch {
        // Errors handled in individual thunks
      }
    },
    [dispatch, user?.id],
  );

  const handleRefresh = useCallback(async () => {
    dispatch(invalidateSalesCache());
    setRefreshing(true);
    try {
      await refreshAllData(true);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, refreshAllData]);

  // ─── Effects ─────────────────────────────────────────────────────────────

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (!user?.id) return;
    // Read from ref so switching filters doesn't remake this effect's closure
    const alreadyLoaded =
      saleStateRef.current.rangeStatus[selectedPreset] === "succeeded" &&
      !isStale(saleStateRef.current.lastFetched);
    if (alreadyLoaded) return;
    dispatch(fetchSalesRange({ userId: user.id, preset: selectedPreset }));
  }, [dispatch, selectedPreset, user?.id]);

  // ─── Modal handlers ───────────────────────────────────────────────────────

  const handleOpenModal = useCallback((sale?: SaleRow) => {
    setModalMode(sale ? "edit" : "add");
    setActiveSale(sale ?? null);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (mutating) return;
    setModalVisible(false);
    setActiveSale(null);
    setModalMode("add");
  }, [mutating]);

  const handleSubmitSale = useCallback(
    async (amount: number, localDate?: string, localTime?: string) => {
      if (!user?.id) return;

      setMutating(true);
      try {
        if (modalMode === "edit" && activeSale) {
          const inputCurrency = isSupportedCurrency(activeSale.currencyCode)
            ? activeSale.currencyCode
            : activeCurrency;
          const storedAmount = await convertInputToStored(
            amount,
            inputCurrency,
          );

          await dispatch(
            updateSale({
              id: activeSale.id,
              userId: user.id,
              amount: storedAmount,
              originalAmount: amount,
              currencyCode: inputCurrency,
            }),
          ).unwrap();
        } else {
          const storedAmount = await convertInputToStored(
            amount,
            activeCurrency,
          );

          await dispatch(
            addSale({
              userId: user.id,
              amount: storedAmount,
              originalAmount: amount,
              currencyCode: activeCurrency,
              localDate,
              localTime,
            }),
          ).unwrap();
        }
        await Promise.all([
          dispatch(fetchSales(user.id)).unwrap(),
          dispatch(fetchSalesHistory(user.id)).unwrap(),
        ]);
        dispatch(invalidateSalesCache());
        handleCloseModal();
      } catch {
        showToast({
          message: "Error saving sale. Please try again.",
          type: "danger",
        });
      } finally {
        setMutating(false);
      }
    },
    [
      activeSale,
      activeCurrency,
      convertInputToStored,
      dispatch,
      handleCloseModal,
      modalMode,
      showToast,
      user?.id,
    ],
  );

  const handleDeleteSale = useCallback(
    (sale: SaleRow) => {
      showConfirm({
        title: "Delete sale record?",
        message: "This action cannot be undone.",
        confirmText: "Delete",
        cancelText: "Cancel",
        confirmTone: "danger",
        onConfirm: async () => {
          if (!user?.id) return;

          setMutating(true);
          try {
            await dispatch(
              deleteSale({
                id: sale.id,
                userId: user.id,
                amount: sale.amount,
              }),
            ).unwrap();
            await Promise.all([
              dispatch(fetchSales(user.id)).unwrap(),
              dispatch(fetchSalesHistory(user.id)).unwrap(),
            ]);
            dispatch(invalidateSalesCache());
          } catch {
            showToast({
              message: "Could not delete sale. Please try again.",
              type: "danger",
            });
          } finally {
            setMutating(false);
          }
        },
      });
    },
    [dispatch, showConfirm, showToast, user?.id],
  );

  // ─── Derived values ───────────────────────────────────────────────────────

  const activeSplit = useMemo(
    () =>
      splitState.splitGroups.find(
        (g) => g.id === splitState.activeSplitGroupId,
      ),
    [splitState.splitGroups, splitState.activeSplitGroupId],
  );

  const totalSplitPct = useMemo(
    () => activeSplit?.splits.reduce((t, s) => t + s.value, 0) ?? 0,
    [activeSplit],
  );

  const currentKey = RANGE_SALES_KEYS[selectedRange] ?? "today";
  const comparisonKey = COMPARISON_SALES_KEYS[selectedRange] ?? "oneDayAgo";
  const comparisonLabel = COMPARISON_LABELS[selectedRange] ?? "vs prior period";
  const selectedRangeLabel = ranges[selectedRange] ?? "Selected Range";
  const comparisonPeriodLabel = comparisonLabel.startsWith("vs ")
    ? comparisonLabel.slice(3)
    : comparisonLabel;

  const handleExportCsv = useCallback(async () => {
    if (!user?.id || exportingCsv) return;

    setExportingCsv(true);

    try {
      const { startLocalDate, endLocalDate, timeZone } =
        getSalesRangeQueryByPreset(selectedPreset);

      const query = new URLSearchParams({
        userId: user.id,
        startLocalDate,
        endLocalDate,
        timeZone,
      });

      let rows: SaleRow[] = [];

      try {
        rows = await apiFetcher<SaleRow[]>(
          `${API_BASE_URL}${API_ENDPOINTS.SALE.RANGE}?${query.toString()}`,
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          rows = [];
        } else {
          throw error;
        }
      }

      const csv = buildSalesCsv({
        rows,
        rangeLabel: selectedRangeLabel,
        splitPercentage: totalSplitPct,
        exportedAt: new Date(),
        currencyCode: activeCurrency,
        convertStoredToDisplay,
      });

      const fileName = buildCsvFileName(selectedRangeLabel);

      const savedFile = await saveSalesCsvToDevice(fileName, csv);

      showToast({
        message: `CSV saved to ${savedFile.savedPathLabel}.`,
        type: "success",
      });

      // Keep lint happy if we later decide to surface this in UI.
      void savedFile.fileUri;
    } catch {
      showToast({
        message: "Could not export CSV. Please try again.",
        type: "danger",
      });
    } finally {
      setExportingCsv(false);
    }
  }, [
    convertStoredToDisplay,
    exportingCsv,
    activeCurrency,
    selectedPreset,
    selectedRangeLabel,
    showToast,
    totalSplitPct,
    user?.id,
  ]);

  const grossSalesStored = saleState.sales[currentKey] ?? 0;
  const grossPriorStored = saleState.sales[comparisonKey] ?? 0;
  const netSalesStored = computeNetSale(grossSalesStored, totalSplitPct);
  const netPriorStored = computeNetSale(grossPriorStored, totalSplitPct);
  const grossChange = computePercentChange(grossSalesStored, grossPriorStored);
  const netChange = computePercentChange(netSalesStored, netPriorStored);

  const isLoading = saleState.rangeStatus[selectedPreset] === "loading";

  const rangeGrossSales = convertStoredToDisplay(grossSalesStored);
  const rangeGrossPrior = convertStoredToDisplay(grossPriorStored);
  const rangeNetSales = convertStoredToDisplay(netSalesStored);
  const rangeNetPrior = convertStoredToDisplay(netPriorStored);
  const rangeGrossChange = grossChange;
  const rangeNetChange = netChange;
  const rangeGrossDelta = rangeGrossSales - rangeGrossPrior;
  const rangeNetDelta = rangeNetSales - rangeNetPrior;
  const rangeRetentionPct =
    grossSalesStored > 0 ? (netSalesStored / grossSalesStored) * 100 : 100;

  const anomalyFlags = useMemo(() => {
    const flags: string[] = [];

    if (rangeGrossPrior > 0 && rangeGrossChange <= -25) {
      flags.push(
        `Gross sales dropped sharply compared with ${comparisonPeriodLabel}.`,
      );
    }

    if (rangeGrossPrior > 0 && rangeGrossChange >= 35) {
      flags.push(
        `Gross sales jumped sharply compared with ${comparisonPeriodLabel}.`,
      );
    }

    if (totalSplitPct >= 55) {
      flags.push(
        `Your active split deductions are high at ${Math.round(totalSplitPct)}%.`,
      );
    }

    if (rangeGrossSales > 0 && rangeRetentionPct < 45) {
      flags.push(
        `Only ${Math.round(rangeRetentionPct)}% of gross sales stayed as net for ${selectedRangeLabel.toLowerCase()}.`,
      );
    }

    return flags;
  }, [
    comparisonPeriodLabel,
    rangeGrossChange,
    rangeGrossPrior,
    rangeGrossSales,
    rangeRetentionPct,
    selectedRangeLabel,
    totalSplitPct,
  ]);

  const whatChangedText = useMemo(() => {
    if (grossSalesStored === 0 && grossPriorStored === 0) {
      return `No sales were recorded for ${selectedRangeLabel.toLowerCase()} or ${comparisonPeriodLabel}.`;
    }

    if (grossPriorStored === 0 && grossSalesStored > 0) {
      return `${selectedRangeLabel} recorded ${formatStoredAmount(grossSalesStored)} in gross sales and ${formatStoredAmount(netSalesStored)} in net sales, versus no sales in ${comparisonPeriodLabel}.`;
    }

    const grossDirection = rangeGrossDelta >= 0 ? "increased" : "decreased";
    const netDirection = rangeNetDelta >= 0 ? "rose" : "fell";
    const grossDeltaAbs = Math.abs(rangeGrossDelta);
    const netDeltaAbs = Math.abs(rangeNetDelta);

    return `${selectedRangeLabel} gross ${grossDirection} by ${formatDisplayAmount(grossDeltaAbs)} compared with ${comparisonPeriodLabel}. With ${Math.round(totalSplitPct * 10) / 10}% total splits, net ${netDirection} by ${formatDisplayAmount(netDeltaAbs)}.`;
  }, [
    comparisonPeriodLabel,
    formatDisplayAmount,
    formatStoredAmount,
    grossPriorStored,
    grossSalesStored,
    netSalesStored,
    rangeGrossDelta,
    rangeNetDelta,
    selectedRangeLabel,
    totalSplitPct,
  ]);

  const donutData = useMemo(() => {
    const segments = (activeSplit?.splits ?? [])
      .filter((s) => s.value > 0)
      .map((s, i) => ({
        label: s.name,
        value: s.value,
        color: SPLIT_COLORS[i % SPLIT_COLORS.length],
      }));
    const total = segments.reduce((t, s) => t + s.value, 0);
    const netPct =
      grossSalesStored > 0 ? (netSalesStored / grossSalesStored) * 100 : 0;
    const splitPct = Math.max(0, 100 - netPct);
    const normalized = segments.map((s) => ({
      ...s,
      value: total > 0 ? (s.value / total) * splitPct : 0,
    }));
    return {
      segments: [
        { label: "Net Sales", value: netPct, color: "#10b981" },
        ...normalized,
      ],
      netSalesPercentage: netPct,
    };
  }, [activeSplit, grossSalesStored, netSalesStored]);

  return {
    // layout
    router,
    isNarrow,
    font,
    space,
    // range selection
    selectedRange,
    setSelectedRange,
    exportingCsv,
    handleExportCsv,
    // modal
    modalVisible,
    modalMode,
    activeSale,
    mutating,
    handleOpenModal,
    handleCloseModal,
    handleSubmitSale,
    // history
    historyRows,
    historyLoading,
    handleDeleteSale,
    alertDialogProps,
    // analytics
    isLoading,
    grossSales: rangeGrossSales,
    netSales: rangeNetSales,
    grossChange,
    netChange,
    comparisonLabel,
    donutData,
    rangeInsights: {
      rangeLabel: selectedRangeLabel,
      comparisonLabel,
      grossSales: rangeGrossSales,
      netSales: rangeNetSales,
      grossChange: rangeGrossChange,
      netChange: rangeNetChange,
      totalSplitPct,
      anomalyFlags,
      whatChangedText,
    },
    // pull-to-refresh
    refreshing,
    handleRefresh,
  };
}
