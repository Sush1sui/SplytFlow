import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import {
  readSalesAnalyticsCache,
  writeSalesAnalyticsCache,
} from "@/lib/state/sales-analytics-cache";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

import { formatTrendLabel } from "./formatters";
import { getSalesRange } from "./date-range";
import type {
  SaleRow,
  SplitBreakdownItem,
  SplitBreakdownTimelineItem,
  SalesPreset,
  SalesRangeResponse,
  SplitItem,
  TrendPoint,
} from "./types";

const TREND_POINT_LIMIT = 12;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

type TrendBucket = "day" | "3d" | "week" | "month";

const resolveTrendBucket = (preset: SalesPreset): TrendBucket => {
  switch (preset) {
    case "1d":
    case "1w":
      return "day";
    case "1m":
      return "3d";
    case "3m":
      return "week";
    case "1y":
    case "all":
      return "month";
    default:
      return "day";
  }
};

const getBucketLabel = (value: Date, bucket: TrendBucket) => {
  if (bucket === "month") {
    return value.toLocaleDateString([], { month: "short" });
  }

  if (bucket === "week") {
    return `Wk ${value.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    })}`;
  }

  return formatTrendLabel(value.toISOString());
};

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const aggregateTrendPoints = (
  rows: SaleRow[],
  bucket: TrendBucket,
  rangeStartDate: Date,
): TrendPoint[] => {
  if (!rows.length) return [];

  const sortedRows = [...rows].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  if (bucket === "month") {
    const monthly = new Map<
      string,
      { start: Date; amount: number; label: string }
    >();

    for (const row of sortedRows) {
      const date = new Date(row.createdAt);
      if (Number.isNaN(date.getTime())) continue;

      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const key = `${monthStart.getFullYear()}-${monthStart.getMonth()}`;
      const existing = monthly.get(key);

      if (existing) {
        existing.amount += Number(row.amount) || 0;
      } else {
        monthly.set(key, {
          start: monthStart,
          amount: Number(row.amount) || 0,
          label: getBucketLabel(monthStart, bucket),
        });
      }
    }

    return [...monthly.values()]
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(-TREND_POINT_LIMIT)
      .map((bucket) => ({ label: bucket.label, amount: bucket.amount }));
  }

  const spanDays = bucket === "3d" ? 3 : bucket === "week" ? 7 : 1;
  const anchor = startOfDay(rangeStartDate);
  const buckets = new Map<
    string,
    { start: Date; amount: number; label: string }
  >();

  for (const row of sortedRows) {
    const date = new Date(row.createdAt);
    if (Number.isNaN(date.getTime())) continue;

    const day = startOfDay(date);
    const diffDays = Math.max(
      0,
      Math.floor((day.getTime() - anchor.getTime()) / MS_PER_DAY),
    );
    const bucketIndex = Math.floor(diffDays / spanDays);
    const bucketStart = new Date(
      anchor.getTime() + bucketIndex * spanDays * MS_PER_DAY,
    );
    const key = bucketStart.toISOString().slice(0, 10);
    const existing = buckets.get(key);

    if (existing) {
      existing.amount += Number(row.amount) || 0;
    } else {
      buckets.set(key, {
        start: bucketStart,
        amount: Number(row.amount) || 0,
        label: getBucketLabel(bucketStart, bucket),
      });
    }
  }

  return [...buckets.values()]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(-TREND_POINT_LIMIT)
    .map((bucket) => ({ label: bucket.label, amount: bucket.amount }));
};

const isNotFoundError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "";
  return message.includes("404");
};

const mapBreakdownToSplitRows = (
  breakdown: SplitBreakdownItem[],
  userId: string,
): SplitItem[] => {
  return [...breakdown]
    .map((item, index) => ({
      id: `history-${item.name}-${index}`,
      userId,
      name: item.name,
      value: Number(item.value) || 0,
      createdAt: "",
      updatedAt: "",
    }))
    .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
};

const normalizeBreakdown = (breakdown: SplitBreakdownItem[]) =>
  [...breakdown].sort((a, b) => a.name.localeCompare(b.name));

const normalizeTimelineRows = (
  timeline: SplitBreakdownTimelineItem[] | undefined,
): SplitBreakdownTimelineItem[] => {
  if (!Array.isArray(timeline)) return [];

  return timeline
    .map((item) => ({
      effectiveFrom:
        typeof item.effectiveFrom === "string" || item.effectiveFrom === null
          ? item.effectiveFrom
          : null,
      totalSplitPct: Number(item.totalSplitPct) || 0,
      breakdown: normalizeBreakdown(
        Array.isArray(item.breakdown) ? item.breakdown : [],
      ),
      salesCount:
        typeof item.salesCount === "number" && item.salesCount > 0
          ? item.salesCount
          : undefined,
    }))
    .sort((a, b) => {
      const aTime = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : -1;
      const bTime = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : -1;
      return aTime - bTime;
    });
};

const findEffectiveTimelineSnapshotAt = (
  timeline: SplitBreakdownTimelineItem[],
  at: Date,
) => {
  if (timeline.length === 0) return null;

  let low = 0;
  let high = timeline.length - 1;
  let resolvedIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const row = timeline[mid];
    if (!row) break;

    const rowTime = row.effectiveFrom
      ? new Date(row.effectiveFrom).getTime()
      : -1;

    if (rowTime <= at.getTime()) {
      resolvedIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (resolvedIndex === -1) return null;
  return timeline[resolvedIndex] ?? null;
};

export function useSalesAnalytics(userId?: string) {
  const [preset, setPreset] = useState<SalesPreset>("1w");
  const [salesRows, setSalesRows] = useState<SaleRow[]>([]);
  const [splitRows, setSplitRows] = useState<SplitItem[]>([]);
  const [splitTimelineRows, setSplitTimelineRows] = useState<
    SplitBreakdownTimelineItem[]
  >([]);
  const [netSales, setNetSales] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);

  const loadRangeData = useCallback(
    async ({
      isRefresh = false,
      force = false,
    }: {
      isRefresh?: boolean;
      force?: boolean;
    } = {}) => {
      const requestId = ++requestSequenceRef.current;
      const isStaleRequest = () => requestId !== requestSequenceRef.current;

      if (!userId) {
        setSalesRows([]);
        setSplitRows([]);
        setSplitTimelineRows([]);
        setNetSales(0);
        setErrorText(null);
        setLoading(false);
        return;
      }

      if (!force) {
        const cached = readSalesAnalyticsCache(userId, preset);
        if (cached) {
          if (isStaleRequest()) return;
          setSalesRows(cached.salesRows);
          setNetSales(cached.netSales);
          setSplitRows(cached.splitRows);
          setSplitTimelineRows(cached.splitTimelineRows);
          setErrorText(null);
          setLoading(false);
          setRefreshing(false);
          return;
        }
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorText(null);

      try {
        const { startDate, endDate } = getSalesRange(preset);
        const query =
          `?startDate=${encodeURIComponent(startDate.toISOString())}` +
          `&endDate=${encodeURIComponent(endDate.toISOString())}`;

        const salesResult = await (async () => {
          try {
            return await authenticatedFetch<SalesRangeResponse>(
              `${API_ENDPOINTS.SALES.BY_USER(userId)}${query}`,
              { method: "GET" },
            );
          } catch (error) {
            if (isNotFoundError(error)) {
              return { sales: [], net_sale: 0 } satisfies SalesRangeResponse;
            }
            throw error;
          }
        })();

        const hasHistoricalBreakdown = Array.isArray(
          salesResult.split_breakdown,
        );

        const splitResult = hasHistoricalBreakdown
          ? []
          : await (async () => {
              try {
                return await authenticatedFetch<SplitItem[]>(
                  API_ENDPOINTS.SPLIT.BY_USER(userId),
                  { method: "GET" },
                );
              } catch (error) {
                if (isNotFoundError(error)) {
                  return [] as SplitItem[];
                }

                console.warn(
                  "Failed to load split data for sales analytics; falling back to empty split set",
                  error,
                );
                return [] as SplitItem[];
              }
            })();

        if (isStaleRequest()) return;

        const resolvedSplitRows = hasHistoricalBreakdown
          ? mapBreakdownToSplitRows(salesResult.split_breakdown ?? [], userId)
          : Array.isArray(splitResult)
            ? splitResult
            : [];

        const resolvedTimelineRows = hasHistoricalBreakdown
          ? (() => {
              const timeline = normalizeTimelineRows(
                salesResult.split_breakdown_timeline,
              );

              if (timeline.length > 0) {
                return timeline;
              }

              return [
                {
                  effectiveFrom: null,
                  totalSplitPct: resolvedSplitRows.reduce(
                    (sum, split) => sum + (Number(split.value) || 0),
                    0,
                  ),
                  breakdown: normalizeBreakdown(
                    (salesResult.split_breakdown ?? []).map((item) => ({
                      name: item.name,
                      value: Number(item.value) || 0,
                    })),
                  ),
                },
              ];
            })()
          : [];

        setSalesRows(Array.isArray(salesResult.sales) ? salesResult.sales : []);
        setNetSales(Number(salesResult.net_sale) || 0);
        setSplitRows(resolvedSplitRows);
        setSplitTimelineRows(resolvedTimelineRows);

        writeSalesAnalyticsCache(userId, preset, {
          salesRows: Array.isArray(salesResult.sales) ? salesResult.sales : [],
          netSales: Number(salesResult.net_sale) || 0,
          splitRows: resolvedSplitRows,
          splitTimelineRows: resolvedTimelineRows,
        });
      } catch (error) {
        if (isStaleRequest()) return;
        console.error("Failed to load sales analytics", error);
        setErrorText("Could not load analytics right now. Pull to refresh.");
      } finally {
        if (isStaleRequest()) return;
        setLoading(false);
        setRefreshing(false);
      }
    },
    [preset, userId],
  );

  useEffect(() => {
    void loadRangeData();
  }, [loadRangeData]);

  const range = useMemo(() => getSalesRange(preset), [preset]);

  const grossSales = useMemo(
    () => salesRows.reduce((sum, row) => sum + (Number(row.amount) || 0), 0),
    [salesRows],
  );

  const saleCount = salesRows.length;
  const rangeDays = Math.max(
    1,
    Math.ceil(
      (range.endDate.getTime() - range.startDate.getTime()) /
        (24 * 60 * 60 * 1000),
    ),
  );
  const avgSalesPerDay = grossSales / rangeDays;
  const avgSalesPerActiveDay = saleCount > 0 ? grossSales / saleCount : 0;
  const rangeSplitRows = useMemo<SplitItem[]>(() => {
    if (
      salesRows.length === 0 ||
      splitTimelineRows.length === 0 ||
      grossSales <= 0
    ) {
      return splitRows;
    }

    const deductionByName = new Map<string, number>();

    for (const sale of salesRows) {
      const amount = Number(sale.amount) || 0;
      if (amount <= 0) continue;

      const snapshot = findEffectiveTimelineSnapshotAt(
        splitTimelineRows,
        new Date(sale.createdAt),
      );
      if (!snapshot) continue;

      for (const part of snapshot.breakdown) {
        const value = Number(part.value) || 0;
        if (value <= 0) continue;

        const next =
          (deductionByName.get(part.name) ?? 0) + amount * (value / 100);
        deductionByName.set(part.name, next);
      }
    }

    if (deductionByName.size === 0) {
      return splitRows;
    }

    return [...deductionByName.entries()]
      .map(([name, deduction]) => ({
        id: `range-${name}`,
        userId: userId ?? "",
        name,
        value: (deduction / grossSales) * 100,
        createdAt: "",
        updatedAt: "",
      }))
      .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
  }, [grossSales, salesRows, splitRows, splitTimelineRows, userId]);

  const totalSplitPct = useMemo(
    () =>
      Math.max(
        0,
        Math.min(
          100,
          rangeSplitRows.reduce(
            (sum, split) => sum + (Number(split.value) || 0),
            0,
          ),
        ),
      ),
    [rangeSplitRows],
  );

  const deductions = grossSales * (totalSplitPct / 100);
  const computedNetSales = Math.max(grossSales - deductions, 0);

  const retainedPct = Math.max(100 - totalSplitPct, 0);

  const trendBucket = useMemo(() => resolveTrendBucket(preset), [preset]);

  const trendPoints = useMemo<TrendPoint[]>(() => {
    return aggregateTrendPoints(salesRows, trendBucket, range.startDate);
  }, [range.startDate, salesRows, trendBucket]);

  const historyRows = useMemo(
    () =>
      [...salesRows]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    [salesRows],
  );

  const topSplits = useMemo(
    () =>
      [...rangeSplitRows]
        .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
        .slice(0, 4),
    [rangeSplitRows],
  );

  const refresh = useCallback(async () => {
    await loadRangeData({ isRefresh: true, force: true });
  }, [loadRangeData]);

  const refreshIfStale = useCallback(async () => {
    await loadRangeData({ force: false });
  }, [loadRangeData]);

  return {
    preset,
    setPreset,
    rangeLabel: range.label,
    salesRows,
    historyRows,
    trendPoints,
    topSplits,
    splitTimelineRows,
    loading,
    refreshing,
    errorText,
    grossSales,
    netSales: splitTimelineRows.length > 0 ? computedNetSales : netSales,
    deductions,
    saleCount,
    avgSalesPerDay,
    avgSalesPerActiveDay,
    totalSplitPct,
    retainedPct,
    refresh,
    refreshIfStale,
  };
}
