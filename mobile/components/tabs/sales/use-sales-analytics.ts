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

export function useSalesAnalytics(userId?: string) {
  const [preset, setPreset] = useState<SalesPreset>("1w");
  const [salesRows, setSalesRows] = useState<SaleRow[]>([]);
  const [splitRows, setSplitRows] = useState<SplitItem[]>([]);
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

        setSalesRows(Array.isArray(salesResult.sales) ? salesResult.sales : []);
        setNetSales(Number(salesResult.net_sale) || 0);
        setSplitRows(resolvedSplitRows);

        writeSalesAnalyticsCache(userId, preset, {
          salesRows: Array.isArray(salesResult.sales) ? salesResult.sales : [],
          netSales: Number(salesResult.net_sale) || 0,
          splitRows: resolvedSplitRows,
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
  const deductions = Math.max(grossSales - netSales, 0);

  const totalSplitPct = useMemo(
    () => splitRows.reduce((sum, split) => sum + (Number(split.value) || 0), 0),
    [splitRows],
  );

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
      [...splitRows]
        .sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0))
        .slice(0, 4),
    [splitRows],
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
    loading,
    refreshing,
    errorText,
    grossSales,
    netSales,
    deductions,
    saleCount,
    avgSalesPerDay,
    totalSplitPct,
    retainedPct,
    refresh,
    refreshIfStale,
  };
}
