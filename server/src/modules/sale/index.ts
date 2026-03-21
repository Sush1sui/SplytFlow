import Elysia from "elysia";
import saleService from "./service";
import { saleSchema } from "./model";

const sales = new Elysia({ prefix: "/sales" })
  /**
   * GET /sales
   * Request query: { userId: string, date: string }
   * Response: 200 OK with sale data for the user and date, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId or date is missing or invalid
   * - 404 Not Found if no sale is found for the given userId and date
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const { userId, date } = query;

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
      query: saleSchema.getSaleByUserDateQuery,
    },
  )
  /**
   * GET /sales/:id
   * Request params: { id: string }
   * Response: 200 OK with sale data for the given ID, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id is missing or invalid
   * - 404 Not Found if no sale is found for the given ID
   * - 500 Internal Server Error for any other issues
   */
  .get("/:id", async ({ params, set }) => {
    try {
      const { id } = params;

      const sale = await saleService.getById(id);
      if (!sale) {
        set.status = 404;
        return { error: "No sale found for the given ID" };
      }
      set.status = 200;
      return sale;
    } catch (error) {
      console.error("Error fetching sale by ID:", error);
      set.status = 500;
      return { error: "An error occurred while fetching the sale by ID" };
    }
  })
  /**
   * GET /sales/range
   * Request query: { userId: string, startDate: string, endDate: string }
   * Response: 200 OK with list of sales for the user and date range, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId, startDate, or endDate is missing or invalid
   * - 404 Not Found if no sales are found for the given userId and date range
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/range",
    async ({ query, set }) => {
      try {
        const { userId, startDate, endDate } = query;

        const result = await saleService.getByUserIdWithRange(
          userId,
          startDate,
          endDate,
        );

        if (!result || result.length === 0) {
          set.status = 404;
          return {
            error: "No sales found for the given userId and date range",
          };
        }

        set.status = 200;
        return result;
      } catch (error) {
        console.error("Error fetching sales by range:", error);
        set.status = 500;
        return { error: "An error occurred while fetching sales by range" };
      }
    },
    {
      query: saleSchema.getSalesByRangeQuery,
    },
  )
  /**
   * POST /sales
   * Request body: { userId: string, amount: number, date: string }
   * Response: 200 OK with the created or updated sale, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId, amount, or date is missing or invalid
   * - 404 Not Found if the sale could not be created or updated
   * - 500 Internal Server Error for any other issues
   */
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { userId, amount, date } = body;

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
      body: saleSchema.createOrUpdateSaleBody,
    },
  )
  /**
   * PUT /sales
   * Request body: { userId: string, amount: number, date: string }
   * Response: 200 OK with the updated sale, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId, amount, or date is missing or invalid
   * - 404 Not Found if the sale could not be updated
   * - 500 Internal Server Error for any other issues
   */
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { userId, amount, date } = body;

        const sale = await saleService.update(id, userId, amount, date);

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
      body: saleSchema.createOrUpdateSaleBody,
      params: saleSchema.saleIdParams,
    },
  )
  /**
   * DELETE /sales/:id
   * Request body: { userId: string }
   * Response: 200 OK with a success message, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id or userId is missing or invalid
   * - 404 Not Found if the sale is not found for the given id and userId
   * - 500 Internal Server Error for any other issues
   */
  .delete(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { userId } = body;

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
      params: saleSchema.saleIdParams,
      body: saleSchema.deleteSaleBody,
    },
  );

export default sales;
