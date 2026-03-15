import Elysia from "elysia";
import * as splitService from "./service";
import {
  SplitCorrectionValidationError,
  SplitLimitExceededError,
} from "./service";
import {
  DeleteSplitBody,
  SplitCreateOrUpdateBody,
  SplitHistoryCorrectBody,
} from "./model";

const split = new Elysia({ prefix: "/split" })
  /**
   * GET /split/history/:userId/corrections?limit=25
   * Response: 200 { corrections: SplitHistory[] } | 400 { error: string } | 500 { error: string }
   */
  .get("/history/:userId/corrections", async ({ params, query, set }) => {
    try {
      const { userId } = params;

      if (!userId) {
        set.status = 400;
        return { error: "userId is required" };
      }

      const rawLimit = (query as { limit?: string }).limit;
      const hasLimit = typeof rawLimit === "string";
      const parsedLimit = hasLimit ? Number(rawLimit) : undefined;

      if (
        hasLimit &&
        (parsedLimit === undefined ||
          !Number.isFinite(parsedLimit) ||
          parsedLimit <= 0)
      ) {
        set.status = 400;
        return { error: "limit must be a positive number" };
      }

      const corrections = await splitService.getCorrectionHistoryByUserId(
        userId,
        parsedLimit,
      );

      set.status = 200;
      return { corrections };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  })
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
   * THIS IS AN UPSERT ENDPOINT - IT WILL CREATE A NEW SPLIT IF IT DOESN'T EXIST OR UPDATE THE VALUE IF IT DOES
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
      if (error instanceof SplitLimitExceededError) {
        set.status = 400;
        return { error: error.message };
      }
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
  })
  /**
   * POST /split/history/correct
   * Body: { userId, startAt, endAt?, breakdown: [{ name, value }], reason? }
   * Response: 200 { correctionBatchId, insertedRows, ... } | 400 { error: string } | 500 { error: string }
   */
  .post("/history/correct", async ({ body, set }) => {
    try {
      const { userId, startAt, endAt, breakdown, reason } =
        body as SplitHistoryCorrectBody;

      if (!userId || !startAt || !Array.isArray(breakdown)) {
        set.status = 400;
        return {
          error: "userId, startAt, and breakdown array are required",
        };
      }

      const startDate = new Date(startAt);
      const endDate = endAt ? new Date(endAt) : undefined;

      const result = await splitService.applyHistoricalCorrection(
        userId,
        startDate,
        endDate,
        breakdown,
        reason,
      );

      set.status = 200;
      return result;
    } catch (error) {
      if (
        error instanceof SplitCorrectionValidationError ||
        error instanceof SplitLimitExceededError
      ) {
        set.status = 400;
        return { error: error.message };
      }

      const message =
        error instanceof Error ? error.message : "An unknown error occurred";
      set.status = 500;
      return { error: message };
    }
  });

export default split;
