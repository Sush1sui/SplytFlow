import { SalesRangePreset, SalesTotals } from "@/types/sale.types";

export const ranges = [
  "Today",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "Last 365 Days",
];

export const RANGE_PRESET_MAPPING: SalesRangePreset[] = [
  "today",
  "7d",
  "30d",
  "90d",
  "365d",
];

export const RANGE_SALES_KEYS = [
  "today",
  "last7Days",
  "last30Days",
  "last90Days",
  "last365Days",
] as const;

export const COMPARISON_SALES_KEYS = [
  "oneDayAgo",
  "prior7Days",
  "prior30Days",
  "prior90Days",
  "prior365Days",
] as const;

export const COMPARISON_LABELS = [
  "vs yesterday",
  "vs last 7 days",
  "vs last 30 days",
  "vs last 90 days",
  "vs last 365 days",
] as const;

export const SPLIT_COLORS = [
  "#3b82f6",
  "#f97316",
  "#eab308",
  "#06b6d4",
  "#a855f7",
  "#f43f5e",
  "#14b8a6",
  "#84cc16",
];

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const RANGE_PRESETS: SalesRangePreset[] = [
  "today",
  "1d",
  "2d",
  "1w",
  "1m",
  "3m",
  "1y",
  "7d",
  "prev7d",
  "30d",
  "prev30d",
  "90d",
  "prev90d",
  "365d",
  "prev365d",
];

export const PRESET_TO_KEY: Record<SalesRangePreset, keyof SalesTotals> = {
  today: "today",
  "1d": "oneDayAgo",
  "2d": "twoDaysAgo",
  "1w": "oneWeekAgo",
  "1m": "oneMonthAgo",
  "3m": "threeMonthsAgo",
  "1y": "oneYearAgo",
  "7d": "last7Days",
  prev7d: "prior7Days",
  "30d": "last30Days",
  prev30d: "prior30Days",
  "90d": "last90Days",
  prev90d: "prior90Days",
  "365d": "last365Days",
  prev365d: "prior365Days",
};
