import Elysia, { t } from "elysia";
import {
  CreateSaleBody,
  DeleteSaleBody,
  GetSaleByUserDateQuery,
  GetSalesByRangeQuery,
} from "./model";
import saleService from "./service";

const saleIdParamsSchema = t.Object({
  id: t.String(),
});

const getSaleByUserDateQuerySchema = t.Object({
  userId: t.String(),
  date: t.String(),
});

const getSalesByRangeQuerySchema = t.Object({
  userId: t.String(),
  startDate: t.String(),
  endDate: t.String(),
});

const createOrUpdateSaleBodySchema = t.Object({
  userId: t.String(),
  amount: t.Number(),
  date: t.Optional(t.String()),
});

const deleteSaleBodySchema = t.Object({
  userId: t.String(),
});

const sales = new Elysia({ prefix: "/sales" })
  /**
   * GET /sales
   * Request query: { userId: string, date: Date | string }
   * Response: 200 OK with the sale details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId or date is missing or invalid
   * - 404 Not Found if the sale is not found for the given userId and date
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const { userId, date } = query;
        if (!userId || !date) {
          set.status = 400;
          return { error: "userId and date are required" };
        }
        const sale = await saleService.getByUserId(userId, date);
        if (!sale) {
          set.status = 404;
          return { error: "No sale found for the given userId and date" };
        }
        set.status = 200;
        return sale;
      } catch (error) {
        console.error("Error fetching sales:", error);
        set.status = 500;
        return { error: "An error occurred while fetching sales" };
      }
    },
    {
      query: getSaleByUserDateQuerySchema,
    },
  )
  /**
   * GET /sales/range
   * Request query: { userId: string, startDate: Date | string, endDate: Date | string }
   * Response: 200 OK with the list of sales for the user in the specified date range, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId, startDate, or endDate is missing or invalid, or if startDate is after endDate
   * - 404 Not Found if no sales are found for the given userId and date range
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/range",
    async ({ query, set }) => {
      try {
        const { userId, startDate, endDate } = query;
        if (!userId || !startDate || !endDate) {
          set.status = 400;
          return { error: "userId, startDate and endDate are required" };
        }

        const sales = await saleService.getByUserIdWithRange(
          userId,
          startDate,
          endDate,
        );
        if (!sales || sales.length === 0) {
          set.status = 404;
          return {
            error: "No sales found for the given userId and date range",
          };
        }

        set.status = 200;
        return sales;
      } catch (error) {
        console.error("Error fetching sales by ID:", error);
        set.status = 500;
        return { error: "An error occurred while fetching sales by ID" };
      }
    },
    {
      query: getSalesByRangeQuerySchema,
    },
  )
  /**
   * POST /sales
   * Request body: { userId: string, amount: number, date?: Date | string }
   * Response: 200 OK with the created or updated sale details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId or amount is missing or invalid
   * - 404 Not Found if the sale could not be created or updated
   * - 500 Internal Server Error for any other issues
   */
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { userId, amount, date } = body;
        if (!userId || amount === undefined) {
          set.status = 400;
          return { error: "userId and amount are required" };
        }
        const sale = await saleService.upsert(userId, amount, date);
        if (!sale) {
          set.status = 404;
          return { error: "Failed to create or update sale" };
        }
        set.status = 200;
        return sale;
      } catch (error) {
        console.error("Error creating/updating sale:", error);
        set.status = 500;
        return { error: "An error occurred while creating/updating the sale" };
      }
    },
    {
      body: createOrUpdateSaleBodySchema,
    },
  )
  /**
   * PUT /sales
   * Request body: { userId: string, amount: number, date?: Date | string }
   * Response: 200 OK with the updated sale details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId or amount is missing or invalid
   * - 404 Not Found if the sale could not be updated
   * - 500 Internal Server Error for any other issues
   */
  .put(
    "/",
    async ({ body, set }) => {
      try {
        const { userId, amount, date } = body;
        if (!userId || amount === undefined) {
          set.status = 400;
          return { error: "userId and amount are required" };
        }
        const sale = await saleService.update(userId, amount, date);
        if (!sale) {
          set.status = 404;
          return { error: "Failed to update sale" };
        }
        set.status = 200;
        return sale;
      } catch (error) {
        console.error("Error updating sale:", error);
        set.status = 500;
        return { error: "An error occurred while updating the sale" };
      }
    },
    {
      body: createOrUpdateSaleBodySchema,
    },
  )
  .delete(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { userId } = body;
        if (!userId) {
          set.status = 400;
          return { error: "userId is required" };
        }
        const result = await saleService.deleteByUserId(id, userId);
        if (!result) {
          set.status = 404;
          return { error: "Failed to delete sale" };
        }
        set.status = 200;
        return { message: "Sale deleted successfully" };
      } catch (error) {
        console.error("Error deleting sale:", error);
        set.status = 500;
        return { error: "An error occurred while deleting the sale" };
      }
    },
    {
      params: saleIdParamsSchema,
      body: deleteSaleBodySchema,
    },
  );

export default sales;
