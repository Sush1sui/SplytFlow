import { Hono } from "hono";
import { db } from "@splytflow/db";
import {
  createEarning,
  getEarnings,
  getEarning,
  updateEarning,
  deleteEarning,
  getEarningsSummary,
} from "../services/earnings.service";

export const earningsRoutes = new Hono();

// Create earning
earningsRoutes.post("/", async (c) => {
  try {
    const earning = await createEarning(c, db);
    return c.json({ success: true, data: earning }, 201);
  } catch (error) {
    console.error("Error creating earning:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Get all earnings (with pagination and date filtering)
earningsRoutes.get("/", async (c) => {
  try {
    const earnings = await getEarnings(c, db);
    return c.json({ success: true, data: earnings });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Get earnings summary
earningsRoutes.get("/summary", async (c) => {
  try {
    const summary = await getEarningsSummary(c, db);
    return c.json({ success: true, data: summary });
  } catch (error) {
    console.error("Error fetching earnings summary:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Get single earning
earningsRoutes.get("/:id", async (c) => {
  try {
    const earning = await getEarning(c, db);
    return c.json({ success: true, data: earning });
  } catch (error) {
    console.error("Error fetching earning:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      404
    );
  }
});

// Update earning
earningsRoutes.patch("/:id", async (c) => {
  try {
    const earning = await updateEarning(c, db);
    return c.json({ success: true, data: earning });
  } catch (error) {
    console.error("Error updating earning:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});

// Delete earning
earningsRoutes.delete("/:id", async (c) => {
  try {
    const result = await deleteEarning(c, db);
    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting earning:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      500
    );
  }
});
