import { and, eq, gte, sql } from "drizzle-orm";

import { db } from "../../db";
import { sales } from "../../db/schema";
import {
  isTransientDbConnectionError,
  withDbRetry,
} from "../../utils/db/retry";
import { CreateOrUpdateOptions } from "./model";
import {
  FLOAT_TOLERANCE,
  getDayBucketStartUtc,
  normalizeUtcOffsetMinutes,
} from "./day-bucket";
import { SaleErrorCode, SaleServiceError } from "./errors";

export async function setDailySaleAmount(
  userId: string,
  amount: number,
  options?: CreateOrUpdateOptions,
) {
  try {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new SaleServiceError(
        SaleErrorCode.InvalidNonNegativeAmount,
        "amount must be a non-negative number",
      );
    }

    const referenceTime = options?.recordedAt ?? new Date();
    const utcOffsetMinutes = normalizeUtcOffsetMinutes(
      options?.utcOffsetMinutes,
    );
    const dayBucketCreatedAt = getDayBucketStartUtc(
      referenceTime,
      utcOffsetMinutes,
    );

    if (amount === 0) {
      const deletedRows = await withDbRetry(
        () =>
          db
            .delete(sales)
            .where(
              and(
                eq(sales.userId, userId),
                eq(sales.createdAt, dayBucketCreatedAt),
              ),
            )
            .returning(),
        { retries: 1, delayMs: 400 },
      );

      return {
        sale: null,
        deleted: deletedRows.length > 0,
      };
    }

    const [sale] = await withDbRetry(
      () =>
        db
          .insert(sales)
          .values({
            userId,
            amount,
            createdAt: dayBucketCreatedAt,
          })
          .onConflictDoUpdate({
            target: [sales.userId, sales.createdAt],
            set: {
              amount,
              updatedAt: new Date(),
            },
          })
          .returning(),
      { retries: 1, delayMs: 400 },
    );

    if (!sale) {
      throw new SaleServiceError(
        SaleErrorCode.FailedToSetDailySaleAmount,
        "Failed to set daily sale amount",
      );
    }

    return {
      sale,
      deleted: false,
    };
  } catch (error) {
    if (isTransientDbConnectionError(error)) {
      console.error(
        "Error setting daily sale amount: database connection timeout",
      );
      throw new SaleServiceError(
        SaleErrorCode.DatabaseConnectionTimeout,
        "Database connection timeout",
      );
    }

    console.error("Error setting daily sale amount:", error);
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
      throw new SaleServiceError(
        SaleErrorCode.InvalidPositiveAmount,
        "amountToDeduct must be a positive number",
      );
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
            .select({ id: sales.id })
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
        throw new SaleServiceError(
          SaleErrorCode.SaleDayBucketNotFound,
          "Sale day bucket not found",
        );
      }

      throw new SaleServiceError(
        SaleErrorCode.DeductionExceedsCurrentDailySales,
        "Deduction exceeds current daily sales",
      );
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
      throw new SaleServiceError(
        SaleErrorCode.DatabaseConnectionTimeout,
        "Database connection timeout",
      );
    }

    console.error("Error deducting from daily sale:", error);
    throw error;
  }
}
