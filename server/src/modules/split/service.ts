import { and, asc, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db";
import { splitHistory, splits } from "../../db/schema";

export class SplitLimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitLimitExceededError";
  }
}

export class SplitCorrectionValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SplitCorrectionValidationError";
  }
}

const MAX_TOTAL_SPLIT = 100;
const SPLIT_COMPARISON_EPSILON = 1e-9;

type SplitBreakdownSnapshotItem = {
  name: string;
  value: number;
};

type SplitHistorySource = "live" | "correction_start" | "correction_restore";

type EffectiveSplitSnapshot = {
  totalSplitPct: number;
  breakdown: SplitBreakdownSnapshotItem[];
};

type SplitHistoryLookupRow = {
  effectiveFrom: Date;
  totalSplitPct: number;
  breakdownJson: unknown;
  createdAt: Date;
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

function snapshotsAreEqual(
  left: EffectiveSplitSnapshot,
  right: EffectiveSplitSnapshot,
): boolean {
  return (
    numbersAreEqual(left.totalSplitPct, right.totalSplitPct) &&
    breakdownsAreEqual(left.breakdown, right.breakdown)
  );
}

function getEffectiveSplitSnapshotAt(
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

function getSnapshotFromHistoryRow(
  row: SplitHistoryLookupRow,
): EffectiveSplitSnapshot {
  return {
    totalSplitPct: row.totalSplitPct,
    breakdown: parseBreakdownSnapshot(row.breakdownJson),
  };
}

function normalizeCorrectionBreakdown(
  breakdown: SplitBreakdownSnapshotItem[],
): SplitBreakdownSnapshotItem[] {
  const seen = new Set<string>();
  const normalized = breakdown.map((item) => {
    const name = item.name?.trim();
    const value = item.value;

    if (!name) {
      throw new SplitCorrectionValidationError(
        "Each correction breakdown item must include a non-empty name",
      );
    }

    if (!Number.isFinite(value) || value < 0) {
      throw new SplitCorrectionValidationError(
        `Invalid value for split '${name}'. Value must be a non-negative number`,
      );
    }

    const key = name.toLowerCase();
    if (seen.has(key)) {
      throw new SplitCorrectionValidationError(
        `Duplicate split name in correction payload: '${name}'`,
      );
    }
    seen.add(key);

    return { name, value };
  });

  return normalizeBreakdown(normalized);
}

async function getSplitHistoryRowsForLookup(tx: Transaction, userId: string) {
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

async function insertSplitHistorySnapshot(
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

async function replaceCurrentSplitsWithBreakdown(
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

  await insertSplitHistorySnapshot(tx, {
    userId,
    totalSplitPct: nextTotalSplitPct,
    breakdown: nextBreakdown,
    source: "live",
  });
}

export async function applyHistoricalCorrection(
  userId: string,
  startAt: Date,
  endAt: Date | undefined,
  breakdown: SplitBreakdownSnapshotItem[],
  reason?: string,
) {
  return db.transaction(async (tx) => {
    if (Number.isNaN(startAt.getTime())) {
      throw new SplitCorrectionValidationError(
        "startAt must be a valid ISO timestamp",
      );
    }

    if (endAt && Number.isNaN(endAt.getTime())) {
      throw new SplitCorrectionValidationError(
        "endAt must be a valid ISO timestamp",
      );
    }

    if (endAt && endAt.getTime() <= startAt.getTime()) {
      throw new SplitCorrectionValidationError(
        "endAt must be greater than startAt",
      );
    }

    if (!endAt && startAt.getTime() > Date.now()) {
      throw new SplitCorrectionValidationError(
        "Open-ended correction cannot start in the future",
      );
    }

    const normalizedBreakdown = normalizeCorrectionBreakdown(breakdown);
    const correctedTotalSplitPct = normalizedBreakdown.reduce(
      (sum, item) => sum + item.value,
      0,
    );

    if (correctedTotalSplitPct > MAX_TOTAL_SPLIT) {
      throw new SplitLimitExceededError(
        `Total split percentage would exceed ${MAX_TOTAL_SPLIT}% (requested: ${correctedTotalSplitPct}%)`,
      );
    }

    const historyRows = await getSplitHistoryRowsForLookup(tx, userId);
    const startSnapshot = getEffectiveSplitSnapshotAt(historyRows, startAt);
    const correctedSnapshot: EffectiveSplitSnapshot = {
      totalSplitPct: correctedTotalSplitPct,
      breakdown: normalizedBreakdown,
    };

    let correctionStartAt: Date | null = null;

    if (!snapshotsAreEqual(startSnapshot, correctedSnapshot)) {
      correctionStartAt = startAt;
    } else {
      const firstDivergingBoundary = historyRows.find((row) => {
        const rowAt = row.effectiveFrom.getTime();
        const startsAfterRequestedStart = rowAt > startAt.getTime();
        const staysWithinWindow = !endAt || rowAt < endAt.getTime();

        if (!startsAfterRequestedStart || !staysWithinWindow) {
          return false;
        }

        const rowSnapshot = getSnapshotFromHistoryRow(row);
        return !snapshotsAreEqual(rowSnapshot, correctedSnapshot);
      });

      if (firstDivergingBoundary) {
        correctionStartAt = firstDivergingBoundary.effectiveFrom;
      }
    }

    const shouldInsertCorrectionStart = correctionStartAt !== null;

    const endSnapshot = endAt
      ? getEffectiveSplitSnapshotAt(historyRows, endAt)
      : null;

    const shouldInsertCorrectionRestore =
      !!endAt &&
      shouldInsertCorrectionStart &&
      !!endSnapshot &&
      !snapshotsAreEqual(correctedSnapshot, endSnapshot);

    if (!shouldInsertCorrectionStart && !shouldInsertCorrectionRestore) {
      throw new SplitCorrectionValidationError(
        "Correction produces no effective timeline change",
      );
    }

    const normalizedReason = reason?.trim() ? reason.trim() : null;
    const correctionBatchId = crypto.randomUUID();
    let insertedRows = 0;

    if (shouldInsertCorrectionStart) {
      await insertSplitHistorySnapshot(tx, {
        userId,
        effectiveFrom: correctionStartAt ?? startAt,
        totalSplitPct: correctedSnapshot.totalSplitPct,
        breakdown: correctedSnapshot.breakdown,
        source: "correction_start",
        correctionBatchId,
        reason: normalizedReason,
      });
      insertedRows += 1;
    }

    if (shouldInsertCorrectionRestore && endAt && endSnapshot) {
      await insertSplitHistorySnapshot(tx, {
        userId,
        effectiveFrom: endAt,
        totalSplitPct: endSnapshot.totalSplitPct,
        breakdown: endSnapshot.breakdown,
        source: "correction_restore",
        correctionBatchId,
        reason: normalizedReason,
      });
      insertedRows += 1;
    }

    if (!endAt && shouldInsertCorrectionStart) {
      await replaceCurrentSplitsWithBreakdown(tx, userId, normalizedBreakdown);
    }

    return {
      correctionBatchId,
      insertedRows,
      startInserted: shouldInsertCorrectionStart,
      restoreInserted: shouldInsertCorrectionRestore,
      totalSplitPct: correctedSnapshot.totalSplitPct,
      breakdown: correctedSnapshot.breakdown,
      reason: normalizedReason,
    };
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

export async function getCorrectionHistoryByUserId(userId: string, limit = 25) {
  try {
    const safeLimit = Math.max(1, Math.min(100, Math.trunc(limit)));

    return await db
      .select({
        id: splitHistory.id,
        userId: splitHistory.userId,
        effectiveFrom: splitHistory.effectiveFrom,
        totalSplitPct: splitHistory.totalSplitPct,
        breakdownJson: splitHistory.breakdownJson,
        source: splitHistory.source,
        correctionBatchId: splitHistory.correctionBatchId,
        reason: splitHistory.reason,
        createdAt: splitHistory.createdAt,
      })
      .from(splitHistory)
      .where(
        and(eq(splitHistory.userId, userId), ne(splitHistory.source, "live")),
      )
      .orderBy(desc(splitHistory.effectiveFrom), desc(splitHistory.createdAt))
      .limit(safeLimit);
  } catch (error) {
    console.error("Error getting correction history by userId:", error);
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
