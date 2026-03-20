import Elysia, { t } from "elysia";
import {
  CreateSplitBody,
  DeleteSplitQuery,
  GetAllSplitsQuery,
  GetSplitByIdQuery,
  SplitIdParams,
  UpdateSplitBody,
} from "./model";
import splitService from "./service";
import { SplitServiceError } from "./service";

function splitErrorStatus(error: unknown) {
  if (error instanceof SplitServiceError) {
    if (error.code === "validation" || error.code === "limit_exceeded") {
      return 400;
    }

    if (error.code === "not_found") {
      return 404;
    }
  }

  return 500;
}

const splitIdParamsSchema = t.Object({
  id: t.String(),
});

const getAllSplitsQuerySchema = t.Object({
  splitCategoryId: t.String(),
  userId: t.String(),
});

const getSplitByIdQuerySchema = t.Object({
  userId: t.String(),
});

const createSplitBodySchema = t.Object({
  userId: t.String(),
  name: t.String(),
  value: t.Number(),
  splitCategoryId: t.String(),
});

const updateSplitBodySchema = t.Object({
  userId: t.String(),
  name: t.String(),
  value: t.Number(),
});

const deleteSplitQuerySchema = t.Object({
  userId: t.String(),
});

const split = new Elysia({ prefix: "/splits" })
  /**
   * Get all splits by category ID
   * Request query: { splitCategoryId: string, userId: string }
   * Response: 200 OK with list of splits for the category, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if categoryId is missing or invalid
   * - 404 Not Found if no splits are found for the category
   * - 500 Internal Server Error for any other issues
   */ .get(
    "/",
    async ({ query, set }) => {
      try {
        const { splitCategoryId, userId } = query;

        if (!splitCategoryId || !userId) {
          set.status = 400;
          return { error: "splitCategoryId and userId are required" };
        }

        const splits = await splitService.getAllByCategoryId(
          splitCategoryId,
          userId,
        );
        set.status = 200;
        return splits;
      } catch (error) {
        console.error("Error fetching splits:", error);
        set.status = splitErrorStatus(error);
        return { error: "An error occurred while fetching splits" };
      }
    },
    {
      query: getAllSplitsQuerySchema,
    },
  )
  /**
   * GET /splits/:id
   * Request query: { userId: string }
   * Response: 200 OK with the split details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id is missing or invalid
   * - 404 Not Found if the split is not found for the given id
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/:id",
    async ({ params, query, set }) => {
      try {
        const { id } = params;
        const { userId } = query;

        if (!id || !userId) {
          set.status = 400;
          return { error: "id and userId are required" };
        }

        const split = await splitService.getById(id, userId);
        if (!split) {
          set.status = 404;
          return { error: "Split not found for the given id" };
        }
        set.status = 200;
        return split;
      } catch (error) {
        console.error("Error fetching split by ID:", error);
        set.status = splitErrorStatus(error);
        return { error: "An error occurred while fetching the split" };
      }
    },
    {
      params: splitIdParamsSchema,
      query: getSplitByIdQuerySchema,
    },
  )
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { name, value, splitCategoryId, userId } = body;
        if (!name || value === undefined || value === null || isNaN(value)) {
          set.status = 400;
          return { error: "name and value are required" };
        }
        if (!splitCategoryId || !userId) {
          set.status = 400;
          return { error: "splitCategoryId and userId are required" };
        }
        const newSplit = await splitService.create(
          splitCategoryId,
          name,
          Number(value),
          userId,
        );
        if (!newSplit) {
          set.status = 404;
          return {
            error: "Split category not found for the given splitCategoryId",
          };
        }
        set.status = 201;
        return newSplit;
      } catch (error) {
        console.error("Error creating split:", error);
        set.status = splitErrorStatus(error);
        return { error: "An error occurred while creating the split" };
      }
    },
    {
      body: createSplitBodySchema,
    },
  )
  /**
   * PUT /splits/:id
   * Request body: { name: string, value: number }
   * Response: 200 OK with the updated split details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id is missing or invalid, or if name/value are missing or invalid
   * - 404 Not Found if the split is not found for the given id
   * - 500 Internal Server Error for any other issues
   */
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { name, value, userId } = body;

        if (!id || !userId) {
          set.status = 400;
          return { error: "id and userId are required" };
        }

        if (!name || value === undefined || value === null || isNaN(value)) {
          set.status = 400;
          return { error: "name and value are required" };
        }
        const updatedSplit = await splitService.update(
          id,
          name,
          Number(value),
          userId,
        );
        if (!updatedSplit) {
          set.status = 404;
          return { error: "Split not found for the given id" };
        }
        set.status = 200;
        return updatedSplit;
      } catch (error) {
        console.error("Error updating split:", error);
        set.status = splitErrorStatus(error);
        return { error: "An error occurred while updating the split" };
      }
    },
    {
      params: splitIdParamsSchema,
      body: updateSplitBodySchema,
    },
  )
  /**
   * DELETE /splits/:id
   * Request query: { userId: string }
   * Response: 200 OK with a success message, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id is missing or invalid, or if userId is missing or invalid
   * - 404 Not Found if the split is not found for the given id and userId
   * - 500 Internal Server Error for any other issues
   */
  .delete(
    "/:id",
    async ({ params, query, set }) => {
      try {
        const { id } = params;
        const { userId } = query;

        if (!id || !userId) {
          set.status = 400;
          return { error: "id and userId are required" };
        }
        const result = await splitService.deleteById(id, userId);
        if (!result) {
          set.status = 404;
          return { error: "Split not found for the given id" };
        }
        set.status = 200;
        return { message: "Split deleted successfully" };
      } catch (error) {
        console.error("Error deleting split:", error);
        set.status = splitErrorStatus(error);
        return { error: "An error occurred while deleting the split" };
      }
    },
    {
      params: splitIdParamsSchema,
      query: deleteSplitQuerySchema,
    },
  );

export default split;
