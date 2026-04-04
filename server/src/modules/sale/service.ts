import { db } from "../../db";
import { sales } from "../../db/schema";
import { and, asc, eq, gte, lt, sql } from "drizzle-orm";
import {
  getDateValidationMessage,
  getLocalDateStringInTimeZone,
  getLocalTimeStringInTimeZone,
  toUtcFromLocalDateTimeAndTimeZone,
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

function getLocalDayUtcBounds(localDate: string, timeZone: string) {
  const start = toUtcFromLocalDateAndTimeZone(localDate, timeZone);
  const nextLocalDate = shiftDays(localDate, 1);
  const endExclusive = toUtcFromLocalDateAndTimeZone(nextLocalDate, timeZone);
  return { start, endExclusive };
}

async function upsert(
  userId: string,
  amount: number,
  originalAmount: number,
  currencyCode: string,
  timeZone: string,
  localDate?: string,
  localTime?: string,
) {
  try {
    const effectiveLocalDate =
      localDate ?? getLocalDateStringInTimeZone(timeZone);
    const effectiveLocalTime =
      localTime ?? getLocalTimeStringInTimeZone(timeZone);
    const createdAt = toUtcFromLocalDateTimeAndTimeZone(
      effectiveLocalDate,
      effectiveLocalTime,
      timeZone,
    );

    // amount is treated as a delta.
    if (Math.abs(amount) <= ZERO_EPSILON) {
      return getByUserId(userId, effectiveLocalDate, timeZone, currencyCode);
    }

    const { start, endExclusive } = getLocalDayUtcBounds(
      effectiveLocalDate,
      timeZone,
    );

    const existingRows = await db
      .select()
      .from(sales)
      .where(
        and(
          eq(sales.userId, userId),
          eq(sales.currencyCode, currencyCode),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        ),
      )
      .orderBy(asc(sales.createdAt))
      .limit(1);

    const existing = existingRows[0];

    const result = existing
      ? await db
          .update(sales)
          .set({
            amount: sql`${sales.amount} + ${amount}`,
            originalAmount: sql`${sales.originalAmount} + ${originalAmount}`,
          })
          .where(and(eq(sales.id, existing.id), eq(sales.userId, userId)))
          .returning()
      : await db
          .insert(sales)
          .values({
            userId,
            amount,
            originalAmount,
            currencyCode,
            createdAt,
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

async function update(
  id: string,
  userId: string,
  amount: number,
  originalAmount: number,
  currencyCode: string,
) {
  try {
    if (Math.abs(amount) <= ZERO_EPSILON) {
      await db
        .delete(sales)
        .where(and(eq(sales.id, id), eq(sales.userId, userId)));
      return null;
    }

    const result = await db
      .update(sales)
      .set({ amount, originalAmount, currencyCode })
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
  currencyCode?: string,
) {
  try {
    const { start, endExclusive } = getLocalDayUtcBounds(localDate, timeZone);

    const whereClause = currencyCode
      ? and(
          eq(sales.userId, userId),
          eq(sales.currencyCode, currencyCode),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        )
      : and(
          eq(sales.userId, userId),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        );

    const result = await db
      .select()
      .from(sales)
      .where(whereClause)
      .orderBy(asc(sales.createdAt))
      .limit(1);

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
  currencyCode?: string,
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

    const whereClause = currencyCode
      ? and(
          eq(sales.userId, userId),
          eq(sales.currencyCode, currencyCode),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        )
      : and(
          eq(sales.userId, userId),
          gte(sales.createdAt, start),
          lt(sales.createdAt, endExclusive),
        );

    return await db
      .select()
      .from(sales)
      .where(whereClause)
      .orderBy(asc(sales.createdAt));
  } catch (error) {
    if (getDateValidationMessage(error)) {
      throw error;
    }

    console.error("Error fetching sales by range:", error);
    throw new Error("An error occurred while fetching sales by range");
  }
}

async function getAllByUserId(userId: string, currencyCode?: string) {
  try {
    const whereClause = currencyCode
      ? and(eq(sales.userId, userId), eq(sales.currencyCode, currencyCode))
      : eq(sales.userId, userId);

    return await db
      .select()
      .from(sales)
      .where(whereClause)
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
