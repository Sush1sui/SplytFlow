import Elysia from "elysia";
import * as splitService from "./service";
import { DeleteSplitBody, SplitCreateOrUpdateBody } from "./model";

const split = new Elysia({ prefix: "/split" })
  /**
   * GET /split/:id
   * Response: 200 { splits: Split[] } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId
   * - 404: No splits found for this user
   * - 500: Error fetching splits
   */
  .get("/:id", async ({ params, set }) => {
    try {
      const { id } = params;

      const splits = await splitService.getSplitsByUserId(id);
      if (!splits || splits.length === 0) {
        set.status = 404;
        return { error: "No splits found for this user" };
      }

      set.status = 200;
      return splits;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
  /**
   * POST /split
   * Body: { userId, name, value }
   * Response: 201 { split: Split } | 200 { split: Split } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId, name, or value
   * - 500: Error creating or updating split
   */
  .post("/", async ({ body, set }) => {
    try {
      const { userId, name, value } = body as SplitCreateOrUpdateBody;

      if (!userId || !name || value === undefined) {
        set.status = 400;
        return { error: "userId, name, and value are required" };
      }

      const { split, created } = await splitService
        .upsert(userId, name, value)
        .then((split) => ({
          split,
          created:
            !split.updatedAt ||
            split.createdAt.getTime() === split.updatedAt.getTime(),
        }));

      set.status = created ? 201 : 200;
      return split;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
  /**
   * DELETE /split
   * Body: { userId, name }
   * Response: 200 { split: Split } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId or name
   * - 404: Split not found
   * - 500: Error deleting split
   */
  .delete("/", async ({ body, set }) => {
    try {
      const { userId, name } = body as DeleteSplitBody;

      if (!userId || !name) {
        set.status = 400;
        return { error: "userId and name are required" };
      }

      const deletedSplit = await splitService.deleteSplitByName(userId, name);

      if (!deletedSplit) {
        set.status = 404;
        return { error: "Split not found" };
      }

      set.status = 200;
      return deletedSplit;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
  /**
   * DELETE /split/all/:userId
   * Response: 200 { message: string } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId
   * - 500: Error deleting splits
   */
  .delete("/all/:userId", async ({ params, set }) => {
    try {
      const { userId } = params;
      if (!userId) {
        set.status = 400;
        return { error: "userId is required" };
      }
      await splitService.deleteAllSplitsByUserId(userId);
      set.status = 200;
      return { message: `Deleted all splits for user ${userId}` };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  });

export default split;
