import { eq, and, ne, sql } from "drizzle-orm";
import { db } from "../../db";
import { splits } from "../../db/schema";

export class SplitLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitLimitExceededError";
  }
}

const MAX_TOTAL_SPLIT = 100;

export async function upsert(userId: string, name: string, value: number) {
  return db.transaction(async (tx) => {
    // Sum all existing splits for this user, excluding the one being upserted
    // so that an update doesn't double-count the current value
    const [{ otherTotal }] = await tx
      .select({
        otherTotal: sql<number>`COALESCE(SUM(${splits.value}), 0)`,
      })
      .from(splits)
      .where(and(eq(splits.userId, userId), ne(splits.name, name)));

    if (otherTotal + value > MAX_TOTAL_SPLIT) {
      throw new SplitLimitExceededError(
        `Total split percentage would exceed ${MAX_TOTAL_SPLIT}% (other splits: ${otherTotal}%, requested: ${value}%)`,
      );
    }

    const [split] = await tx
      .insert(splits)
      .values({ userId, name, value })
      .onConflictDoUpdate({
        target: [splits.userId, splits.name],
        set: { name, value },
      })
      .returning();

    if (!split) throw new Error("Failed to upsert split");
    return split;
  });
}

export async function getSplitsByUserId(userId: string) {
  try {
    const result = await db.query.splits.findMany({
      where: eq(splits.userId, userId),
    });
    return result;
  } catch (error) {
    console.error("Error getting splits by userId:", error);
    throw error;
  }
}

export async function deleteSplitByName(userId: string, name: string) {
  try {
    const deletedSplit = await db
      .delete(splits)
      .where(and(eq(splits.userId, userId), eq(splits.name, name)))
      .returning();
    if (!deletedSplit) throw new Error("Split not found");
    return deletedSplit;
  } catch (error) {
    console.error("Error deleting split by name:", error);
    throw error;
  }
}

export async function deleteAllSplitsByUserId(userId: string) {
  try {
    const deletedSplits = await db
      .delete(splits)
      .where(eq(splits.userId, userId))
      .returning();
    return deletedSplits;
  } catch (error) {
    console.error("Error deleting all splits by userId:", error);
    throw error;
  }
}
