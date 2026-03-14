import * as SecureStore from "expo-secure-store";

import type { RecentSaleLog } from "@/components/tabs/home/types";

export const RECENT_SALES_RETENTION_DAYS = 7;
const RECENT_SALES_RETENTION_MS =
  RECENT_SALES_RETENTION_DAYS * 24 * 60 * 60 * 1000;
const RECENT_SALES_KEY_PREFIX = "recent_sales";

const getRecentSalesKey = (userId: string) =>
  `${RECENT_SALES_KEY_PREFIX}_${userId}`;

const parseRecentSalesLogs = (raw: string | null): RecentSaleLog[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is RecentSaleLog => {
      const maybe = item as Partial<RecentSaleLog>;
      return (
        typeof maybe?.id === "string" &&
        typeof maybe?.amount === "number" &&
        typeof maybe?.createdAt === "string"
      );
    });
  } catch {
    return [];
  }
};

const pruneExpiredRecentSalesLogs = (
  items: RecentSaleLog[],
  nowMs = Date.now(),
): RecentSaleLog[] => {
  const cutoffMs = nowMs - RECENT_SALES_RETENTION_MS;
  return items.filter((sale) => {
    const createdAtMs = new Date(sale.createdAt).getTime();
    if (Number.isNaN(createdAtMs)) {
      return false;
    }
    return createdAtMs >= cutoffMs;
  });
};

const isSameLocalDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const readRecentSalesLogs = async (
  userId: string,
): Promise<RecentSaleLog[]> => {
  const raw = await SecureStore.getItemAsync(getRecentSalesKey(userId));
  const parsed = parseRecentSalesLogs(raw);
  const pruned = pruneExpiredRecentSalesLogs(parsed);

  if (pruned.length !== parsed.length) {
    await SecureStore.setItemAsync(
      getRecentSalesKey(userId),
      JSON.stringify(pruned),
    );
  }

  return pruned;
};

export const writeRecentSalesLogs = async (
  userId: string,
  items: RecentSaleLog[],
) => {
  const pruned = pruneExpiredRecentSalesLogs(items);
  await SecureStore.setItemAsync(
    getRecentSalesKey(userId),
    JSON.stringify(pruned),
  );
};

export const getRecentSalesDaySummary = async (
  userId: string,
  targetDate: Date,
): Promise<{ count: number; totalAmount: number }> => {
  const existing = await readRecentSalesLogs(userId);
  const sameDay = existing.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    if (Number.isNaN(saleDate.getTime())) {
      return false;
    }
    return isSameLocalDay(saleDate, targetDate);
  });

  return {
    count: sameDay.length,
    totalAmount: sameDay.reduce(
      (sum, sale) => sum + (Number(sale.amount) || 0),
      0,
    ),
  };
};

export const removeRecentSalesLogsForLocalDay = async (
  userId: string,
  targetDate: Date,
): Promise<{ removed: number; remaining: RecentSaleLog[] }> => {
  const existing = await readRecentSalesLogs(userId);
  const remaining = existing.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    if (Number.isNaN(saleDate.getTime())) {
      return true;
    }
    return !isSameLocalDay(saleDate, targetDate);
  });

  await writeRecentSalesLogs(userId, remaining);

  return {
    removed: Math.max(0, existing.length - remaining.length),
    remaining,
  };
};
