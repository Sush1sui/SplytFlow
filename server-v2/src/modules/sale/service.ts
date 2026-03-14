import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../db";
import { sales, splits } from "../../db/schema";
import {
  isTransientDbConnectionError,
  withDbRetry,
} from "../../utils/db/retry";
import { CreateOrUpdateOptions } from "./model";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_UTC_OFFSET_MINUTES = 14 * 60;
const FLOAT_TOLERANCE = 1e-9;

function normalizeUtcOffsetMinutes(offset?: number) {
  if (!Number.isFinite(offset)) return 0;
  return Math.max(
    -MAX_UTC_OFFSET_MINUTES,
    Math.min(MAX_UTC_OFFSET_MINUTES, Math.trunc(offset as number)),
  );
}

function getDayBucketStartUtc(reference: Date, utcOffsetMinutes: number) {
  const offsetMs = utcOffsetMinutes * 60 * 1000;
  const localMs = reference.getTime() + offsetMs;
  const localDayStartMs = Math.floor(localMs / DAY_MS) * DAY_MS;
  return new Date(localDayStartMs - offsetMs);
}

export async function createOrUpdate(
  userId: string,
  amount: number,
  options?: CreateOrUpdateOptions,
) {
  try {
    const referenceTime = options?.recordedAt ?? new Date();
    const utcOffsetMinutes = normalizeUtcOffsetMinutes(
      options?.utcOffsetMinutes,
    );

    // Daily aggregation key: start of user's local day, represented in UTC.
    const dayBucketCreatedAt = getDayBucketStartUtc(
      referenceTime,
      utcOffsetMinutes,
    );

    const [sale] = await db
      .insert(sales)
      .values({ userId, amount, createdAt: dayBucketCreatedAt })
      .onConflictDoUpdate({
        target: [sales.userId, sales.createdAt],
        set: {
          amount: sql`${sales.amount} + ${amount}`,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (!sale) throw new Error("Failed to create or update sale");
    return sale;
  } catch (error) {
    console.error("Error creating or updating sale:", error);
    throw error;
  }
}

export async function deductFromDailySale(
  userId: string,
  amountToDeduct: number,
  options?: CreateOrUpdateOptions,
) {
  try {
    if (!Number.isFinite(amountToDeduct) || amountToDeduct <= 0) {
      throw new Error("amountToDeduct must be a positive number");
    }

    const referenceTime = options?.recordedAt ?? new Date();
    const utcOffsetMinutes = normalizeUtcOffsetMinutes(
      options?.utcOffsetMinutes,
    );
    const dayBucketCreatedAt = getDayBucketStartUtc(
      referenceTime,
      utcOffsetMinutes,
    );

    const guardedThreshold = amountToDeduct - FLOAT_TOLERANCE;

    // Atomic mutation: this update succeeds only if the bucket exists and has
    // enough amount, preventing concurrent over-deductions.
    const [updatedSale] = await withDbRetry(
      () =>
        db
          .update(sales)
          .set({
            amount: sql`${sales.amount} - ${amountToDeduct}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(sales.userId, userId),
              eq(sales.createdAt, dayBucketCreatedAt),
              gte(sales.amount, guardedThreshold),
            ),
          )
          .returning(),
      { retries: 1, delayMs: 400 },
    );

    if (!updatedSale) {
      const [existingSale] = await withDbRetry(
        () =>
          db
            .select({
              id: sales.id,
            })
            .from(sales)
            .where(
              and(
                eq(sales.userId, userId),
                eq(sales.createdAt, dayBucketCreatedAt),
              ),
            )
            .limit(1),
        { retries: 1, delayMs: 400 },
      );

      if (!existingSale) {
        throw new Error("Sale day bucket not found");
      }

      throw new Error("Deduction exceeds current daily sales");
    }

    if (Math.abs(Number(updatedSale.amount)) <= FLOAT_TOLERANCE) {
      await withDbRetry(
        () =>
          db
            .delete(sales)
            .where(and(eq(sales.id, updatedSale.id), eq(sales.userId, userId)))
            .returning(),
        { retries: 1, delayMs: 400 },
      );

      return { sale: null, deleted: true };
    }

    return { sale: updatedSale, deleted: false };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error(
        "Error deducting from daily sale: database connection timeout",
      );
      throw new Error("Database connection timeout");
    }

    console.error("Error deducting from daily sale:", error);
    throw error;
  }
}

export async function getSaleToday(userId: string, utcOffsetMinutes?: number) {
  try {
    const now = new Date();
    const normalizedOffset = normalizeUtcOffsetMinutes(utcOffsetMinutes);

    const startOfDay = getDayBucketStartUtc(now, normalizedOffset);
    const endOfDay = new Date(startOfDay.getTime() + DAY_MS);

    // Single query: fetch today's sale and the user's total split % in one go
    const splitsTotal = db
      .select({
        totalPct: sql<number>`COALESCE(SUM(${splits.value}), 0)`.as("totalPct"),
      })
      .from(splits)
      .where(eq(splits.userId, userId))
      .as("splits_total");

    const rows = await withDbRetry(
      () =>
        db
          .select({
            id: sales.id,
            userId: sales.userId,
            amount: sales.amount,
            createdAt: sales.createdAt,
            updatedAt: sales.updatedAt,
            _totalPct: splitsTotal.totalPct,
          })
          .from(sales)
          .crossJoin(splitsTotal)
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

    const { _totalPct, ...sale } = rows[0];
    const net_sale = sale.amount * (1 - (_totalPct ?? 0) / 100);

    return { sales: [sale], net_sale };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error("Error getting sale today: database connection timeout");
      throw new Error("Database connection timeout");
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
    // Single query: fetch all sales in range + compute net_sale using cross-joined splits total
    const splitsTotal = db
      .select({
        totalPct: sql<number>`COALESCE(SUM(${splits.value}), 0)`.as("totalPct"),
      })
      .from(splits)
      .where(eq(splits.userId, userId))
      .as("splits_total");

    const rows = await withDbRetry(
      () =>
        db
          .select({
            id: sales.id,
            userId: sales.userId,
            amount: sales.amount,
            createdAt: sales.createdAt,
            updatedAt: sales.updatedAt,
            _totalPct: splitsTotal.totalPct,
            _totalAmount: sql<number>`SUM(${sales.amount}) OVER ()`.as(
              "totalAmount",
            ),
          })
          .from(sales)
          .crossJoin(splitsTotal)
          .where(
            and(
              eq(sales.userId, userId),
              gte(sales.createdAt, startDate),
              lt(sales.createdAt, endDate),
            ),
          ),
      { retries: 1, delayMs: 400 },
    );

    if (rows.length === 0) return { sales: [], net_sale: 0 };

    const totalAmount = rows[0]._totalAmount ?? 0;
    const totalPct = rows[0]._totalPct ?? 0;
    const net_sale = totalAmount * (1 - totalPct / 100);
    const saleRows = rows.map(({ _totalPct, _totalAmount, ...sale }) => sale);

    return { sales: saleRows, net_sale };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error(
        "Error getting sales by time range: database connection timeout",
      );
      throw new Error("Database connection timeout");
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

export async function deleteSaleById(userId: string, date: Date) {
  try {
    const deletedSale = await db
      .delete(sales)
      .where(and(eq(sales.userId, userId), eq(sales.createdAt, date)))
      .returning();

    if (!deletedSale) throw new Error("Sale not found");

    return deletedSale;
  } catch (error) {
    console.error("Error deleting sale by id:", error);
    throw error;
  }
}

export async function deleteSalesById(userId: string, salesIds: string[]) {
  try {
    const deletedSales = await db
      .delete(sales)
      .where(and(eq(sales.userId, userId), inArray(sales.id, salesIds)))
      .returning();

    return deletedSales;
  } catch (error) {
    console.error("Error deleting sales by id:", error);
    throw error;
  }
}
