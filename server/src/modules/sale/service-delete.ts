import { and, eq, inArray } from "drizzle-orm";

import { db } from "../../db";
import { sales } from "../../db/schema";

export async function deleteSaleById(userId: string, date: Date) {
  try {
    const deletedSale = await db
      .delete(sales)
      .where(and(eq(sales.userId, userId), eq(sales.createdAt, date)))
      .returning();

    if (!deletedSale) throw new Error("Sale not found");

    return deletedSale;
  } catch (error) {
    console.error("Error deleting sale by id:", error);
    throw error;
  }
}

export async function deleteSalesById(userId: string, salesIds: string[]) {
  try {
    const deletedSales = await db
      .delete(sales)
      .where(and(eq(sales.userId, userId), inArray(sales.id, salesIds)))
      .returning();

    return deletedSales;
  } catch (error) {
    console.error("Error deleting sales by id:", error);
    throw error;
  }
}
