import { Hono } from "hono";
import { db } from "@splytflow/db";
import {
  createSplitConfig,
  getSplitConfigs,
  getSplitConfig,
  updateSplitConfig,
  deleteSplitConfig,
  reorderSplitConfigs,
} from "../services/splitConfigs.service";

export const splitConfigsRoutes = new Hono();

// Create split config
splitConfigsRoutes.post("/", async (c) => {
  try {
    const config = await createSplitConfig(c, db);
    return c.json({ success: true, data: config }, 201);
  } catch (error) {
    console.error("Error creating split config:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Get all split configs
splitConfigsRoutes.get("/", async (c) => {
  try {
    const configs = await getSplitConfigs(c, db);
    return c.json({ success: true, data: configs });
  } catch (error) {
    console.error("Error fetching split configs:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Reorder split configs
splitConfigsRoutes.post("/reorder", async (c) => {
  try {
    const result = await reorderSplitConfigs(c, db);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Error reordering split configs:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Get single split config
splitConfigsRoutes.get("/:id", async (c) => {
  try {
    const config = await getSplitConfig(c, db);
    return c.json({ success: true, data: config });
  } catch (error) {
    console.error("Error fetching split config:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      404
    );
  }
});

// Update split config
splitConfigsRoutes.patch("/:id", async (c) => {
  try {
    const config = await updateSplitConfig(c, db);
    return c.json({ success: true, data: config });
  } catch (error) {
    console.error("Error updating split config:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Delete split config (soft delete by default, ?hard=true for hard delete)
splitConfigsRoutes.delete("/:id", async (c) => {
  try {
    const result = await deleteSplitConfig(c, db);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting split config:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});
