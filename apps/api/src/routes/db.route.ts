import { Hono } from "hono";
import { db } from "@splytflow/db";
import { createSale, getAnalytics } from "../services/db.service";

export const dbRoutes = new Hono();

dbRoutes.post("/sales", async (c) => {
  try {
    const sale = await createSale(c, db);

    if (!sale) throw new Error("Sale creation failed");

    return c.json({ success: true, sale });
  } catch (error) {
    console.error("Error in SALES_POST:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});

dbRoutes.get("/analytics/:userId", async (c) => {
  try {
    const analytics = await getAnalytics(c, db);

    if (!analytics) throw new Error("Analytics retrieval failed");

    return c.json({ success: true, analytics });
  } catch (error) {
    console.error("Error in ANALYTICS_GET:", error);
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  }
});
