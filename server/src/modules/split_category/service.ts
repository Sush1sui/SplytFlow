import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { splitCategories, splits } from "../../db/schema";
import { SplitCategoryWithSplits } from "./model";

async function create(name: string, userId: string) {
  try {
    const result = await db
      .insert(splitCategories)
      .values({
        name,
        userId,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error creating split category:", error);
    throw new Error("An error occurred while creating the split category");
  }
}

async function getAll(
  userId: string,
  includeSplits = false,
): Promise<SplitCategoryWithSplits[]> {
  try {
    if (!includeSplits) {
      const categories = await db
        .select()
        .from(splitCategories)
        .where(eq(splitCategories.userId, userId));
      return categories.map((cat) => ({ ...cat, splits: [] }));
    }

    const rows = await db
      .select({
        category: splitCategories,
        split: {
          id: splits.id,
          splitCategoryId: splits.splitCategoryId,
          name: splits.name,
          value: splits.value,
          createdAt: splits.createdAt,
          updatedAt: splits.updatedAt,
        },
      })
      .from(splitCategories)
      .leftJoin(splits, eq(splits.splitCategoryId, splitCategories.id))
      .where(eq(splitCategories.userId, userId));

    const categoryMap = new Map<string, SplitCategoryWithSplits>();

    for (const row of rows) {
      const cat = row.category;
      if (!categoryMap.has(cat.id)) {
        categoryMap.set(cat.id, { ...cat, splits: [] });
      }
      if (row.split) {
        categoryMap.get(cat.id)!.splits.push(row.split);
      }
    }

    return Array.from(categoryMap.values());
  } catch (error) {
    console.error("Error fetching split categories:", error);
    throw new Error("An error occurred while fetching split categories");
  }
}

async function getById(
  id: string,
  userId: string,
  includeSplits = false,
): Promise<SplitCategoryWithSplits | undefined> {
  try {
    if (!includeSplits) {
      const category = await db
        .select()
        .from(splitCategories)
        .where(
          and(eq(splitCategories.id, id), eq(splitCategories.userId, userId)),
        );
      return category[0] ? { ...category[0], splits: [] } : undefined;
    }

    const rows = await db
      .select({
        category: splitCategories,
        split: {
          id: splits.id,
          splitCategoryId: splits.splitCategoryId,
          name: splits.name,
          value: splits.value,
          createdAt: splits.createdAt,
          updatedAt: splits.updatedAt,
        },
      })
      .from(splitCategories)
      .leftJoin(splits, eq(splits.splitCategoryId, splitCategories.id))
      .where(
        and(eq(splitCategories.id, id), eq(splitCategories.userId, userId)),
      );

    if (rows.length === 0) return undefined;

    const category = rows[0].category;
    const categorySplits = rows
      .map((row) => row.split)
      .filter((s): s is NonNullable<typeof s> => s !== null);

    return { ...category, splits: categorySplits };
  } catch (error) {
    console.error("Error fetching split category:", error);
    throw new Error("An error occurred while fetching the split category");
  }
}

async function update(id: string, name: string, userId: string) {
  try {
    const result = await db
      .update(splitCategories)
      .set({ name })
      .where(
        and(eq(splitCategories.id, id), eq(splitCategories.userId, userId)),
      )
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error updating split category:", error);
    throw new Error("An error occurred while updating the split category");
  }
}

async function remove(id: string, userId: string) {
  try {
    const result = await db
      .delete(splitCategories)
      .where(
        and(eq(splitCategories.id, id), eq(splitCategories.userId, userId)),
      )
      .returning();
    return result[0];
  } catch (error) {
    console.error("Error deleting split category:", error);
    throw new Error("An error occurred while deleting the split category");
  }
}

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
