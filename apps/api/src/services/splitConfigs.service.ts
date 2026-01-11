import type { Context } from "hono";
import type { DbType } from "..";
import { splitConfigs } from "@splytflow/db/src/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import type {
  CreateSplitConfigDTO,
  UpdateSplitConfigDTO,
} from "@splytflow/db/src/types";

// ============================================
// CREATE SPLIT CONFIG
// ============================================
export async function createSplitConfig(c: Context, db: DbType) {
  const { name, percentage, color, sortOrder } =
    (await c.req.json()) as CreateSplitConfigDTO;
  const userId = Number(c.req.header("X-User-Id"));

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Validate percentage doesn't exceed 100% total
  const existingConfigs = await db
    .select()
    .from(splitConfigs)
    .where(
      and(eq(splitConfigs.userId, userId), eq(splitConfigs.isActive, true))
    );

  const totalPercentage = existingConfigs.reduce(
    (sum, config) => sum + Number(config.percentage),
    0
  );

  if (totalPercentage + percentage > 100) {
    throw new Error(
      `Total percentage would exceed 100%. Current: ${totalPercentage}%`
    );
  }

  const [newConfig] = await db
    .insert(splitConfigs)
    .values({
      userId,
      name,
      percentage: percentage.toString(),
      color,
      sortOrder: sortOrder || 0,
    })
    .returning();

  return newConfig;
}

// ============================================
// GET SPLIT CONFIGS
// ============================================
export async function getSplitConfigs(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const includeInactive = c.req.query("includeInactive") === "true";

  if (!userId) {
    throw new Error("User ID is required");
  }

  const filters = [eq(splitConfigs.userId, userId)];

  if (!includeInactive) {
    filters.push(eq(splitConfigs.isActive, true));
  }

  const configs = await db
    .select()
    .from(splitConfigs)
    .where(and(...filters))
    .orderBy(splitConfigs.sortOrder, desc(splitConfigs.createdAt));

  return configs;
}

// ============================================
// GET SINGLE SPLIT CONFIG
// ============================================
export async function getSplitConfig(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const configId = Number(c.req.param("id"));

  if (!userId || !configId) {
    throw new Error("User ID and Config ID are required");
  }

  const [config] = await db
    .select()
    .from(splitConfigs)
    .where(and(eq(splitConfigs.id, configId), eq(splitConfigs.userId, userId)))
    .limit(1);

  if (!config) {
    throw new Error("Split config not found");
  }

  return config;
}

// ============================================
// UPDATE SPLIT CONFIG
// ============================================
export async function updateSplitConfig(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const configId = Number(c.req.param("id"));
  const updates = (await c.req.json()) as UpdateSplitConfigDTO;

  if (!userId || !configId) {
    throw new Error("User ID and Config ID are required");
  }

  // Verify ownership
  const existing = await db
    .select()
    .from(splitConfigs)
    .where(and(eq(splitConfigs.id, configId), eq(splitConfigs.userId, userId)))
    .limit(1);

  if (!existing.length) {
    throw new Error("Split config not found");
  }

  // Validate percentage if changed
  if (updates.percentage !== undefined) {
    const otherConfigs = await db
      .select()
      .from(splitConfigs)
      .where(
        and(
          eq(splitConfigs.userId, userId),
          eq(splitConfigs.isActive, true),
          sql`${splitConfigs.id} != ${configId}`
        )
      );

    const totalOtherPercentage = otherConfigs.reduce(
      (sum, config) => sum + Number(config.percentage),
      0
    );

    if (totalOtherPercentage + updates.percentage > 100) {
      throw new Error(
        `Total percentage would exceed 100%. Other configs: ${totalOtherPercentage}%`
      );
    }
  }

  const [updated] = await db
    .update(splitConfigs)
    .set({
      ...updates,
      percentage: updates.percentage?.toString(),
      updatedAt: new Date(),
    })
    .where(eq(splitConfigs.id, configId))
    .returning();

  return updated;
}

// ============================================
// DELETE SPLIT CONFIG
// ============================================
export async function deleteSplitConfig(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const configId = Number(c.req.param("id"));
  const hardDelete = c.req.query("hard") === "true"; // Soft delete by default

  if (!userId || !configId) {
    throw new Error("User ID and Config ID are required");
  }

  // Verify ownership
  const existing = await db
    .select()
    .from(splitConfigs)
    .where(and(eq(splitConfigs.id, configId), eq(splitConfigs.userId, userId)))
    .limit(1);

  if (!existing.length) {
    throw new Error("Split config not found");
  }

  if (hardDelete) {
    // Hard delete (will fail if allocations exist due to FK constraint)
    await db.delete(splitConfigs).where(eq(splitConfigs.id, configId));
  } else {
    // Soft delete - just mark as inactive
    await db
      .update(splitConfigs)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(splitConfigs.id, configId));
  }

  return { success: true };
}

// ============================================
// REORDER SPLIT CONFIGS
// ============================================
export async function reorderSplitConfigs(c: Context, db: DbType) {
  const userId = Number(c.req.header("X-User-Id"));
  const { order } = (await c.req.json()) as { order: number[] }; // Array of config IDs in new order

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Update sort order for each config
  for (let i = 0; i < order.length; i++) {
    const configId = order[i];
    if (!configId) continue;

    await db
      .update(splitConfigs)
      .set({
        sortOrder: i,
        updatedAt: new Date(),
      })
      .where(
        and(eq(splitConfigs.id, configId), eq(splitConfigs.userId, userId))
      );
  }

  return { success: true };
}
