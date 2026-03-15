import { asc, desc, eq } from "drizzle-orm";

import { db } from "../../db";
import { splitHistory, splits } from "../../db/schema";

const SPLIT_COMPARISON_EPSILON = 1e-9;

export type SplitBreakdownSnapshotItem = {
  name: string;
  value: number;
};

export type SplitHistorySource =
  | "live"
  | "correction_start"
  | "correction_restore";

export type EffectiveSplitSnapshot = {
  totalSplitPct: number;
  breakdown: SplitBreakdownSnapshotItem[];
};

export type SplitHistoryLookupRow = {
  effectiveFrom: Date;
  totalSplitPct: number;
  breakdownJson: unknown;
  createdAt: Date;
};

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function normalizeBreakdown(
  breakdown: SplitBreakdownSnapshotItem[],
): SplitBreakdownSnapshotItem[] {
  return [...breakdown].sort((a, b) => a.name.localeCompare(b.name));
}

export function parseBreakdownSnapshot(
  raw: unknown,
): SplitBreakdownSnapshotItem[] {
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

export function numbersAreEqual(a: number, b: number): boolean {
  return Math.abs(a - b) <= SPLIT_COMPARISON_EPSILON;
}

export function breakdownsAreEqual(
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

export function snapshotsAreEqual(
  left: EffectiveSplitSnapshot,
  right: EffectiveSplitSnapshot,
): boolean {
  return (
    numbersAreEqual(left.totalSplitPct, right.totalSplitPct) &&
    breakdownsAreEqual(left.breakdown, right.breakdown)
  );
}

export function getEffectiveSplitSnapshotAt(
  rows: SplitHistoryLookupRow[],
  at: Date,
): EffectiveSplitSnapshot {
  if (rows.length === 0) {
    return { totalSplitPct: 0, breakdown: [] };
  }

  let low = 0;
  let high = rows.length - 1;
  let resolvedIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const row = rows[mid];
    if (!row) break;

    if (row.effectiveFrom.getTime() <= at.getTime()) {
      resolvedIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (resolvedIndex === -1) {
    return { totalSplitPct: 0, breakdown: [] };
  }

  const row = rows[resolvedIndex];
  if (!row) {
    return { totalSplitPct: 0, breakdown: [] };
  }

  return {
    totalSplitPct: row.totalSplitPct,
    breakdown: parseBreakdownSnapshot(row.breakdownJson),
  };
}

export function getSnapshotFromHistoryRow(
  row: SplitHistoryLookupRow,
): EffectiveSplitSnapshot {
  return {
    totalSplitPct: row.totalSplitPct,
    breakdown: parseBreakdownSnapshot(row.breakdownJson),
  };
}

export async function getSplitHistoryRowsForLookup(
  tx: Transaction,
  userId: string,
) {
  return tx
    .select({
      effectiveFrom: splitHistory.effectiveFrom,
      totalSplitPct: splitHistory.totalSplitPct,
      breakdownJson: splitHistory.breakdownJson,
      createdAt: splitHistory.createdAt,
    })
    .from(splitHistory)
    .where(eq(splitHistory.userId, userId))
    .orderBy(asc(splitHistory.effectiveFrom), asc(splitHistory.createdAt));
}

export async function insertSplitHistorySnapshot(
  tx: Transaction,
  {
    userId,
    effectiveFrom,
    totalSplitPct,
    breakdown,
    source,
    correctionBatchId,
    reason,
  }: {
    userId: string;
    effectiveFrom?: Date;
    totalSplitPct: number;
    breakdown: SplitBreakdownSnapshotItem[];
    source: SplitHistorySource;
    correctionBatchId?: string | null;
    reason?: string | null;
  },
) {
  await tx.insert(splitHistory).values({
    userId,
    effectiveFrom,
    totalSplitPct,
    breakdownJson: breakdown,
    source,
    correctionBatchId,
    reason,
  });
}

export async function replaceCurrentSplitsWithBreakdown(
  tx: Transaction,
  userId: string,
  breakdown: SplitBreakdownSnapshotItem[],
) {
  await tx.delete(splits).where(eq(splits.userId, userId));

  if (breakdown.length === 0) {
    return;
  }

  await tx.insert(splits).values(
    breakdown.map((item) => ({
      userId,
      name: item.name,
      value: item.value,
    })),
  );
}

export async function appendSplitHistorySnapshot(
  tx: Transaction,
  userId: string,
) {
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

  await insertSplitHistorySnapshot(tx, {
    userId,
    totalSplitPct: nextTotalSplitPct,
    breakdown: nextBreakdown,
    source: "live",
  });
}
