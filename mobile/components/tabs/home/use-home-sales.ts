import { useCallback, useEffect, useState } from "react";

import { API_ENDPOINTS } from "@/constants/api";
import { authenticatedFetch } from "@/lib/utils/auth-fetch";

import type {
  CreateSaleResponse,
  TodaySale,
  TodaySalesResponse,
} from "./types";

export function useHomeSales(userId?: string) {
  const [todayTotalSales, setTodayTotalSales] = useState(0);
  const [todayNetSales, setTodayNetSales] = useState(0);
  const [recentSales, setRecentSales] = useState<TodaySale[]>([]);
  const [todaySalesLoading, setTodaySalesLoading] = useState(true);

  const loadTodaySales = useCallback(async () => {
    if (!userId) {
      setTodayTotalSales(0);
      setTodayNetSales(0);
      setRecentSales([]);
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

      const sortedRecent = [...salesRows].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setTodayTotalSales(total);
      setTodayNetSales(Number(response.net_sale) || 0);
      setRecentSales(sortedRecent.slice(0, 5));
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      // Sales endpoint returns 404 when no sales exist for today.
      if (message.includes("404")) {
        setTodayTotalSales(0);
        setTodayNetSales(0);
        setRecentSales([]);
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

  const addQuickSale = useCallback(
    async (amount: number) => {
      if (!userId) {
        throw new Error("Missing account. Please sign in again and retry.");
      }

      await authenticatedFetch<CreateSaleResponse>(API_ENDPOINTS.SALES.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, amount }),
      });

      await loadTodaySales();
    },
    [loadTodaySales, userId],
  );

  return {
    todayTotalSales,
    todayNetSales,
    recentSales,
    todaySalesLoading,
    loadTodaySales,
    addQuickSale,
  };
}
