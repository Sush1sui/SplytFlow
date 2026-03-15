import Elysia from "elysia";
import {
  handleApplyHistoricalCorrection,
  handleDeleteAllSplits,
  handleDeleteSplit,
  handleGetCorrectionHistory,
  handleGetSplitHistoryTimeline,
  handleGetSplits,
  handleUpsertSplit,
} from "./handlers";

const split = new Elysia({ prefix: "/split" })
  /**
   * GET /split/history/:userId/corrections?limit=25
   * Response: 200 { corrections: SplitHistory[] } | 400 { error: string } | 500 { error: string }
   */
  .get("/history/:userId/corrections", handleGetCorrectionHistory)
  .get("/history/:userId/timeline", handleGetSplitHistoryTimeline)
  /**
   * GET /split/:id
   * Response: 200 { splits: Split[] } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId
   * - 404: No splits found for this user
   * - 500: Error fetching splits
   */
  .get("/:id", handleGetSplits)
  /**
   * THIS IS AN UPSERT ENDPOINT - IT WILL CREATE A NEW SPLIT IF IT DOESN'T EXIST OR UPDATE THE VALUE IF IT DOES
   * POST /split
   * Body: { userId, name, value }
   * Response: 201 { split: Split } | 200 { split: Split } | 400 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId, name, or value
   * - 500: Error creating or updating split
   */
  .post("/", handleUpsertSplit)
  /**
   * DELETE /split
   * Body: { userId, name }
   * Response: 200 { split: Split } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId or name
   * - 404: Split not found
   * - 500: Error deleting split
   */
  .delete("/", handleDeleteSplit)
  /**
   * DELETE /split/all/:userId
   * Response: 200 { message: string } | 400 { error: string } | 404 { error: string } | 500 { error: string }
   * Possible errors:
   * - 400: Missing userId
   * - 500: Error deleting splits
   */
  .delete("/all/:userId", handleDeleteAllSplits)
  /**
   * POST /split/history/correct
   * Body: { userId, startAt, endAt?, breakdown: [{ name, value }], reason? }
   * Response: 200 { correctionBatchId, insertedRows, ... } | 400 { error: string } | 500 { error: string }
   */
  .post("/history/correct", handleApplyHistoricalCorrection);

export default split;
