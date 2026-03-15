import { and, asc, eq, gte, lt, sql } from "drizzle-orm";

import { db } from "../../db";
import { sales, splitHistory } from "../../db/schema";
import {
  isTransientDbConnectionError,
  withDbRetry,
} from "../../utils/db/retry";
import {
  getDayBucketStartUtc,
  getDayRangeFromBucketStart,
  normalizeUtcOffsetMinutes,
} from "./day-bucket";
import { SaleErrorCode, SaleServiceError } from "./errors";

type SplitBreakdownItem = {
  name: string;
  value: number;
};

type SplitHistorySnapshot = {
  effectiveFrom: Date;
  totalSplitPct: number;
  breakdownJson: unknown;
  createdAt: Date;
};

type EffectiveSplitSnapshot = {
  totalSplitPct: number;
  breakdown: SplitBreakdownItem[];
};

type EffectiveSplitSnapshotResolved = EffectiveSplitSnapshot & {
  effectiveFrom: Date | null;
  historyIndex: number;
};

type SalesCsvExportRow = {
  date: string;
  salesAmount: number;
  moneyYouKeep: number;
  moneyDeducted: number;
  totalSplitPercentage: number;
  percentageYouKeep: number;
  splitDetails: string;
  splitActiveFrom: string;
};

const CSV_COLUMNS: string[] = [
  "Date",
  "Sales Amount",
  "Money You Keep",
  "Money Deducted",
  "Total Split Percentage",
  "Percentage You Keep",
  "Split Details",
  "Split Active From",
];

function toDateOnlyLabel(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toCsvSafeValue(raw: string): string {
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toMoney(value: number): string {
  return Number(value || 0).toFixed(2);
}

function toPercent(value: number): string {
  return Number(value || 0).toFixed(2);
}

function toSplitDetailsLabel(breakdown: SplitBreakdownItem[]): string {
  if (breakdown.length === 0) return "No split rules";

  return breakdown
    .map((item) => `${item.name}: ${toPercent(item.value)}%`)
    .join(" | ");
}

function buildSalesCsv(rows: SalesCsvExportRow[]): string {
  const lines: string[] = [];
  lines.push(CSV_COLUMNS.map((column) => toCsvSafeValue(column)).join(","));

  for (const row of rows) {
    lines.push(
      [
        toCsvSafeValue(row.date),
        toMoney(row.salesAmount),
        toMoney(row.moneyYouKeep),
        toMoney(row.moneyDeducted),
        toPercent(row.totalSplitPercentage),
        toPercent(row.percentageYouKeep),
        toCsvSafeValue(row.splitDetails),
        toCsvSafeValue(row.splitActiveFrom),
      ].join(","),
    );
  }

  return lines.join("\n");
}

function startOfUtcDay(value: Date): Date {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function addUtcDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * 24 * 60 * 60 * 1000);
}

function normalizeBreakdown(
  breakdown: SplitBreakdownItem[],
): SplitBreakdownItem[] {
  return [...breakdown].sort((a, b) => a.name.localeCompare(b.name));
}

function parseBreakdownSnapshot(raw: unknown): SplitBreakdownItem[] {
  if (!Array.isArray(raw)) return [];

  const parsed = raw
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("name" in item) ||
        !("value" in item)
      ) {
        return null;
      }

      const name = (item as { name: unknown }).name;
      const value = (item as { value: unknown }).value;
      if (typeof name !== "string" || typeof value !== "number") return null;

      return { name, value };
    })
    .filter((item): item is SplitBreakdownItem => item !== null);

  return normalizeBreakdown(parsed);
}

function getEffectiveSplitSnapshotAt(
  historyRows: SplitHistorySnapshot[],
  at: Date,
): EffectiveSplitSnapshotResolved {
  if (historyRows.length === 0) {
    return {
      totalSplitPct: 0,
      breakdown: [],
      effectiveFrom: null,
      historyIndex: -1,
    };
  }

  let low = 0;
  let high = historyRows.length - 1;
  let resolvedIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const row = historyRows[mid];

    if (!row) break;

    if (row.effectiveFrom.getTime() <= at.getTime()) {
      resolvedIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (resolvedIndex === -1) {
    return {
      totalSplitPct: 0,
      breakdown: [],
      effectiveFrom: null,
      historyIndex: -1,
    };
  }

  const row = historyRows[resolvedIndex];
  if (!row) {
    return {
      totalSplitPct: 0,
      breakdown: [],
      effectiveFrom: null,
      historyIndex: -1,
    };
  }

  return {
    totalSplitPct: row.totalSplitPct,
    breakdown: parseBreakdownSnapshot(row.breakdownJson),
    effectiveFrom: row.effectiveFrom,
    historyIndex: resolvedIndex,
  };
}

async function getSplitHistoryRows(userId: string) {
  return withDbRetry(
    () =>
      db
        .select({
          effectiveFrom: splitHistory.effectiveFrom,
          totalSplitPct: splitHistory.totalSplitPct,
          breakdownJson: splitHistory.breakdownJson,
          createdAt: splitHistory.createdAt,
        })
        .from(splitHistory)
        .where(eq(splitHistory.userId, userId))
        .orderBy(asc(splitHistory.effectiveFrom), asc(splitHistory.createdAt)),
    { retries: 1, delayMs: 400 },
  );
}

export async function getSaleToday(userId: string, utcOffsetMinutes?: number) {
  try {
    const now = new Date();
    const normalizedOffset = normalizeUtcOffsetMinutes(utcOffsetMinutes);

    const startOfDay = getDayBucketStartUtc(now, normalizedOffset);
    const { endOfDay } = getDayRangeFromBucketStart(startOfDay);

    const rows = await withDbRetry(
      () =>
        db
          .select({
            id: sales.id,
            userId: sales.userId,
            amount: sales.amount,
            createdAt: sales.createdAt,
            updatedAt: sales.updatedAt,
          })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.createdAt, startOfDay),
              lt(sales.createdAt, endOfDay),
            ),
          )
          .limit(1),
      { retries: 1, delayMs: 400 },
    );

    if (rows.length === 0) return { sales: [], net_sale: 0 };

    const historyRows = await getSplitHistoryRows(userId);
    const sale = rows[0];
    if (!sale) return { sales: [], net_sale: 0 };

    const effectiveSplit = getEffectiveSplitSnapshotAt(
      historyRows,
      sale.updatedAt,
    );
    const net_sale =
      sale.amount * (1 - (effectiveSplit.totalSplitPct ?? 0) / 100);

    return {
      sales: [sale],
      net_sale,
      split_breakdown: effectiveSplit.breakdown,
    };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error("Error getting sale today: database connection timeout");
      throw new SaleServiceError(
        SaleErrorCode.DatabaseConnectionTimeout,
        "Database connection timeout",
      );
    }

    console.error("Error getting sale today:", error);
    throw error;
  }
}

export async function getSalesByTimeRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const rows = await withDbRetry(
      () =>
        db
          .select({
            id: sales.id,
            userId: sales.userId,
            amount: sales.amount,
            createdAt: sales.createdAt,
            updatedAt: sales.updatedAt,
          })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.createdAt, startDate),
              lt(sales.createdAt, endDate),
            ),
          )
          .orderBy(asc(sales.createdAt)),
      { retries: 1, delayMs: 400 },
    );

    if (rows.length === 0)
      return { sales: [], net_sale: 0, split_breakdown: [] };

    const historyRows = await getSplitHistoryRows(userId);

    let net_sale = 0;
    const timelineByKey = new Map<
      string,
      {
        effectiveFrom: Date | null;
        totalSplitPct: number;
        breakdown: SplitBreakdownItem[];
        salesCount: number;
        firstUsedAt: number;
      }
    >();

    for (const sale of rows) {
      const effectiveSplitForNet = getEffectiveSplitSnapshotAt(
        historyRows,
        sale.updatedAt,
      );
      const effectiveSplitForTimeline = getEffectiveSplitSnapshotAt(
        historyRows,
        sale.createdAt,
      );

      net_sale +=
        sale.amount * (1 - (effectiveSplitForNet.totalSplitPct ?? 0) / 100);

      const key =
        effectiveSplitForTimeline.historyIndex >= 0
          ? `history-${effectiveSplitForTimeline.historyIndex}`
          : "fallback";

      const existing = timelineByKey.get(key);
      if (existing) {
        existing.salesCount += 1;
        continue;
      }

      timelineByKey.set(key, {
        effectiveFrom: effectiveSplitForTimeline.effectiveFrom,
        totalSplitPct: effectiveSplitForTimeline.totalSplitPct,
        breakdown: effectiveSplitForTimeline.breakdown,
        salesCount: 1,
        firstUsedAt: sale.createdAt.getTime(),
      });
    }

    const split_breakdown_timeline = [...timelineByKey.values()]
      .sort((a, b) => a.firstUsedAt - b.firstUsedAt)
      .map((item) => ({
        effectiveFrom: item.effectiveFrom,
        totalSplitPct: item.totalSplitPct,
        breakdown: item.breakdown,
        salesCount: item.salesCount,
      }));

    const saleRows = rows;
    const contextSale = saleRows[saleRows.length - 1];
    const contextTimestamp = contextSale?.updatedAt ?? endDate;
    const contextSplit = getEffectiveSplitSnapshotAt(
      historyRows,
      contextTimestamp,
    );

    return {
      sales: saleRows,
      net_sale,
      split_breakdown: contextSplit.breakdown,
      split_breakdown_timeline,
    };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error(
        "Error getting sales by time range: database connection timeout",
      );
      throw new SaleServiceError(
        SaleErrorCode.DatabaseConnectionTimeout,
        "Database connection timeout",
      );
    }

    console.error("Error getting sales by time range:", error);
    throw error;
  }
}

export async function getTotalSalesByTimeRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const result = await db
      .select({ total: sql<number>`SUM(${sales.amount})` })
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, startDate),
          lt(sales.createdAt, endDate),
        ),
      );
    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error getting total sales by time range:", error);
    throw error;
  }
}

export async function getSalesCsvByTimeRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  try {
    const rows = await withDbRetry(
      () =>
        db
          .select({
            amount: sales.amount,
            createdAt: sales.createdAt,
          })
          .from(sales)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.createdAt, startDate),
              lt(sales.createdAt, endDate),
            ),
          )
          .orderBy(asc(sales.createdAt)),
      { retries: 1, delayMs: 400 },
    );

    const historyRows = await getSplitHistoryRows(userId);
    const dayAmountMap = new Map<string, number>();

    for (const row of rows) {
      const key = toDateOnlyLabel(startOfUtcDay(row.createdAt));
      dayAmountMap.set(key, Number(row.amount) || 0);
    }

    const csvRows: SalesCsvExportRow[] = [];
    let dayCursor = startOfUtcDay(startDate);
    const dayEnd = startOfUtcDay(endDate);

    while (dayCursor.getTime() < dayEnd.getTime()) {
      const dayKey = toDateOnlyLabel(dayCursor);
      const salesAmount = dayAmountMap.get(dayKey) ?? 0;

      const snapshot = getEffectiveSplitSnapshotAt(historyRows, dayCursor);
      const totalSplitPercentage = snapshot.totalSplitPct ?? 0;
      const percentageYouKeep = Math.max(0, 100 - totalSplitPercentage);
      const moneyDeducted = salesAmount * (totalSplitPercentage / 100);
      const moneyYouKeep = salesAmount - moneyDeducted;

      csvRows.push({
        date: dayKey,
        salesAmount,
        moneyYouKeep,
        moneyDeducted,
        totalSplitPercentage,
        percentageYouKeep,
        splitDetails: toSplitDetailsLabel(snapshot.breakdown),
        splitActiveFrom: snapshot.effectiveFrom
          ? toDateOnlyLabel(startOfUtcDay(snapshot.effectiveFrom))
          : "No split history yet",
      });

      dayCursor = addUtcDays(dayCursor, 1);
    }

    return buildSalesCsv(csvRows);
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error(
        "Error exporting sales CSV by time range: database connection timeout",
      );
      throw new SaleServiceError(
        SaleErrorCode.DatabaseConnectionTimeout,
        "Database connection timeout",
      );
    }

    console.error("Error exporting sales CSV by time range:", error);
    throw error;
  }
}
