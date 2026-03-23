import { SalesRangePreset, SalesRangeQuery } from "@/types/sale.types";

export function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = padTwo(date.getMonth() + 1);
  const day = padTwo(date.getDate());

  return `${year}-${month}-${day}`;
}

export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function shiftLocalDate(date: Date, days: number): Date {
  const shifted = new Date(date);
  shifted.setDate(shifted.getDate() + days);
  return shifted;
}

export function getSalesRangeQueryByPreset(
  preset: SalesRangePreset,
  baseDate = new Date(),
): SalesRangeQuery {
  const timeZone = getLocalTimeZone();

  const dayOffsetByPreset: Record<SalesRangePreset, number> = {
    today: 0,
    "1d": -1,
    "1w": -7,
    "1m": -30,
    "3m": -90,
    "1y": -365,
  };

  const localDate = getLocalDateString(
    shiftLocalDate(baseDate, dayOffsetByPreset[preset]),
  );

  return {
    startLocalDate: localDate,
    endLocalDate: localDate,
    timeZone,
  };
}

export function sumSaleRows(rows: SaleRow[]): number {
  return rows.reduce((total, row) => total + row.amount, 0);
}

function padTwo(value: number): string {
  return String(value).padStart(2, "0");
}
