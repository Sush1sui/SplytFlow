import { useCallback, useEffect, useRef, useState } from "react";
import * as SecureStore from "expo-secure-store";

import { API_ENDPOINTS } from "@/constants/api";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

import type {
  AdjustSaleResponse,
  CreateSaleResponse,
  RecentSaleLog,
  TodaySalesResponse,
} from "./types";

const RECENT_SALES_LIMIT = 5;
const RECENT_SALES_KEY_PREFIX = "recent_sales";

const getRecentSalesKey = (userId: string) =>
  `${RECENT_SALES_KEY_PREFIX}_${userId}`;

const parseRecentSales = (raw: string | null): RecentSaleLog[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item): item is RecentSaleLog => {
        const maybe = item as Partial<RecentSaleLog>;
        return (
          typeof maybe?.id === "string" &&
          typeof maybe?.amount === "number" &&
          typeof maybe?.createdAt === "string"
        );
      })
      .slice(0, RECENT_SALES_LIMIT);
  } catch {
    return [];
  }
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
      await SecureStore.setItemAsync(
        getRecentSalesKey(userId),
        JSON.stringify(items.slice(0, RECENT_SALES_LIMIT)),
      );
    },
    [userId],
  );

  const loadRecentSales = useCallback(async () => {
    if (!userId) {
      setRecentSales([]);
      return;
    }

    try {
      const raw = await SecureStore.getItemAsync(getRecentSalesKey(userId));
      setRecentSales(parseRecentSales(raw));
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

      const entry: RecentSaleLog = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        amount,
        createdAt: recordedAt,
        timeZone,
        utcOffsetMinutes,
      };

      setRecentSales((prev) => {
        const next = [entry, ...prev].slice(0, RECENT_SALES_LIMIT);
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
    [clearingRecentLogs, loadTodaySales, persistRecentSales, recentSales, userId],
  );

  return {
    todayTotalSales,
    todayNetSales,
    recentSales,
    todaySalesLoading,
    removingSaleId,
    clearingRecentLogs,
    loadTodaySales,
    addQuickSale,
    clearRecentSales,
    removeRecentSale,
  };
}
