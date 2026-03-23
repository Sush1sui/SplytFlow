import Elysia, { t } from "elysia";
import splitService from "./service";
import { splitCategorySchema } from "./model";

const splitCategory = new Elysia({ prefix: "/splits/categories" })
  .onAfterHandle(({ set, path }) => {
    // LOGGER
    console.log(`< Response for ${path}: ${set.status}`);
  })
  /**
   * GET /splits/categories
   * Request query: { userId: string }
   * Response: 200 OK with list of split categories for the user, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId is missing or invalid
   * - 404 Not Found if no categories are found for the user
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const { userId } = query;

        if (!userId) {
          set.status = 400;
          return { error: "userId is required" };
        }

        const categories = await splitService.getAll(userId);

        set.status = 200;
        return categories;
      } catch (error) {
        console.error("Error fetching split categories:", error);
        set.status = 500;
        return { error: "An error occurred while fetching split categories" };
      }
    },
    {
      query: splitCategorySchema.splitCategoryUserQuery,
    },
  )
  /**
   * GET /splits/categories/:id
   * Request query: { userId: string }
   * Response: 200 OK with the split category details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id or userId is missing or invalid
   * - 404 Not Found if the category is not found for the user
   * - 500 Internal Server Error for any other issues
   */
  .get(
    "/:id",
    async ({ params, query, set }) => {
      try {
        const { id } = params;
        const { userId } = query;

        if (!id) {
          set.status = 400;
          return { error: "id is required" };
        }

        if (!userId) {
          set.status = 400;
          return { error: "userId is required" };
        }

        const category = await splitService.getById(id, userId);

        if (!category) {
          set.status = 404;
          return { error: "Split category not found" };
        }
        set.status = 200;
        return category;
      } catch (error) {
        console.error("Error fetching split category by ID:", error);
        set.status = 500;
        return { error: "An error occurred while fetching the split category" };
      }
    },
    {
      params: splitCategorySchema.splitCategoryIdParams,
      query: splitCategorySchema.splitCategoryUserQuery,
    },
  )
  /**
   * POST /splits/categories
   * Request body: { userId: string, name: string }
   * Response: 201 Created with the new split category details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if userId or name is missing or invalid
   * - 500 Internal Server Error for any other issues
   */
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const { userId, name } = body;

        if (!userId || !name) {
          set.status = 400;
          return { error: "userId and name are required" };
        }

        const category = await splitService.create(name, userId);

        if (!category) {
          set.status = 500;
          return { error: "Failed to create split category" };
        }

        set.status = 201;
        return category;
      } catch (error) {
        console.error("Error creating split category:", error);
        set.status = 500;
        return { error: "An error occurred while creating the split category" };
      }
    },
    {
      body: splitCategorySchema.splitCategoryUpsertBody,
    },
  )
  /**
   * PUT /splits/categories/:id
   * Request body: { userId: string, name: string }
   * Response: 200 OK with the updated split category details, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id, userId, or name is missing or invalid
   * - 404 Not Found if the category is not found for the user
   * - 500 Internal Server Error for any other issues
   */
  .put(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { userId, name } = body;

        if (!id) {
          set.status = 400;
          return { error: "id is required" };
        }
        if (!userId || !name) {
          set.status = 400;
          return { error: "userId and name are required" };
        }
        const category = await splitService.update(id, name, userId);
        if (!category) {
          set.status = 404;
          return { error: "Split category not found or failed to update" };
        }
        set.status = 200;
        return category;
      } catch (error) {
        console.error("Error updating split category:", error);
        set.status = 500;
        return { error: "An error occurred while updating the split category" };
      }
    },
    {
      params: splitCategorySchema.splitCategoryIdParams,
      body: splitCategorySchema.splitCategoryUpsertBody,
    },
  )
  /**
   * DELETE /splits/categories/:id
   * Request body: { userId: string }
   * Response: 200 OK with a success message, or appropriate error statuses
   * Possible errors:
   * - 400 Bad Request if id or userId is missing or invalid
   * - 404 Not Found if the category is not found for the user
   * - 500 Internal Server Error for any other issues
   */
  .delete(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const { id } = params;
        const { userId } = body;
        const category = await splitService.remove(id, userId);
        if (!category) {
          set.status = 404;
          return { error: "Split category not found or failed to delete" };
        }
        set.status = 200;
        return { message: "Split category deleted successfully" };
      } catch (error) {
        console.error("Error deleting split category:", error);
        set.status = 500;
        return { error: "An error occurred while deleting the split category" };
      }
    },
    {
      params: splitCategorySchema.splitCategoryIdParams,
      body: splitCategorySchema.splitCategoryDeleteBody,
    },
  );

export default splitCategory;
