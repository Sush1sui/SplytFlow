import { db } from "../../db";
import { sales } from "../../db/schema";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { toUtcDay } from "../../utils";

const ZERO_EPSILON = 1e-9;

async function upsert(userId: string, amount: number, date?: Date | string) {
  try {
    const createdAt = toUtcDay(date);

    // Upsert is additive: amount is treated as a delta.
    if (Math.abs(amount) <= ZERO_EPSILON) {
      return getByUserId(userId, createdAt);
    }

    const result = await db
      .insert(sales)
      .values({ userId, amount, createdAt })
      .onConflictDoUpdate({
        target: [sales.userId, sales.createdAt],
        set: {
          amount: sql`${sales.amount} + EXCLUDED.amount`,
        },
      })
      .returning();

    const sale = result[0];

    if (!sale) {
      return null;
    }

    if (Math.abs(sale.amount) <= ZERO_EPSILON) {
      await db.delete(sales).where(eq(sales.id, sale.id));
      return null;
    }

    return sale;
  } catch (error) {
    console.error("Error creating sale:", error);
    throw new Error("An error occurred while creating the sale");
  }
}

async function update(userId: string, amount: number, date?: Date | string) {
  try {
    const createdAt = toUtcDay(date);

    // Update is replacement: amount is the final value for the day.
    if (Math.abs(amount) <= ZERO_EPSILON) {
      await db
        .delete(sales)
        .where(and(eq(sales.userId, userId), eq(sales.createdAt, createdAt)));
      return null;
    }

    const result = await db
      .insert(sales)
      .values({ userId, amount, createdAt })
      .onConflictDoUpdate({
        target: [sales.userId, sales.createdAt],
        set: {
          amount,
        },
      })
      .returning();

    return result[0] ?? null;
  } catch (error) {
    console.error("Error updating sale:", error);
    throw new Error("An error occurred while updating the sale");
  }
}

async function getByUserId(userId: string, date: Date | string) {
  try {
    const createdAt = toUtcDay(date);

    const result = await db
      .select()
      .from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.createdAt, createdAt)));

    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching sale:", error);
    throw new Error("An error occurred while fetching the sale");
  }
}

async function getByUserIdWithRange(
  userId: string,
  startDate: Date | string,
  endDate: Date | string,
) {
  try {
    const start = toUtcDay(startDate);
    const end = toUtcDay(endDate);

    if (start > end) {
      throw new Error("startDate cannot be after endDate");
    }

    return await db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, start),
          lte(sales.createdAt, end),
        ),
      )
      .orderBy(asc(sales.createdAt));
  } catch (error) {
    console.error("Error fetching sales by range:", error);
    throw new Error("An error occurred while fetching sales by range");
  }
}

async function deleteByUserId(id: string, userId: string) {
  try {
    const result = await db
      .delete(sales)
      .where(and(eq(sales.id, id), eq(sales.userId, userId)))
      .returning();
    return result[0] ?? null;
  } catch (error) {
    console.error("Error deleting sale:", error);
    throw new Error("An error occurred while deleting the sale");
  }
}

export default {
  upsert,
  update,
  getByUserId,
  getByUserIdWithRange,
  deleteByUserId,
};
