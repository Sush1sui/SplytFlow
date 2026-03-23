import { db } from "../../db";
import { sales } from "../../db/schema";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import {
  getDateValidationMessage,
  getLocalDateStringInTimeZone,
  toUtcFromLocalDateAndTimeZone,
} from "../../utils";

const ZERO_EPSILON = 1e-9;

function toIsoDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDays(localDate: string, days: number) {
  const shifted = new Date(`${localDate}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return toIsoDateOnly(shifted);
}

async function upsert(userId: string, amount: number, timeZone: string) {
  try {
    const effectiveLocalDate = getLocalDateStringInTimeZone(timeZone);
    const createdAt = toUtcFromLocalDateAndTimeZone(
      effectiveLocalDate,
      timeZone,
    );

    // amount is treated as a delta.
    if (Math.abs(amount) <= ZERO_EPSILON) {
      return getByUserId(userId, effectiveLocalDate, timeZone);
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
    if (getDateValidationMessage(error)) {
      throw error;
    }

    console.error("Error creating sale:", error);
    throw new Error("An error occurred while creating the sale");
  }
}

async function update(id: string, userId: string, amount: number) {
  try {
    if (Math.abs(amount) <= ZERO_EPSILON) {
      await db
        .delete(sales)
        .where(and(eq(sales.id, id), eq(sales.userId, userId)));
      return null;
    }

    const result = await db
      .update(sales)
      .set({ amount })
      .where(and(eq(sales.id, id), eq(sales.userId, userId)))
      .returning();

    return result[0] ?? null;
  } catch (error) {
    if (getDateValidationMessage(error)) {
      throw error;
    }

    console.error("Error updating sale:", error);
    throw new Error("An error occurred while updating the sale");
  }
}

async function getById(id: string) {
  try {
    const result = await db.select().from(sales).where(eq(sales.id, id));
    return result[0] ?? null;
  } catch (error) {
    console.error("Error fetching sale by ID:", error);
    throw new Error("An error occurred while fetching the sale");
  }
}

async function getByUserId(
  userId: string,
  localDate: string,
  timeZone: string,
) {
  try {
    const createdAt = toUtcFromLocalDateAndTimeZone(localDate, timeZone);

    const result = await db
      .select()
      .from(sales)
      .where(and(eq(sales.userId, userId), eq(sales.createdAt, createdAt)));

    return result[0] ?? null;
  } catch (error) {
    if (getDateValidationMessage(error)) {
      throw error;
    }

    console.error("Error fetching sale:", error);
    throw new Error("An error occurred while fetching the sale");
  }
}

async function getByUserIdWithRange(
  userId: string,
  startLocalDate: string,
  endLocalDate: string,
  timeZone: string,
) {
  try {
    const start = toUtcFromLocalDateAndTimeZone(startLocalDate, timeZone);
    const endExclusiveLocalDate = shiftDays(endLocalDate, 1);
    const endExclusive = toUtcFromLocalDateAndTimeZone(
      endExclusiveLocalDate,
      timeZone,
    );

    if (start >= endExclusive) {
      throw new Error("startLocalDate cannot be after endLocalDate");
    }

    return await db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        ),
      )
      .orderBy(asc(sales.createdAt));
  } catch (error) {
    if (getDateValidationMessage(error)) {
      throw error;
    }

    console.error("Error fetching sales by range:", error);
    throw new Error("An error occurred while fetching sales by range");
  }
}

async function getAllByUserId(userId: string) {
  try {
    return await db
      .select()
      .from(sales)
      .where(eq(sales.userId, userId))
      .orderBy(asc(sales.createdAt));
  } catch (error) {
    console.error("Error fetching sales:", error);
    throw new Error("An error occurred while fetching sales");
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
  getById,
  getAllByUserId,
  getByUserId,
  getByUserIdWithRange,
  deleteByUserId,
};
