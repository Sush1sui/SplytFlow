import type { SaleRow } from "./types";

type BuildSalesCsvOptions = {
  salesRows: SaleRow[];
  splitHistoryRows: SplitHistoryTimelineRow[];
  rangeStartDate: Date;
  rangeEndDate: Date;
};

type SplitBreakdownItem = {
  name: string;
  value: number;
};

export type SplitHistoryTimelineRow = {
  effectiveFrom: string;
  totalSplitPct: number;
  breakdownJson: unknown;
  createdAt: string;
};

type ResolvedSnapshot = {
  effectiveFrom: Date | null;
  totalSplitPct: number;
  breakdown: SplitBreakdownItem[];
};

type TimelineSnapshot = {
  effectiveFrom: string | null;
  totalSplitPct: number;
  breakdown: SplitBreakdownItem[];
  createdAtMs: number;
};

const CSV_COLUMNS = [
  "",
  "Date",
  "Total Sale",
  "You Keep",
  "Total Split Percentage",
] as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalDateKey(value: Date): string {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addLocalDays(value: Date, days: number): Date {
  const next = new Date(value.getTime() + days * DAY_MS);
  return startOfLocalDay(next);
}

function toCsvSafeValue(raw: string): string {
  return `"${raw.replace(/"/g, '""')}"`;
}

function toMoney(value: number): string {
  return Number(value || 0).toFixed(2);
}

function toPercent(value: number): string {
  return Number(value || 0).toFixed(2);
}

function parseBreakdown(raw: unknown): SplitBreakdownItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("name" in item) ||
        !("value" in item)
      ) {
        return null;
      }

      const name = (item as { name: unknown }).name;
      const value = (item as { value: unknown }).value;

      if (typeof name !== "string" || typeof value !== "number") {
        return null;
      }

      return { name, value: Number(value) || 0 };
    })
    .filter((item): item is SplitBreakdownItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeTimeline(
  rows: SplitHistoryTimelineRow[],
): TimelineSnapshot[] {
  return [...rows]
    .map((row) => ({
      effectiveFrom: row.effectiveFrom ?? null,
      totalSplitPct: Number(row.totalSplitPct) || 0,
      breakdown: parseBreakdown(row.breakdownJson),
      createdAtMs: Number.isNaN(new Date(row.createdAt).getTime())
        ? 0
        : new Date(row.createdAt).getTime(),
    }))
    .sort((a, b) => {
      const aTime = a.effectiveFrom ? new Date(a.effectiveFrom).getTime() : -1;
      const bTime = b.effectiveFrom ? new Date(b.effectiveFrom).getTime() : -1;

      if (aTime !== bTime) {
        return aTime - bTime;
      }

      return a.createdAtMs - b.createdAtMs;
    });
}
function findEffectiveTimelineSnapshotAt(
  timeline: TimelineSnapshot[],
  at: Date,
): ResolvedSnapshot {
  if (timeline.length === 0) {
    return {
      effectiveFrom: null,
      totalSplitPct: 0,
      breakdown: [],
    };
  }

  let resolved: TimelineSnapshot | null = null;

  for (const row of timeline) {
    const rowTime = row.effectiveFrom
      ? new Date(row.effectiveFrom).getTime()
      : -1;
    if (rowTime <= at.getTime()) {
      resolved = row;
      continue;
    }
    break;
  }

  if (!resolved) {
    return {
      effectiveFrom: null,
      totalSplitPct: 0,
      breakdown: [],
    };
  }

  return {
    effectiveFrom: resolved.effectiveFrom
      ? new Date(resolved.effectiveFrom)
      : null,
    totalSplitPct: Number(resolved.totalSplitPct) || 0,
    breakdown: resolved.breakdown,
  };
}

export function buildSalesCsvForLocalRange({
  salesRows,
  splitHistoryRows,
  rangeStartDate,
  rangeEndDate,
}: BuildSalesCsvOptions): string {
  const timelineRows = normalizeTimeline(splitHistoryRows);
  const rangeStartLocal = startOfLocalDay(rangeStartDate);
  const rangeEndExclusiveLocal = startOfLocalDay(rangeEndDate);

  const daySalesMap = new Map<
    string,
    {
      salesAmount: number;
      deductedAmount: number;
    }
  >();

  for (const row of salesRows) {
    const createdAt = new Date(row.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;

    const localDayStart = startOfLocalDay(createdAt);
    if (
      localDayStart.getTime() < rangeStartLocal.getTime() ||
      localDayStart.getTime() >= rangeEndExclusiveLocal.getTime()
    ) {
      continue;
    }

    const localDayEndSnapshotAt = new Date(
      addLocalDays(localDayStart, 1).getTime() - 1,
    );
    const snapshot = findEffectiveTimelineSnapshotAt(
      timelineRows,
      localDayEndSnapshotAt,
    );

    const amount = Number(row.amount) || 0;
    const splitPct = snapshot?.totalSplitPct ?? 0;
    const deducted = amount * (splitPct / 100);

    const key = toLocalDateKey(createdAt);
    const existing = daySalesMap.get(key) ?? {
      salesAmount: 0,
      deductedAmount: 0,
    };

    existing.salesAmount += amount;
    existing.deductedAmount += deducted;

    daySalesMap.set(key, existing);
  }

  const lines: string[] = [];
  lines.push(CSV_COLUMNS.map((column) => toCsvSafeValue(column)).join(","));

  let dayCursor = rangeStartLocal;
  const dayEndExclusive = rangeEndExclusiveLocal;
  let totalSalesInSpan = 0;
  let totalNetInSpan = 0;

  while (dayCursor.getTime() < dayEndExclusive.getTime()) {
    const dayKey = toLocalDateKey(dayCursor);
    const dayData = daySalesMap.get(dayKey);
    const salesAmount = dayData?.salesAmount ?? 0;

    if (salesAmount <= 0) {
      dayCursor = addLocalDays(dayCursor, 1);
      continue;
    }

    const moneyDeducted = dayData?.deductedAmount ?? 0;
    const totalSplitPercentage = (moneyDeducted / salesAmount) * 100;
    const moneyYouKeep = salesAmount - moneyDeducted;
    totalSalesInSpan += salesAmount;
    totalNetInSpan += moneyYouKeep;

    lines.push(
      [
        "",
        toCsvSafeValue(dayKey),
        toMoney(salesAmount),
        toMoney(moneyYouKeep),
        `${toPercent(totalSplitPercentage)}%`,
      ].join(","),
    );

    dayCursor = addLocalDays(dayCursor, 1);
  }

  if (lines.length === 1) {
    return "";
  }

  lines.push(
    ["Total", "", toMoney(totalSalesInSpan), toMoney(totalNetInSpan), ""].join(
      ",",
    ),
  );

  return lines.join("\n");
}

export function getLocalCsvDateKey(value: Date): string {
  return toLocalDateKey(value);
}

function toFileSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

type BuildSalesCsvFileNameOptions = {
  salesRows: SaleRow[];
  rangeStartDate: Date;
  rangeEndDate: Date;
  rangeLabel: string;
};

function getExportedSalesLocalDayKeys({
  salesRows,
  rangeStartDate,
  rangeEndDate,
}: {
  salesRows: SaleRow[];
  rangeStartDate: Date;
  rangeEndDate: Date;
}): string[] {
  const rangeStartLocal = startOfLocalDay(rangeStartDate);
  const rangeEndExclusiveLocal = startOfLocalDay(rangeEndDate);
  const daySalesMap = new Map<string, number>();

  for (const row of salesRows) {
    const createdAt = new Date(row.createdAt);
    if (Number.isNaN(createdAt.getTime())) continue;

    const localDayStart = startOfLocalDay(createdAt);
    if (
      localDayStart.getTime() < rangeStartLocal.getTime() ||
      localDayStart.getTime() >= rangeEndExclusiveLocal.getTime()
    ) {
      continue;
    }

    const dayKey = toLocalDateKey(localDayStart);
    const nextAmount =
      (daySalesMap.get(dayKey) ?? 0) + (Number(row.amount) || 0);
    daySalesMap.set(dayKey, nextAmount);
  }

  return [...daySalesMap.entries()]
    .filter(([, totalAmount]) => totalAmount > 0)
    .map(([dayKey]) => dayKey)
    .sort();
}

export function buildSalesCsvFileName({
  salesRows,
  rangeStartDate,
  rangeEndDate,
  rangeLabel,
}: BuildSalesCsvFileNameOptions): string {
  const normalizedLabel = rangeLabel.trim();
  const labelSlug = toFileSlug(normalizedLabel);
  const exportedDayKeys = getExportedSalesLocalDayKeys({
    salesRows,
    rangeStartDate,
    rangeEndDate,
  });

  const exportedStartKey = exportedDayKeys[0] ?? null;
  const exportedEndKey =
    exportedDayKeys.length > 0
      ? exportedDayKeys[exportedDayKeys.length - 1]
      : null;

  if (!labelSlug || labelSlug === "all-time") {
    if (exportedStartKey && exportedEndKey) {
      return `sales-download-all-time-${exportedStartKey}-to-${exportedEndKey}.csv`;
    }

    return "sales-download-all-time.csv";
  }

  const filterStartKey = toLocalDateKey(startOfLocalDay(rangeStartDate));
  const filterEndInclusive = addLocalDays(startOfLocalDay(rangeEndDate), -1);
  const filterEndKey = toLocalDateKey(filterEndInclusive);

  const startKey = exportedStartKey ?? filterStartKey;
  const endKey = exportedEndKey ?? filterEndKey;

  return `sales-download-${labelSlug}-${startKey}-to-${endKey}.csv`;
}
