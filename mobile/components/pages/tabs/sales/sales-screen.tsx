import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { SaleRow } from "@/types/sale.types";
import useTabResponsive from "../shared/use-tab-responsive";
import AnalyticsFilterBadge from "./analytics-filter-badge";
import GrossNetCard from "./gross-net-card";
import GrossNetCardSkeleton from "./gross-net-card-skeleton";
import NetSplitsDonutChart from "./net-splits-donut-chart";
import NetSplitsDonutChartSkeleton from "./net-splits-donut-chart-skeleton";
import SaleHistoryRow from "./sale-history-row";
import SaleRecordModal from "./sale-record-modal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addSale,
  deleteSale,
  fetchSales,
  fetchSalesRange,
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
  ranges,
  RANGE_PRESET_MAPPING,
} from "@/constants/sales";
import { Skeleton } from "@/components/skeleton";

const VIEW_ALL_BTN = {
  backgroundColor: "transparent",
  paddingHorizontal: 6,
  height: 36,
  justifyContent: "center",
};

const ADD_RECORD_BTN = {
  borderRadius: 10,
  height: 36,
  paddingHorizontal: 14,
  backgroundColor: "#dfe4ff",
  borderColor: "#dfe4ff",
};

const HISTORY_ROW_STYLE = {
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#e2e8f0",
  backgroundColor: "#ffffff",
  paddingVertical: 14,
  paddingHorizontal: 14,
};

function HistoryPreviewSkeleton() {
  return (
    <YStack gap="$2.5">
      {Array.from({ length: 3 }).map((_, index) => (
        <YStack
          key={`history-loading-row-${index}`}
          style={HISTORY_ROW_STYLE}
          gap="$2"
        >
          <Skeleton width={120} height={14} borderRadius={7} />
          <Skeleton width={170} height={12} borderRadius={6} />
        </YStack>
      ))}
    </YStack>
  );
}

function HistoryPreview({
  rows,
  loading,
  onEdit,
  onDelete,
  disabled,
}: {
  rows: SaleRow[];
  loading: boolean;
  onEdit: (sale: SaleRow) => void;
  onDelete: (sale: SaleRow) => void;
  disabled: boolean;
}) {
  if (loading) return <HistoryPreviewSkeleton />;
  if (rows.length === 0) {
    return (
      <Paragraph style={{ color: "#64748b", fontSize: 13 }}>
        No recent sales yet.
      </Paragraph>
    );
  }
  return (
    <YStack gap="$2.5">
      {rows.map((sale) => (
        <SaleHistoryRow
          key={sale.id}
          sale={sale}
          onEdit={() => onEdit(sale)}
          onDelete={() => onDelete(sale)}
          disabled={disabled}
        />
      ))}
    </YStack>
  );
}

export default function SalesScreen() {
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

  const saleState = useAppSelector((state) => state.sale);
  const splitState = useAppSelector((state) => state.split);

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

  const selectedPreset = RANGE_PRESET_MAPPING[selectedRange] ?? "today";

  const refreshAllData = useCallback(async () => {
    if (!user?.id) return;

    try {
      await Promise.all([
        dispatch(fetchSales(user.id)).unwrap(),
        dispatch(fetchSplitGroupsWithSplits(user.id)).unwrap(),
        refreshHistoryRows(),
      ]);
    } catch {
      // Errors are handled in individual thunks and refresh functions, so we can ignore errors here
    }
  }, [dispatch, refreshHistoryRows, user?.id]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  useEffect(() => {
    if (!user?.id) return;
    dispatch(
      fetchSalesRange({
        userId: user.id,
        preset: selectedPreset,
      }),
    );
  }, [dispatch, selectedPreset, user?.id]);

  const handleOpenModal = (sale?: SaleRow) => {
    setModalMode(sale ? "edit" : "add");
    setActiveSale(sale ?? null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    if (mutating) return;
    setModalVisible(false);
    setActiveSale(null);
    setModalMode("add");
  };

  const handleSubmitSale = async (
    amount: number,
    localDate?: string,
    localTime?: string,
  ) => {
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
      handleCloseModal();
    } catch {
      Alert.alert("Could not save sale", "Please try again.");
    } finally {
      setMutating(false);
    }
  };

  const handleDeleteSale = (sale: SaleRow) => {
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
          } catch {
            Alert.alert("Could not delete sale", "Please try again.");
          } finally {
            setMutating(false);
          }
        },
      },
    ]);
  };

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
      segments: [
        { label: "Net Sales", value: netPct, color: "#10b981" },
        ...normalized,
      ],
      netSalesPercentage: netPct,
    };
  }, [activeSplit, grossSales, netSales]);

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <Paragraph
          style={{
            color: "#0f172a",
            fontSize: font(28, 22, 30),
            lineHeight: font(34, 28, 36),
            fontWeight: "800",
          }}
        >
          Analytics
        </Paragraph>

        <XStack style={{ marginTop: space(16), flexWrap: "wrap" }} gap="$2">
          {ranges.map((range, index) => (
            <AnalyticsFilterBadge
              key={index}
              index={index}
              range={range}
              selected={index === selectedRange}
              setSelectedRange={setSelectedRange}
            />
          ))}
        </XStack>

        {isLoading ? (
          <>
            <GrossNetCardSkeleton isNarrow={isNarrow} />
            <NetSplitsDonutChartSkeleton />
          </>
        ) : (
          <>
            <GrossNetCard
              isNarrow={isNarrow}
              grossSales={grossSales}
              netSales={netSales}
              grossChange={grossChange}
              netChange={netChange}
              comparisonLabel={comparisonLabel}
            />
            <NetSplitsDonutChart
              segments={donutData.segments}
              netSalesPercentage={donutData.netSalesPercentage}
            />
          </>
        )}

        <YStack style={{ marginTop: space(22) }} gap="$3">
          <XStack
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: font(20, 16, 22),
              }}
            >
              Sales History
            </Paragraph>
            <XStack style={{ alignItems: "center" }} gap="$2">
              <Button
                chromeless
                unstyled
                onPress={() => router.push("/(tabs)/(sales)/sale-history-page")}
                pressStyle={{ opacity: 0.7, background: "transparent" }}
                style={VIEW_ALL_BTN}
              >
                <Paragraph style={{ color: "#4f46e5", fontWeight: "700" }}>
                  View All
                </Paragraph>
              </Button>
              <Button
                onPress={() => handleOpenModal()}
                disabled={modalVisible || mutating}
                style={ADD_RECORD_BTN}
              >
                <Paragraph style={{ color: "#4f46e5", fontWeight: "800" }}>
                  + Add Record
                </Paragraph>
              </Button>
            </XStack>
          </XStack>

          <HistoryPreview
            rows={historyRows}
            loading={historyLoading}
            onEdit={(s) => handleOpenModal(s)}
            onDelete={handleDeleteSale}
            disabled={mutating}
          />
        </YStack>
      </ScrollView>

      <SaleRecordModal
        visible={modalVisible}
        mode={modalMode}
        saleCreatedAt={activeSale?.createdAt ?? null}
        initialAmount={activeSale?.amount ?? null}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSale}
        pending={mutating}
      />
    </YStack>
  );
}
