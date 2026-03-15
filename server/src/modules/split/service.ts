import { eq, and, ne, sql, desc } from "drizzle-orm";
import { db } from "../../db";
import { splitHistory, splits } from "../../db/schema";

export class SplitLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitLimitExceededError";
  }
}

const MAX_TOTAL_SPLIT = 100;
const SPLIT_COMPARISON_EPSILON = 1e-9;

type SplitBreakdownSnapshotItem = {
  name: string;
  value: number;
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function normalizeBreakdown(
  breakdown: SplitBreakdownSnapshotItem[],
): SplitBreakdownSnapshotItem[] {
  return [...breakdown].sort((a, b) => a.name.localeCompare(b.name));
}

function parseBreakdownSnapshot(raw: unknown): SplitBreakdownSnapshotItem[] {
  if (!Array.isArray(raw)) return [];

  const items = raw
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
    .filter((item): item is SplitBreakdownSnapshotItem => item !== null);

  return normalizeBreakdown(items);
}

function numbersAreEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= SPLIT_COMPARISON_EPSILON;
}

function breakdownsAreEqual(
  left: SplitBreakdownSnapshotItem[],
  right: SplitBreakdownSnapshotItem[],
): boolean {
  if (left.length !== right.length) return false;

  return left.every((item, index) => {
    const other = right[index];
    if (!other) return false;
    return item.name === other.name && numbersAreEqual(item.value, other.value);
  });
}

async function appendSplitHistorySnapshot(tx: Transaction, userId: string) {
  const currentSplits = await tx
    .select({ name: splits.name, value: splits.value })
    .from(splits)
    .where(eq(splits.userId, userId));

  const nextBreakdown = normalizeBreakdown(currentSplits);
  const nextTotalSplitPct = nextBreakdown.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const [latestSnapshot] = await tx
    .select({
      totalSplitPct: splitHistory.totalSplitPct,
      breakdownJson: splitHistory.breakdownJson,
    })
    .from(splitHistory)
    .where(eq(splitHistory.userId, userId))
    .orderBy(desc(splitHistory.effectiveFrom), desc(splitHistory.createdAt))
    .limit(1);

  if (latestSnapshot) {
    const latestBreakdown = parseBreakdownSnapshot(
      latestSnapshot.breakdownJson,
    );
    if (
      numbersAreEqual(latestSnapshot.totalSplitPct, nextTotalSplitPct) &&
      breakdownsAreEqual(latestBreakdown, nextBreakdown)
    ) {
      return;
    }
  }

  await tx.insert(splitHistory).values({
    userId,
    totalSplitPct: nextTotalSplitPct,
    breakdownJson: nextBreakdown,
  });
}

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
    await appendSplitHistorySnapshot(tx, userId);
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
    return db.transaction(async (tx) => {
      const deletedSplit = await tx
        .delete(splits)
        .where(and(eq(splits.userId, userId), eq(splits.name, name)))
        .returning();

      if (deletedSplit.length === 0) return null;

      await appendSplitHistorySnapshot(tx, userId);
      return deletedSplit;
    });
  } catch (error) {
    console.error("Error deleting split by name:", error);
    throw error;
  }
}

export async function deleteAllSplitsByUserId(userId: string) {
  try {
    return db.transaction(async (tx) => {
      const deletedSplits = await tx
        .delete(splits)
        .where(eq(splits.userId, userId))
        .returning();

      await appendSplitHistorySnapshot(tx, userId);
      return deletedSplits;
    });
  } catch (error) {
    console.error("Error deleting all splits by userId:", error);
    throw error;
  }
}
