import { Hono } from "hono";
import * as saleService from "../services/db/sale/service";

const sales = new Hono();

/**
 * GET /sales/:id
 * Query: userId
 * Response: 200 { sale: Sale } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
sales.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();

    if (!id) return c.json({ error: "userId is required" }, 400);

    const sale = await saleService.getSaleToday(id);
    if (!sale)
      return c.json({ error: "No sales found for this user today" }, 404);

    return c.json(sale, 200);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return c.json({ error: "Failed to fetch sales" }, 500);
  }
});

/**
 * GET /sales/:id?startDate=2024-01-01&endDate=2024-01-31
 * Query: userId, startDate, endDate
 * Response: 200 { sales: Sale[] } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
sales.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const { startDate, endDate } = c.req.query();

    if (!id) return c.json({ error: "userId is required" }, 400);
    if (!startDate || !endDate)
      return c.json({ error: "startDate and endDate are required" }, 400);

    const sales = await saleService.getSalesByTimeRange(
      id,
      new Date(startDate),
      new Date(endDate),
    );
    if (!sales || sales.length === 0)
      return c.json(
        { error: "No sales found for this user in the specified time range" },
        404,
      );

    return c.json(sales, 200);
  } catch (error) {
    console.error("Error fetching sales:", error);
    return c.json({ error: "Failed to fetch sales" }, 500);
  }
});

/**
 * GET /sales/:id/total?startDate=2024-01-01&endDate=2024-01-31
 * Query: userId, startDate, endDate
 * Response: 200 { totalSales: number } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
sales.get("/:id/total", async (c) => {
  try {
    const { id } = c.req.param();
    const { startDate, endDate } = c.req.query();

    if (!id) return c.json({ error: "userId is required" }, 400);
    if (!startDate || !endDate)
      return c.json({ error: "startDate and endDate are required" }, 400);

    const totalSales = await saleService.getTotalSalesByTimeRange(
      id,
      new Date(startDate),
      new Date(endDate),
    );

    return c.json({ totalSales }, 200);
  } catch (error) {
    console.error("Error fetching total sales:", error);
    return c.json({ error: "Failed to fetch total sales" }, 500);
  }
});

sales.post("/", async (c) => {
  try {
    const { userId, amount } = await c.req.json();

    if (!userId || amount === undefined)
      return c.json({ error: "userId and amount are required" }, 400);

    const newSale = await saleService.createOrUpdate(userId, amount);
    return c.json(newSale, 201);
  } catch (error) {
    console.error("Error creating sale:", error);
    return c.json({ error: "Failed to create sale" }, 500);
  }
});

sales.delete("/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const { salesIds } = await c.req.json();

    if (salesIds && Array.isArray(salesIds)) {
      const deletedSales = await saleService.deleteSalesById(id, salesIds);
      if (!deletedSales)
        return c.json(
          { error: "No sales found for this user with the specified IDs" },
          404,
        );

      return c.json(deletedSales, 200);
    }

    const { date } = c.req.query();

    if (!id) return c.json({ error: "userId is required" }, 400);
    if (!date) return c.json({ error: "date is required" }, 400);

    const deletedSale = await saleService.deleteSaleByDate(id, new Date(date));

    if (!deletedSale)
      return c.json(
        { error: "No sale found for this user on the specified date" },
        404,
      );

    return c.json(deletedSale, 200);
  } catch (error) {
    console.error("Error deleting sale:", error);
    return c.json({ error: "Failed to delete sale" }, 500);
  }
});

export default sales;
