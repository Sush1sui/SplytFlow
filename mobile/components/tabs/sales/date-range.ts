import type { SalesPreset, SalesRange } from "./types";

export const SALES_PRESETS: { key: SalesPreset; label: string }[] = [
  { key: "1d", label: "1D" },
  { key: "1w", label: "1W" },
  { key: "1m", label: "1M" },
  { key: "3m", label: "3M" },
  { key: "1y", label: "1Y" },
  { key: "all", label: "ALL" },
];

const startOfLocalDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

export const getSalesRange = (
  preset: SalesPreset,
  now = new Date(),
): SalesRange => {
  const todayStart = startOfLocalDay(now);

  if (preset === "1d") {
    return {
      startDate: todayStart,
      endDate: addDays(todayStart, 1),
      label: "Today",
    };
  }

  if (preset === "1w") {
    return {
      startDate: addDays(todayStart, -6),
      endDate: addDays(todayStart, 1),
      label: "Last 7 days",
    };
  }

  if (preset === "1m") {
    return {
      startDate: addDays(todayStart, -29),
      endDate: addDays(todayStart, 1),
      label: "Last 30 days",
    };
  }

  if (preset === "3m") {
    return {
      startDate: addDays(todayStart, -89),
      endDate: addDays(todayStart, 1),
      label: "Last 3 months",
    };
  }

  if (preset === "1y") {
    return {
      startDate: addDays(todayStart, -364),
      endDate: addDays(todayStart, 1),
      label: "Last 12 months",
    };
  }

  return {
    startDate: new Date(2000, 0, 1),
    endDate: addDays(todayStart, 1),
    label: "All time",
  };
};
