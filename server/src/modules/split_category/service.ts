import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { splitCategories } from "../../db/schema";

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

async function getAll(userId: string) {
  try {
    const categories = await db
      .select()
      .from(splitCategories)
      .where(eq(splitCategories.userId, userId));
    return categories;
  } catch (error) {
    console.error("Error fetching split categories:", error);
    throw new Error("An error occurred while fetching split categories");
  }
}

async function getById(id: string, userId: string) {
  try {
    const category = await db
      .select()
      .from(splitCategories)
      .where(
        and(eq(splitCategories.id, id), eq(splitCategories.userId, userId)),
      );
    return category[0];
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
