import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { SaleRow } from "@/types/sale.types";
import useTabResponsive from "../shared/use-tab-responsive";
import AnalyticsFilterBadge from "./analytics-filter-badge";
import GrossNetCard from "./gross-net-card";
import NetSplitsDonutChart from "./net-splits-donut-chart";
import SaleHistoryRow from "./sale-history-row";
import SaleRecordModal from "./sale-record-modal";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  addSale,
  deleteSale,
  fetchSales,
  updateSale,
} from "@/lib/store/saleSlice";
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
} from "@/constants/sales";

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
  const [historyPreviewRows, setHistoryPreviewRows] = useState<SaleRow[]>([]);
  const [historyPreviewLoading, setHistoryPreviewLoading] = useState(false);

  const saleState = useAppSelector((state) => state.sale);
  const splitState = useAppSelector((state) => state.split);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchSales(user.id));
    }
  }, [dispatch, user?.id]);

  const loadHistoryPreview = React.useCallback(async () => {
    if (!user?.id) {
      setHistoryPreviewRows([]);
      setHistoryPreviewLoading(false);
      return;
    }

    setHistoryPreviewLoading(true);
    try {
      const query = new URLSearchParams({ userId: user.id });
      const rows = await apiFetcher<SaleRow[]>(
        `${API_BASE_URL}${API_ENDPOINTS.SALE.LIST}?${query.toString()}`,
      );

      const topFive = [...rows]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5);

      setHistoryPreviewRows(topFive);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setHistoryPreviewRows([]);
      } else {
        setHistoryPreviewRows([]);
      }
    } finally {
      setHistoryPreviewLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadHistoryPreview();
  }, [loadHistoryPreview]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setActiveSale(null);
    setModalVisible(true);
  };

  const handleOpenEditModal = (sale: SaleRow) => {
    setModalMode("edit");
    setActiveSale(sale);
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
        loadHistoryPreview(),
      ]);
      setModalVisible(false);
      setActiveSale(null);
      setModalMode("add");
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
              loadHistoryPreview(),
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
        (group) => group.id === splitState.activeSplitGroupId,
      ),
    [splitState.splitGroups, splitState.activeSplitGroupId],
  );

  const totalSplitPct = useMemo(() => {
    if (!activeSplit) return 0;
    return activeSplit.splits.reduce((total, split) => total + split.value, 0);
  }, [activeSplit]);

  const currentKey = RANGE_SALES_KEYS[selectedRange] ?? "today";
  const comparisonKey = COMPARISON_SALES_KEYS[selectedRange] ?? "oneDayAgo";
  const comparisonLabel = COMPARISON_LABELS[selectedRange] ?? "vs prior period";

  const grossSales = saleState.sales[currentKey] ?? 0;
  const grossPrior = saleState.sales[comparisonKey] ?? 0;
  const netSales = computeNetSale(grossSales, totalSplitPct);
  const netPrior = computeNetSale(grossPrior, totalSplitPct);

  const grossChange = computePercentChange(grossSales, grossPrior);
  const netChange = computePercentChange(netSales, netPrior);

  const donutData = useMemo(() => {
    const splitSegments = (activeSplit?.splits ?? [])
      .filter((split) => split.value > 0)
      .map((split, index) => ({
        label: split.name,
        value: split.value,
        color: SPLIT_COLORS[index % SPLIT_COLORS.length],
      }));

    const rawSplitTotal = splitSegments.reduce(
      (total, segment) => total + segment.value,
      0,
    );

    const safeGrossSales = Math.max(grossSales, 0);
    const safeNetSales =
      safeGrossSales > 0 ? Math.max(0, Math.min(netSales, safeGrossSales)) : 0;

    const netSalesPercentage =
      safeGrossSales > 0 ? (safeNetSales / safeGrossSales) * 100 : 0;
    const splitBudgetPercentage = Math.max(0, 100 - netSalesPercentage);

    const normalizedSplitSegments =
      rawSplitTotal > 0 && splitBudgetPercentage > 0
        ? splitSegments.map((segment) => ({
            ...segment,
            value: (segment.value / rawSplitTotal) * splitBudgetPercentage,
          }))
        : splitSegments.map((segment) => ({
            ...segment,
            value: 0,
          }));

    const segments = [
      { label: "Net Sales", value: netSalesPercentage, color: "#10b981" },
      ...normalizedSplitSegments,
    ];

    return {
      segments,
      netSalesPercentage,
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
              space={space}
              font={font}
              setSelectedRange={setSelectedRange}
            />
          ))}
        </XStack>

        <GrossNetCard
          space={space}
          font={font}
          isNarrow={isNarrow}
          grossSales={grossSales}
          netSales={netSales}
          grossChange={grossChange}
          netChange={netChange}
          comparisonLabel={comparisonLabel}
        />

        <NetSplitsDonutChart
          space={space}
          font={font}
          segments={donutData.segments}
          netSalesPercentage={donutData.netSalesPercentage}
        />

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
                style={{
                  backgroundColor: "transparent",
                  paddingHorizontal: 6,
                  height: 36,
                  justifyContent: "center",
                }}
              >
                <Paragraph style={{ color: "#4f46e5", fontWeight: "700" }}>
                  View All
                </Paragraph>
              </Button>

              <Button
                onPress={handleOpenAddModal}
                disabled={modalVisible || mutating}
                style={{
                  borderRadius: 10,
                  height: 36,
                  paddingHorizontal: 14,
                  backgroundColor: "#dfe4ff",
                  borderColor: "#dfe4ff",
                }}
              >
                <Paragraph style={{ color: "#4f46e5", fontWeight: "800" }}>
                  + Add Record
                </Paragraph>
              </Button>
            </XStack>
          </XStack>

          <YStack gap="$2.5">
            {historyPreviewLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <YStack
                  key={`history-loading-row-${index}`}
                  style={{
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: "#e2e8f0",
                    backgroundColor: "#ffffff",
                    paddingVertical: 14,
                    paddingHorizontal: 14,
                  }}
                  gap="$2"
                >
                  <YStack
                    style={{
                      width: 120,
                      height: 14,
                      borderRadius: 7,
                      backgroundColor: "#e7ecf5",
                    }}
                  />
                  <YStack
                    style={{
                      width: 170,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#edf2f9",
                    }}
                  />
                </YStack>
              ))
            ) : historyPreviewRows.length === 0 ? (
              <Paragraph style={{ color: "#64748b", fontSize: 13 }}>
                No recent sales yet.
              </Paragraph>
            ) : (
              historyPreviewRows.map((sale) => (
                <SaleHistoryRow
                  key={sale.id}
                  sale={sale}
                  onEdit={() => handleOpenEditModal(sale)}
                  onDelete={() => handleDeleteSale(sale)}
                  disabled={mutating}
                />
              ))
            )}
          </YStack>
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
