import Elysia from "elysia";
import {
  createOrUpdate,
  deleteSaleById,
  deleteSalesById,
  getSalesByTimeRange,
  getSaleToday,
  getTotalSalesByTimeRange,
} from "./service";
import { CreateOrUpdateBody, DeleteBody } from "./model";

const sales = new Elysia({ prefix: "/sales" })
  /**
   * GET /sales/:id
   * Query params (optional): startDate, endDate.
   * If the date range is provided the call returns every sale in that
   * interval; otherwise the current‑day total is returned.
   */
  .get("/:id", async ({ params, query, set }) => {
    try {
      const { id } = params;
      const { startDate, endDate } = query;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }

      // branch on presence of range parameters
      if (startDate && endDate) {
        const sales = await getSalesByTimeRange(
          id,
          new Date(startDate),
          new Date(endDate),
        );

        if (!sales || sales.length === 0) {
          set.status = 404;
          return {
            error: "No sales found for this user in the specified time range",
          };
        }

        set.status = 200;
        return sales;
      } else {
        const today = await getSaleToday(id);
        if (!today) {
          set.status = 404;
          return { error: "No sales found for this user today" };
        }

        set.status = 200;
        return today;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })

  /**
   * GET /sales/:id/total?startDate=2024-01-01&endDate=2024-01-31
   * Response: 200 { totalSales: number } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId, startDate, or endDate
   * - 500: Error fetching total sales
   */
  .get("/:id/total", async ({ params, query, set }) => {
    try {
      const { id } = params;
      const { startDate, endDate } = query;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }
      if (!startDate || !endDate) {
        set.status = 400;
        return { error: "startDate and endDate are required" };
      }

      const totalSales = await getTotalSalesByTimeRange(
        id,
        new Date(startDate),
        new Date(endDate),
      );

      set.status = 200;
      return { totalSales };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })

  /**
   * POST /sales
   * Body: { userId, amount }
   * Response: 201 { sale: Sale } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId or amount
   * - 500: Error creating or updating sale
   */
  .post("/", async ({ body, set }) => {
    try {
      const { userId, amount } = body as CreateOrUpdateBody;

      if (!userId || amount === undefined) {
        set.status = 400;
        return { error: "userId and amount are required" };
      }

      const newSale = await createOrUpdate(userId, amount);
      if (!newSale) {
        set.status = 500;
        return { error: "Failed to create or update sale" };
      }

      set.status = 201;
      return newSale;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
  .delete("/:id", async ({ params, body, set }) => {
    try {
      const { id } = params;
      const { salesIds, date } = body as DeleteBody;

      if (!id) {
        set.status = 400;
        return { error: "userId is required" };
      }

      if (salesIds && Array.isArray(salesIds)) {
        const deletedSales = await deleteSalesById(id, salesIds);
        if (!deletedSales || deletedSales.length === 0) {
          set.status = 404;
          return { error: "No sales found to delete for this user" };
        }
        set.status = 200;
        return deletedSales;
      }

      if (!date) {
        set.status = 400;
        return { error: "date is required" };
      }
      const deletedSale = await deleteSaleById(id, new Date(date));
      if (!deletedSale) {
        set.status = 404;
        return {
          error: "No sale found to delete for this user on the specified date",
        };
      }

      set.status = 200;
      return deletedSale;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  });

export default sales;
