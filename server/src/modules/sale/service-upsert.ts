import { sql } from "drizzle-orm";

import { db } from "../../db";
import { sales } from "../../db/schema";
import { CreateOrUpdateOptions } from "./model";
import { getDayBucketStartUtc, normalizeUtcOffsetMinutes } from "./day-bucket";
import { SaleErrorCode, SaleServiceError } from "./errors";

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

    if (!sale) {
      throw new SaleServiceError(
        SaleErrorCode.FailedToCreateOrUpdateSale,
        "Failed to create or update sale",
      );
    }

    return sale;
  } catch (error) {
    console.error("Error creating or updating sale:", error);
    throw error;
  }
}
