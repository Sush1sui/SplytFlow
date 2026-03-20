import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "../../db";
import { splitCategories, splits } from "../../db/schema";
import { SplitServiceErrorCode } from "./model";

const MAX_TOTAL_SPLIT = 100;

export class SplitServiceError extends Error {
  constructor(
    public readonly code: SplitServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SplitServiceError";
  }
}

async function ensureCategoryOwnership(
  splitCategoryId: string,
  userId: string,
) {
  const [category] = await db
    .select({ id: splitCategories.id })
    .from(splitCategories)
    .where(
      and(
        eq(splitCategories.id, splitCategoryId),
        eq(splitCategories.userId, userId),
      ),
    )
    .limit(1);

  if (!category) {
    throw new SplitServiceError("not_found", "Split category not found");
  }
}

async function getSplitOwnedByUser(id: string, userId: string) {
  const [row] = await db
    .select({
      id: splits.id,
      splitCategoryId: splits.splitCategoryId,
      name: splits.name,
      value: splits.value,
    })
    .from(splits)
    .innerJoin(splitCategories, eq(splits.splitCategoryId, splitCategories.id))
    .where(and(eq(splits.id, id), eq(splitCategories.userId, userId)))
    .limit(1);

  return row ?? null;
}

async function assertSplitCap(
  splitCategoryId: string,
  value: number,
  excludeSplitId?: string,
) {
  const [row] = await db
    .select({
      total: sql<number>`COALESCE(SUM(${splits.value}), 0)`,
    })
    .from(splits)
    .where(
      excludeSplitId
        ? and(
            eq(splits.splitCategoryId, splitCategoryId),
            ne(splits.id, excludeSplitId),
          )
        : eq(splits.splitCategoryId, splitCategoryId),
    );

  const currentTotal = Number(row?.total ?? 0);
  if (currentTotal + value > MAX_TOTAL_SPLIT) {
    throw new SplitServiceError(
      "limit_exceeded",
      `Total split percentage cannot exceed ${MAX_TOTAL_SPLIT}%`,
    );
  }
}

async function create(
  splitCategoryId: string,
  name: string,
  value: number,
  userId: string,
) {
  if (!name?.trim()) {
    throw new SplitServiceError("validation", "name is required");
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new SplitServiceError(
      "validation",
      "value must be a non-negative number",
    );
  }

  await ensureCategoryOwnership(splitCategoryId, userId);
  await assertSplitCap(splitCategoryId, value);

  const result = await db
    .insert(splits)
    .values({ splitCategoryId, name: name.trim(), value })
    .returning();
  return result[0];
}

async function getAllByCategoryId(splitCategoryId: string, userId: string) {
  await ensureCategoryOwnership(splitCategoryId, userId);

  const splitRules = await db
    .select()
    .from(splits)
    .where(eq(splits.splitCategoryId, splitCategoryId));
  return splitRules;
}

async function getById(id: string, userId: string) {
  return getSplitOwnedByUser(id, userId);
}

async function update(id: string, name: string, value: number, userId: string) {
  if (!name?.trim()) {
    throw new SplitServiceError("validation", "name is required");
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new SplitServiceError(
      "validation",
      "value must be a non-negative number",
    );
  }

  const existing = await getSplitOwnedByUser(id, userId);
  if (!existing) {
    throw new SplitServiceError("not_found", "Split not found");
  }

  await assertSplitCap(existing.splitCategoryId, value, id);

  const result = await db
    .update(splits)
    .set({ name: name.trim(), value })
    .where(eq(splits.id, id))
    .returning();
  return result[0];
}

async function deleteById(id: string, userId: string) {
  const existing = await getSplitOwnedByUser(id, userId);
  if (!existing) {
    throw new SplitServiceError("not_found", "Split not found");
  }

  const result = await db.delete(splits).where(eq(splits.id, id)).returning();
  return result[0];
}

export default {
  create,
  getAllByCategoryId,
  getById,
  update,
  deleteById,
};
