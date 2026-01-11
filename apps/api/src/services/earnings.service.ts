import type { Context } from "hono";
import type { DbType } from "..";
import {
  earnings,
  splitConfigs,
  splitAllocations,
} from "@splytflow/db/src/schema";
import { and, eq, gte, lte, sql, desc } from "drizzle-orm";
import type {
  CreateEarningDTO,
  UpdateEarningDTO,
  EarningWithAllocations,
  EarningsSummary,
} from "@splytflow/db/src/types";

// ============================================
// CREATE EARNING
// ============================================
export async function createEarning(c: Context, db: DbType) {
  const { amount, date, description } =
    (await c.req.json()) as CreateEarningDTO;
  const userId = Number(c.req.header("X-User-Id")); // Adjust based on your auth setup

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Start transaction
  const [newEarning] = await db
    .insert(earnings)
    .values({
      userId,
      amount: amount.toString(),
      date,
      description,
    })
    .returning();

  if (!newEarning) throw new Error("Failed to create earning");

  // Get active split configs for this user
  const activeConfigs = await db
    .select()
    .from(splitConfigs)
    .where(
      and(eq(splitConfigs.userId, userId), eq(splitConfigs.isActive, true))
    )
    .orderBy(splitConfigs.sortOrder);

  // Calculate and create split allocations
  const allocations = [];
  for (const config of activeConfigs) {
    const percentage = Number(config.percentage);
    const allocationAmount = (amount * percentage) / 100;

    const [allocation] = await db
      .insert(splitAllocations)
      .values({
        earningId: newEarning.id,
        splitConfigId: config.id,
        amount: allocationAmount.toFixed(2),
        percentage: percentage.toString(),
      })
      .returning();

    allocations.push({
      ...allocation,
      splitConfig: config,
    });
  }

  return {
    ...newEarning,
    allocations,
  } as EarningWithAllocations;
}

// ============================================
// GET EARNINGS
// ============================================
export async function getEarnings(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");
  const limit = Number(c.req.query("limit")) || 50;
  const offset = Number(c.req.query("offset")) || 0;

  if (!userId) {
    throw new Error("User ID is required");
  }

  const filters = [eq(earnings.userId, userId)];

  if (startDate) {
    filters.push(gte(earnings.date, startDate));
  }
  if (endDate) {
    filters.push(lte(earnings.date, endDate));
  }

  // Get earnings with allocations
  const results = await db.query.earnings.findMany({
    where: and(...filters),
    with: {
      allocations: {
        with: {
          splitConfig: true,
        },
      },
    },
    orderBy: [desc(earnings.date), desc(earnings.createdAt)],
    limit,
    offset,
  });

  return results as EarningWithAllocations[];
}

// ============================================
// GET SINGLE EARNING
// ============================================
export async function getEarning(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const earningId = Number(c.req.param("id"));

  if (!userId || !earningId) {
    throw new Error("User ID and Earning ID are required");
  }

  const result = await db.query.earnings.findFirst({
    where: and(eq(earnings.id, earningId), eq(earnings.userId, userId)),
    with: {
      allocations: {
        with: {
          splitConfig: true,
        },
      },
    },
  });

  if (!result) {
    throw new Error("Earning not found");
  }

  return result as EarningWithAllocations;
}

// ============================================
// UPDATE EARNING
// ============================================
export async function updateEarning(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const earningId = Number(c.req.param("id"));
  const updates = (await c.req.json()) as UpdateEarningDTO;

  if (!userId || !earningId) {
    throw new Error("User ID and Earning ID are required");
  }

  // Verify ownership
  const existing = await db.query.earnings.findFirst({
    where: and(eq(earnings.id, earningId), eq(earnings.userId, userId)),
  });

  if (!existing) {
    throw new Error("Earning not found");
  }

  // Update earning
  const [updated] = await db
    .update(earnings)
    .set({
      ...updates,
      amount: updates.amount?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(earnings.id, earningId))
    .returning();

  // If amount changed, recalculate allocations
  if (updates.amount && updates.amount !== Number(existing.amount)) {
    // Delete old allocations
    await db
      .delete(splitAllocations)
      .where(eq(splitAllocations.earningId, earningId));

    // Get active split configs
    const activeConfigs = await db
      .select()
      .from(splitConfigs)
      .where(
        and(eq(splitConfigs.userId, userId), eq(splitConfigs.isActive, true))
      )
      .orderBy(splitConfigs.sortOrder);

    // Create new allocations
    for (const config of activeConfigs) {
      const percentage = Number(config.percentage);
      const allocationAmount = (updates.amount * percentage) / 100;

      await db.insert(splitAllocations).values({
        earningId,
        splitConfigId: config.id,
        amount: allocationAmount.toFixed(2),
        percentage: percentage.toString(),
      });
    }
  }

  // Return updated earning with allocations
  return getEarning(c, db);
}

// ============================================
// DELETE EARNING
// ============================================
export async function deleteEarning(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const earningId = Number(c.req.param("id"));

  if (!userId || !earningId) {
    throw new Error("User ID and Earning ID are required");
  }

  // Verify ownership
  const existing = await db.query.earnings.findFirst({
    where: and(eq(earnings.id, earningId), eq(earnings.userId, userId)),
  });

  if (!existing) {
    throw new Error("Earning not found");
  }

  // Delete (cascade will handle allocations)
  await db.delete(earnings).where(eq(earnings.id, earningId));

  return { success: true };
}

// ============================================
// GET EARNINGS SUMMARY
// ============================================
export async function getEarningsSummary(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const startDate = c.req.query("startDate");
  const endDate = c.req.query("endDate");

  if (!userId) {
    throw new Error("User ID is required");
  }

  const filters = [eq(earnings.userId, userId)];

  if (startDate) {
    filters.push(gte(earnings.date, startDate));
  }
  if (endDate) {
    filters.push(lte(earnings.date, endDate));
  }

  // Get total earnings
  const [totalResult] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${earnings.amount}), 0)`,
    })
    .from(earnings)
    .where(and(...filters));

  const totalEarnings = Number(totalResult?.total || 0);

  // Get split breakdown
  const splitBreakdownQuery = await db
    .select({
      splitConfigId: splitConfigs.id,
      splitConfigName: splitConfigs.name,
      color: splitConfigs.color,
      percentage: splitConfigs.percentage,
      totalAmount: sql<string>`COALESCE(SUM(${splitAllocations.amount}), 0)`,
    })
    .from(splitConfigs)
    .leftJoin(
      splitAllocations,
      eq(splitAllocations.splitConfigId, splitConfigs.id)
    )
    .leftJoin(earnings, eq(earnings.id, splitAllocations.earningId))
    .where(
      and(
        eq(splitConfigs.userId, userId),
        eq(splitConfigs.isActive, true),
        ...(startDate ? [gte(earnings.date, startDate)] : []),
        ...(endDate ? [lte(earnings.date, endDate)] : [])
      )
    )
    .groupBy(
      splitConfigs.id,
      splitConfigs.name,
      splitConfigs.color,
      splitConfigs.percentage
    );

  const splitBreakdown = splitBreakdownQuery.map((row) => ({
    splitConfigId: row.splitConfigId,
    splitConfigName: row.splitConfigName,
    totalAmount: Number(row.totalAmount),
    percentage: Number(row.percentage),
    color: row.color || undefined,
  }));

  const totalAllocated = splitBreakdown.reduce(
    (sum, split) => sum + split.totalAmount,
    0
  );
  const totalAfterSplits = totalEarnings - totalAllocated;

  return {
    totalEarnings,
    totalAfterSplits,
    splitBreakdown,
  } as EarningsSummary;
}
