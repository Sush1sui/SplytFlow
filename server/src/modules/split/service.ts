import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db";
import { splitHistory, splits } from "../../db/schema";
import {
  appendSplitHistorySnapshot,
  getEffectiveSplitSnapshotAt,
  getSnapshotFromHistoryRow,
  getSplitHistoryRowsForLookup,
  insertSplitHistorySnapshot,
  normalizeBreakdown,
  replaceCurrentSplitsWithBreakdown,
  snapshotsAreEqual,
  type EffectiveSplitSnapshot,
  type SplitBreakdownSnapshotItem,
} from "./history-support";

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

export async function getSplitHistoryTimelineByUserId(userId: string) {
  try {
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
      .where(eq(splitHistory.userId, userId))
      .orderBy(desc(splitHistory.effectiveFrom), desc(splitHistory.createdAt));
  } catch (error) {
    console.error(
      "Error getting full split history timeline by userId:",
      error,
    );
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
