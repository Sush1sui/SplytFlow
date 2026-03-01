import { eq, and } from "drizzle-orm";
import { db } from "../../db";
import { splits } from "../../db/schema";

export async function create(userId: string, name: string, value: number) {
  try {
    const [split] = await db
      .insert(splits)
      .values({ userId, name, value })
      .returning();

    if (!split) throw new Error("Failed to create split");
    return split;
  } catch (error) {
    console.error("Error creating split:", error);
    throw error;
  }
}

export async function update(userId: string, name: string, value: number) {
  try {
    const [split] = await db
      .update(splits)
      .set({ value })
      .where(and(eq(splits.userId, userId), eq(splits.name, name)))
      .returning();
    if (!split) throw new Error("Split not found");
    return split;
  } catch (error) {
    console.error("Error updating split:", error);
    throw error;
  }
}

export async function upsert(userId: string, name: string, value: number) {
  try {
    const [split] = await db
      .insert(splits)
      .values({ userId, name, value })
      .onConflictDoUpdate({
        target: [splits.userId, splits.name],
        set: { value },
      })
      .returning();

    if (!split) throw new Error("Failed to upsert split");
    return split;
  } catch (error) {
    console.error("Error upserting split:", error);
    throw error;
  }
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
