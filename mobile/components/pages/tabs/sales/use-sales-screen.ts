import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { SaleRow } from "@/types/sale.types";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addSale,
  deleteSale,
  fetchSales,
  fetchSalesRange,
  invalidateSalesCache,
  updateSale,
} from "@/lib/store/saleSlice";
import { fetchSplitGroupsWithSplits } from "@/lib/store/splitSlice";
import { computeNetSale, computePercentChange } from "@/lib/utils/sale";
import { useAuthState } from "@/lib/context/auth-context";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants/api";
import { ApiError, apiFetcher } from "@/lib/api";
import {
  RANGE_SALES_KEYS,
  COMPARISON_SALES_KEYS,
  COMPARISON_LABELS,
  SPLIT_COLORS,
  RANGE_PRESET_MAPPING,
} from "@/constants/sales";
import useTabResponsive from "../shared/use-tab-responsive";

const CACHE_TTL = 60_000;

function isStale(lastFetched: number | null): boolean {
  return lastFetched === null || Date.now() - lastFetched > CACHE_TTL;
}

export function useSalesScreen() {
  const router = useRouter();
  const { user } = useAuthState();
  const dispatch = useAppDispatch();
  const { isNarrow, font, space } = useTabResponsive();

  const [selectedRange, setSelectedRange] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeSale, setActiveSale] = useState<SaleRow | null>(null);
  const [mutating, setMutating] = useState(false);
  const [historyRows, setHistoryRows] = useState<SaleRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const saleState = useAppSelector((state) => state.sale);
  const splitState = useAppSelector((state) => state.split);

  const selectedPreset = RANGE_PRESET_MAPPING[selectedRange] ?? "today";

  // ─── Data fetching ────────────────────────────────────────────────────────

  const refreshHistoryRows = useCallback(async () => {
    if (!user?.id) {
      setHistoryRows([]);
      setHistoryLoading(false);
      return;
    }
    setHistoryLoading(true);
    try {
      const rows = await apiFetcher<SaleRow[]>(
        `${API_BASE_URL}${API_ENDPOINTS.SALE.LIST}?userId=${user.id}`,
      );
      setHistoryRows(
        [...rows]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 5),
      );
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 404)) {
        console.error(error);
      }
      setHistoryRows([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [user?.id]);

  const refreshAllData = useCallback(
    async (force = false) => {
      if (!user?.id) return;
      if (!force && !isStale(saleState.lastFetched)) return;
      try {
        await Promise.all([
          dispatch(fetchSales(user.id)).unwrap(),
          dispatch(fetchSplitGroupsWithSplits(user.id)).unwrap(),
          refreshHistoryRows(),
        ]);
      } catch {
        // Errors handled in individual thunks
      }
    },
    [dispatch, refreshHistoryRows, user?.id, saleState.lastFetched],
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
    const alreadyLoaded =
      saleState.rangeStatus[selectedPreset] === "succeeded" &&
      !isStale(saleState.lastFetched);
    if (alreadyLoaded) return;
    dispatch(fetchSalesRange({ userId: user.id, preset: selectedPreset }));
  }, [dispatch, selectedPreset, user?.id, saleState.rangeStatus, saleState.lastFetched]);

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
          await dispatch(
            updateSale({ id: activeSale.id, userId: user.id, amount }),
          ).unwrap();
        } else {
          await dispatch(
            addSale({ userId: user.id, amount, localDate, localTime }),
          ).unwrap();
        }
        await Promise.all([
          dispatch(fetchSales(user.id)).unwrap(),
          refreshHistoryRows(),
        ]);
        dispatch(invalidateSalesCache());
        handleCloseModal();
      } catch {
        Alert.alert("Could not save sale", "Please try again.");
      } finally {
        setMutating(false);
      }
    },
    [activeSale, dispatch, handleCloseModal, modalMode, refreshHistoryRows, user?.id],
  );

  const handleDeleteSale = useCallback(
    (sale: SaleRow) => {
      if (!user?.id) return;
      Alert.alert("Delete sale record?", "This action cannot be undone.", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setMutating(true);
            try {
              await dispatch(
                deleteSale({ id: sale.id, userId: user.id, amount: sale.amount }),
              ).unwrap();
              await Promise.all([
                dispatch(fetchSales(user.id)).unwrap(),
                refreshHistoryRows(),
              ]);
              dispatch(invalidateSalesCache());
            } catch {
              Alert.alert("Could not delete sale", "Please try again.");
            } finally {
              setMutating(false);
            }
          },
        },
      ]);
    },
    [dispatch, refreshHistoryRows, user?.id],
  );

  // ─── Derived values ───────────────────────────────────────────────────────

  const activeSplit = useMemo(
    () =>
      splitState.splitGroups.find((g) => g.id === splitState.activeSplitGroupId),
    [splitState.splitGroups, splitState.activeSplitGroupId],
  );

  const totalSplitPct = useMemo(
    () => activeSplit?.splits.reduce((t, s) => t + s.value, 0) ?? 0,
    [activeSplit],
  );

  const currentKey = RANGE_SALES_KEYS[selectedRange] ?? "today";
  const comparisonKey = COMPARISON_SALES_KEYS[selectedRange] ?? "oneDayAgo";
  const comparisonLabel = COMPARISON_LABELS[selectedRange] ?? "vs prior period";

  const grossSales = saleState.sales[currentKey] ?? 0;
  const grossPrior = saleState.sales[comparisonKey] ?? 0;
  const netSales = computeNetSale(grossSales, totalSplitPct);
  const netPrior = computeNetSale(grossPrior, totalSplitPct);
  const grossChange = computePercentChange(grossSales, grossPrior);
  const netChange = computePercentChange(netSales, netPrior);

  const isLoading = saleState.rangeStatus[selectedPreset] === "loading";

  const donutData = useMemo(() => {
    const segments = (activeSplit?.splits ?? [])
      .filter((s) => s.value > 0)
      .map((s, i) => ({
        label: s.name,
        value: s.value,
        color: SPLIT_COLORS[i % SPLIT_COLORS.length],
      }));
    const total = segments.reduce((t, s) => t + s.value, 0);
    const netPct = grossSales > 0 ? (netSales / grossSales) * 100 : 0;
    const splitPct = Math.max(0, 100 - netPct);
    const normalized = segments.map((s) => ({
      ...s,
      value: total > 0 ? (s.value / total) * splitPct : 0,
    }));
    return {
      segments: [{ label: "Net Sales", value: netPct, color: "#10b981" }, ...normalized],
      netSalesPercentage: netPct,
    };
  }, [activeSplit, grossSales, netSales]);

  return {
    // layout
    router,
    isNarrow,
    font,
    space,
    // range selection
    selectedRange,
    setSelectedRange,
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
    // analytics
    isLoading,
    grossSales,
    netSales,
    grossChange,
    netChange,
    comparisonLabel,
    donutData,
    // pull-to-refresh
    refreshing,
    handleRefresh,
  };
}
