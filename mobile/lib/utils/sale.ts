import * as SecureStore from "expo-secure-store";
import {
  RecentLogType,
  SaleRow,
  SalesRangePreset,
  SalesRangeQuery,
} from "@/types/sale.types";

const RECENT_LOGS_KEY = process.env.EXPO_PUBLIC_RECENT_LOGS_KEY;
if (!RECENT_LOGS_KEY)
  throw new Error(
    "EXPO_PUBLIC_RECENT_LOGS_KEY environment variable is required and cannot be empty",
  );

export async function loadRecentLogs(): Promise<RecentLogType[]> {
  if (!RECENT_LOGS_KEY)
    throw new Error(
      "EXPO_PUBLIC_RECENT_LOGS_KEY environment variable is required",
    );
  const raw = await SecureStore.getItemAsync(RECENT_LOGS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as RecentLogType[];
    return [...parsed].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (error) {
    await SecureStore.deleteItemAsync(RECENT_LOGS_KEY);
    return [];
  }
}

export async function saveRecentLogs(logs: RecentLogType[]): Promise<void> {
  if (!RECENT_LOGS_KEY)
    throw new Error(
      "EXPO_PUBLIC_RECENT_LOGS_KEY environment variable is required",
    );

  await SecureStore.setItemAsync(RECENT_LOGS_KEY, JSON.stringify(logs));
}

export async function addRecentLog(newLog: RecentLogType): Promise<void> {
  const logs = await loadRecentLogs();
  const updated = [...logs, newLog].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  await saveRecentLogs(updated);
}

export async function clearRecentLogs(): Promise<void> {
  if (!RECENT_LOGS_KEY)
    throw new Error(
      "EXPO_PUBLIC_RECENT_LOGS_KEY environment variable is required",
    );
  await SecureStore.deleteItemAsync(RECENT_LOGS_KEY);
}

export async function removeRecentLogByIndex(index: number): Promise<void> {
  const logs = await loadRecentLogs();
  if (index < 0 || index >= logs.length) return;
  const updated = [...logs];
  updated.splice(index, 1);
  await saveRecentLogs(updated);
}

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = padTwo(date.getMonth() + 1);
  const day = padTwo(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function shiftLocalDate(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

export function getSalesRangeQueryByPreset(
  preset: SalesRangePreset,
  baseDate = new Date(),
): SalesRangeQuery {
  const timeZone = getLocalTimeZone();

  const rangeOffsetsByPreset: Record<
    SalesRangePreset,
    { startOffsetDays: number; endOffsetDays: number }
  > = {
    today: { startOffsetDays: 0, endOffsetDays: 0 },
    "1d": { startOffsetDays: -1, endOffsetDays: -1 },
    "2d": { startOffsetDays: -2, endOffsetDays: -2 },
    "1w": { startOffsetDays: -7, endOffsetDays: -7 },
    "1m": { startOffsetDays: -30, endOffsetDays: -30 },
    "3m": { startOffsetDays: -90, endOffsetDays: -90 },
    "1y": { startOffsetDays: -365, endOffsetDays: -365 },
    "7d": { startOffsetDays: -6, endOffsetDays: 0 },
    prev7d: { startOffsetDays: -13, endOffsetDays: -7 },
    "30d": { startOffsetDays: -29, endOffsetDays: 0 },
    prev30d: { startOffsetDays: -59, endOffsetDays: -30 },
    "90d": { startOffsetDays: -89, endOffsetDays: 0 },
    prev90d: { startOffsetDays: -179, endOffsetDays: -90 },
    "365d": { startOffsetDays: -364, endOffsetDays: 0 },
    prev365d: { startOffsetDays: -729, endOffsetDays: -365 },
  };

  const { startOffsetDays, endOffsetDays } = rangeOffsetsByPreset[preset];

  const startLocalDate = getLocalDateString(
    shiftLocalDate(baseDate, startOffsetDays),
  );
  const endLocalDate = getLocalDateString(
    shiftLocalDate(baseDate, endOffsetDays),
  );

  return {
    startLocalDate,
    endLocalDate,
    timeZone,
  };
}

export function sumSaleRows(rows: SaleRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

export function computeNetSale(sale: number, splitTotalPct: number): number {
  return sale - (sale * splitTotalPct) / 100;
}

export function computePercentChange(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    if (current === 0) return 0;
    return 100; // 100% growth from zero baseline
  }

  return ((current - previous) / Math.abs(previous)) * 100;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const timeZone = getLocalTimeZone();
  try {
    return date.toLocaleString(timeZone, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

export function formatDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}
