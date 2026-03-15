import Elysia from "elysia";
import { handleAdjustSale } from "./routes/adjust-handler";
import {
  handleExportSalesCsv,
  handleGetSales,
  handleGetTotalSales,
} from "./routes/read-handlers";
import {
  handleCreateSale,
  handleDeleteSale,
  handleSetDaySale,
} from "./routes/write-handlers";

const sales = new Elysia({ prefix: "/sales" })
  .get("/:id/export/csv", handleExportSalesCsv)
  .get("/:id", handleGetSales)
  .get("/:id/total", handleGetTotalSales)
  .post("/", handleCreateSale)
  .patch("/adjust", handleAdjustSale)
  .patch("/set-day", handleSetDaySale)
  .delete("/:id", handleDeleteSale);

export default sales;
