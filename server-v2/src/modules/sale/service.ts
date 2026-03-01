import { and, eq, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "../../db";
import { sales } from "../../db/schema";

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

    const sale = await db.query.sales.findFirst({
      where: and(
        eq(sales.userId, userId),
        gte(sales.createdAt, startOfDay),
        lt(sales.createdAt, endOfDay),
      ),
    });
    return sale;
  } catch (error) {
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
    const result = await db.query.sales.findMany({
      where: and(
        eq(sales.userId, userId),
        gte(sales.createdAt, startDate),
        lt(sales.createdAt, endDate),
      ),
    });
    return result;
  } catch (error) {
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
