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
): EffectiveSplitSnapshot {
  if (historyRows.length === 0) {
    return { totalSplitPct: 0, breakdown: [] };
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
    return { totalSplitPct: 0, breakdown: [] };
  }

  const row = historyRows[resolvedIndex];
  if (!row) {
    return { totalSplitPct: 0, breakdown: [] };
  }

  return {
    totalSplitPct: row.totalSplitPct,
    breakdown: parseBreakdownSnapshot(row.breakdownJson),
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

    const net_sale = rows.reduce((sum, sale) => {
      const effectiveSplit = getEffectiveSplitSnapshotAt(
        historyRows,
        sale.updatedAt,
      );
      return (
        sum + sale.amount * (1 - (effectiveSplit.totalSplitPct ?? 0) / 100)
      );
    }, 0);

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
