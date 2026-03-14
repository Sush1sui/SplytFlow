import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../db";
import { sales, splits } from "../../db/schema";
import {
  isTransientDbConnectionError,
  withDbRetry,
} from "../../utils/db/retry";

export async function createOrUpdate(userId: string, amount: number) {
  try {
    const now = new Date();

    const [sale] = await db
      .insert(sales)
      .values({ userId, amount, createdAt: now })
      .onConflictDoUpdate({
        target: [sales.userId, sales.createdAt],
        set: {
          amount: sql`${sales.amount} + ${amount}`,
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

export async function getSaleToday(userId: string) {
  try {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

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
