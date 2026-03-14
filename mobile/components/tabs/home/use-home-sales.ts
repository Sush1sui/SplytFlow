import { useCallback, useEffect, useRef, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { markSalesAnalyticsDirty } from "@/lib/state/sales-analytics-cache";
import {
  readRecentSalesLogs,
  writeRecentSalesLogs,
} from "@/lib/state/recent-sales-logs";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

import type {
  AdjustSaleResponse,
  CreateSaleResponse,
  RecentSaleLog,
  TodaySalesResponse,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_UTC_OFFSET_MINUTES = 14 * 60;
const FLOAT_TOLERANCE = 1e-6;

const normalizeUtcOffsetMinutes = (offset?: number) => {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(
    -MAX_UTC_OFFSET_MINUTES,
    Math.min(MAX_UTC_OFFSET_MINUTES, Math.trunc(offset as number)),
  );
};

const getDayBucketRangeForLog = (sale: RecentSaleLog) => {
  const referenceTime = new Date(sale.createdAt);
  if (Number.isNaN(referenceTime.getTime())) {
    throw new Error("This log has an invalid timestamp and cannot be removed.");
  }

  const utcOffsetMinutes = normalizeUtcOffsetMinutes(sale.utcOffsetMinutes);
  const offsetMs = utcOffsetMinutes * 60 * 1000;
  const localMs = referenceTime.getTime() + offsetMs;
  const localDayStartMs = Math.floor(localMs / DAY_MS) * DAY_MS;
  const start = new Date(localDayStartMs - offsetMs);
  const end = new Date(start.getTime() + DAY_MS);

  return { start, end };
};

const mapRemoveRecentSaleError = (message: string) => {
  if (
    message.includes("Deduction exceeds current daily sales") ||
    message.includes("Sale day bucket not found")
  ) {
    return "This sale can't be removed because this day's total was already changed. Please update today's amount in Manage Sales or clear recent activity for this day.";
  }

  return message;
};

export function useHomeSales(userId?: string) {
  const [todayTotalSales, setTodayTotalSales] = useState(0);
  const [todayNetSales, setTodayNetSales] = useState(0);
  const [recentSales, setRecentSales] = useState<RecentSaleLog[]>([]);
  const [todaySalesLoading, setTodaySalesLoading] = useState(true);
  const [removingSaleId, setRemovingSaleId] = useState<string | null>(null);
  const [clearingRecentLogs, setClearingRecentLogs] = useState(false);
  const inFlightRemoveRef = useRef<Set<string>>(new Set());

  const persistRecentSales = useCallback(
    async (items: RecentSaleLog[]) => {
      if (!userId) return;
      await writeRecentSalesLogs(userId, items);
    },
    [userId],
  );

  const loadRecentSales = useCallback(async () => {
    if (!userId) {
      setRecentSales([]);
      return;
    }

    try {
      setRecentSales(await readRecentSalesLogs(userId));
    } catch {
      setRecentSales([]);
    }
  }, [userId]);

  const loadTodaySales = useCallback(async () => {
    if (!userId) {
      setTodayTotalSales(0);
      setTodayNetSales(0);
      setTodaySalesLoading(false);
      return;
    }

    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const todayQuery =
      `?startDate=${encodeURIComponent(startDate.toISOString())}` +
      `&endDate=${encodeURIComponent(endDate.toISOString())}`;

    try {
      setTodaySalesLoading(true);
      const response = await authenticatedFetch<TodaySalesResponse>(
        `${API_ENDPOINTS.SALES.BY_USER(userId)}${todayQuery}`,
        { method: "GET" },
      );

      const salesRows = Array.isArray(response.sales) ? response.sales : [];
      const total = salesRows.reduce(
        (sum, sale) => sum + (Number(sale.amount) || 0),
        0,
      );

      setTodayTotalSales(total);
      setTodayNetSales(Number(response.net_sale) || 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      // Sales endpoint returns 404 when no sales exist for today.
      if (message.includes("404")) {
        setTodayTotalSales(0);
        setTodayNetSales(0);
      } else {
        console.error("Failed to load today's sales", error);
      }
    } finally {
      setTodaySalesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadTodaySales();
  }, [loadTodaySales]);

  useEffect(() => {
    void loadRecentSales();
  }, [loadRecentSales]);

  const addQuickSale = useCallback(
    async (amount: number) => {
      if (!userId) {
        throw new Error("Missing account. Please sign in again and retry.");
      }

      const timeZone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      // JS getTimezoneOffset: UTC - local. We invert it to get local offset from UTC.
      const utcOffsetMinutes = -new Date().getTimezoneOffset();
      const recordedAt = new Date().toISOString();

      await authenticatedFetch<CreateSaleResponse>(API_ENDPOINTS.SALES.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount,
          timeZone,
          utcOffsetMinutes,
          recordedAt,
        }),
      });

      markSalesAnalyticsDirty(userId);

      const entry: RecentSaleLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount,
        createdAt: recordedAt,
        timeZone,
        utcOffsetMinutes,
      };

      setRecentSales((prev) => {
        const next = [entry, ...prev];
        void persistRecentSales(next);
        return next;
      });

      await loadTodaySales();
    },
    [loadTodaySales, persistRecentSales, userId],
  );

  const clearRecentSales = useCallback(async () => {
    setClearingRecentLogs(true);

    try {
      setRecentSales([]);
      await persistRecentSales([]);
    } finally {
      setClearingRecentLogs(false);
    }
  }, [persistRecentSales]);

  const removeRecentSale = useCallback(
    async (saleId: string) => {
      if (!userId) {
        throw new Error("Missing account. Please sign in again and retry.");
      }

      // Hard lock to prevent duplicate requests from rapid multi-taps.
      if (inFlightRemoveRef.current.has(saleId)) {
        return;
      }

      if (clearingRecentLogs) {
        return;
      }

      const saleToRemove = recentSales.find((sale) => sale.id === saleId);
      if (!saleToRemove) {
        return;
      }

      const amount = Number(saleToRemove.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error(
          "This log has an invalid amount and cannot be removed.",
        );
      }

      try {
        inFlightRemoveRef.current.add(saleId);
        setRemovingSaleId(saleId);

        const { start, end } = getDayBucketRangeForLog(saleToRemove);
        const query =
          `?startDate=${encodeURIComponent(start.toISOString())}` +
          `&endDate=${encodeURIComponent(end.toISOString())}`;

        let dayTotal = 0;
        try {
          const dayResponse = await authenticatedFetch<TodaySalesResponse>(
            `${API_ENDPOINTS.SALES.BY_USER(userId)}${query}`,
            { method: "GET" },
          );
          dayTotal = (
            Array.isArray(dayResponse.sales) ? dayResponse.sales : []
          ).reduce((sum, sale) => sum + (Number(sale.amount) || 0), 0);
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (message.includes("404")) {
            dayTotal = 0;
          } else {
            throw error;
          }
        }

        if (amount > dayTotal + FLOAT_TOLERANCE) {
          throw new Error(
            "This sale can't be removed because this day's total was already changed. Please update today's amount in Manage Sales or clear recent activity for this day.",
          );
        }

        try {
          await authenticatedFetch<AdjustSaleResponse>(
            API_ENDPOINTS.SALES.ADJUST,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId,
                amount,
                requestId: `remove_recent_log_${saleToRemove.id}`,
                timeZone: saleToRemove.timeZone,
                utcOffsetMinutes: saleToRemove.utcOffsetMinutes,
                recordedAt: saleToRemove.createdAt,
              }),
            },
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to remove sale.";
          throw new Error(mapRemoveRecentSaleError(message));
        }

        markSalesAnalyticsDirty(userId);

        setRecentSales((prev) => {
          const next = prev.filter((sale) => sale.id !== saleId);
          void persistRecentSales(next);
          return next;
        });

        await loadTodaySales();
      } finally {
        inFlightRemoveRef.current.delete(saleId);
        setRemovingSaleId((current) => (current === saleId ? null : current));
      }
    },
    [
      clearingRecentLogs,
      loadTodaySales,
      persistRecentSales,
      recentSales,
      userId,
    ],
  );

  return {
    todayTotalSales,
    todayNetSales,
    recentSales,
    todaySalesLoading,
    removingSaleId,
    clearingRecentLogs,
    loadRecentSales,
    loadTodaySales,
    addQuickSale,
    clearRecentSales,
    removeRecentSale,
  };
}
