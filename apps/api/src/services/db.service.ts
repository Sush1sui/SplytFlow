import type { Context } from "hono";
import type { DbType } from "..";
import { sales, splitConfigs } from "@splytflow/db/src/schema";
import { and, eq, gte, sum } from "drizzle-orm";
import { startOfDay, subDays, subMonths } from "date-fns";

export async function createSale(c: Context, db: DbType) {
  const { userId, amount, description } = await c.req.json();

  const [newSale] = await db
    .insert(sales)
    .values({
      userId,
      amount: amount.toString(), // store as string for decimal precision
      description,
    })
    .returning();

  return newSale;
}

export async function getAnalytics(c: Context, db: DbType) {
  const userId = Number(c.req.param("userId"));
  const range = c.req.query("range") || "all"; // e.g., '1d', '7d', '1m', 'all'

  let startDate: Date | null = null;
  const now = new Date();

  if (range === "1d") {
    startDate = startOfDay(now);
  } else if (range === "7d") {
    startDate = subDays(now, 7);
  } else if (range.endsWith("m")) {
    startDate = subMonths(now, parseInt(range));
  } else if (range === "1y") {
    startDate = subMonths(now, 12);
  }

  const filters = [eq(sales.userId, userId)];
  if (startDate && range !== "all") {
    filters.push(gte(sales.createdAt, startDate));
  }

  const [salesResult] = await db
    .select({
      total: sum(sales.amount),
    })
    .from(sales)
    .where(and(...filters));

  const totalSales = Number(salesResult?.total || 0);

  const configs = await db
    .select()
    .from(splitConfigs)
    .where(eq(splitConfigs.userId, userId));
  const dividedParts = configs.map((config) => ({
    label: config.label,
    amount: (totalSales * (Number(config.percent) / 100)).toFixed(2),
  }));

  const netProfit = (
    totalSales - dividedParts.reduce((a, b) => a + Number(b.amount), 0)
  ).toFixed(2);

  return {
    range,
    totalSales,
    dividedParts,
    netProfit,
  };
}
