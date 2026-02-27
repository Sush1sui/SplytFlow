import { Hono } from "hono";
import * as splitService from "../services/db/split/service";

const split = new Hono();

/**
 * GET /split?userId=123
 * Query: userId
 * Response: 200 { splits: Split[] } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
split.get("/:id", async (c) => {
  try {
    const { id } = c.req.param();

    if (!id) return c.json({ error: "userId is required" }, 400);

    const splits = await splitService.getSplitsByUserId(id);
    if (!splits) return c.json({ error: "No splits found for this user" }, 404);

    return c.json(splits, 200);
  } catch (error) {
    console.error("Error getting splits:", error);
    return c.json({ error: "An error occurred while fetching splits" }, 500);
  }
});

/**
 * POST /split
 * Body: { userId, name, value }
 * Response: 201 { split: Split } | 200 { split: Split } | 400 { error: string } | 500 { error: string }
 */
split.post("/", async (c) => {
  try {
    const { userId, name, value } = await c.req.json();

    if (!userId || !name || value === undefined)
      return c.json({ error: "userId, name, and value are required" }, 400);

    const existingSplit = await splitService
      .getSplitsByUserId(userId)
      .then((splits) => splits.find((split) => split.name === name));

    if (existingSplit) {
      const updatedSplit = await splitService.update(userId, name, value);
      return c.json(updatedSplit, 200);
    }
    const newSplit = await splitService.create(userId, name, value);
    return c.json(newSplit, 201);
  } catch (error) {
    console.error("Error creating split:", error);
    return c.json({ error: "An error occurred while creating split" }, 500);
  }
});

/**
 * DELETE /split
 * Body: { userId, name }
 * Response: 200 { split: Split } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
split.delete("/", async (c) => {
  try {
    const { userId, name } = await c.req.json();

    if (!userId || !name)
      return c.json({ error: "userId and name are required" }, 400);

    const deletedSplit = await splitService.deleteSplitByName(userId, name);
    if (!deletedSplit) return c.json({ error: "Split not found" }, 404);

    return c.json(deletedSplit, 200);
  } catch (error) {
    console.error("Error deleting split:", error);
    return c.json({ error: "An error occurred while deleting split" }, 500);
  }
});

/**
 * DELETE /split/all/:userId
 * Response: 200 { message: string } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
split.delete("/all/:userId", async (c) => {
  try {
    const { userId } = c.req.param();

    if (!userId) return c.json({ error: "userId is required" }, 400);

    const deletedSplits = await splitService.deleteAllSplitsByUserId(userId);
    if (!deletedSplits || deletedSplits === 0)
      return c.json({ error: "No splits found for this user" }, 404);

    return c.json(
      {
        message: `Deleted ${deletedSplits} splits for user ${userId}`,
      },
      200,
    );
  } catch (error) {
    console.error("Error deleting all splits:", error);
    return c.json(
      { error: "An error occurred while deleting all splits" },
      500,
    );
  }
});

/**
 * PUT /split
 * Body: { userId, name, value }
 * Response: 200 { split: Split } | 400 { error: string } | 404 { error: string } | 500 { error: string }
 */
split.put("/", async (c) => {
  try {
    const { userId, name, value } = await c.req.json();
    if (!userId || !name || value === undefined)
      return c.json({ error: "userId, name, and value are required" }, 400);

    const updatedSplit = await splitService.update(userId, name, value);
    if (!updatedSplit) return c.json({ error: "Split not found" }, 404);

    return c.json(updatedSplit, 200);
  } catch (error) {
    console.error("Error updating split:", error);
    return c.json({ error: "An error occurred while updating split" }, 500);
  }
});

export default split;
