export { deductFromDailySale, setDailySaleAmount } from "./service-write";
export { createOrUpdate } from "./service-upsert";
export {
  getSaleToday,
  getSalesByTimeRange,
  getSalesCsvByTimeRange,
  getTotalSalesByTimeRange,
} from "./service-read";
export { deleteSaleById, deleteSalesById } from "./service-delete";
