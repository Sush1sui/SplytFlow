import { SaleRow } from "@/types/sale.types";
import { computeNetSale } from "./sale";
import {
  currencySymbol,
  type SupportedCurrencyCode,
} from "@/constants/currency";

type BuildSalesCsvParams = {
  rows: SaleRow[];
  rangeLabel: string;
  splitPercentage: number;
  exportedAt: Date;
  currencyCode: SupportedCurrencyCode;
  convertStoredToDisplay: (amount: number) => number;
};

type DailySaleAggregate = {
  dateLabel: string;
  grossStored: number;
  sortTs: number;
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatAmount(value: number): string {
  return roundToTwo(value).toFixed(2);
}

function formatCurrency(
  value: number,
  currencyCode: SupportedCurrencyCode,
): string {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  try {
    const number = new Intl.NumberFormat(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absolute);

    return `${sign}${currencySymbol(currencyCode)}${number}`;
  } catch {
    return `${sign}${currencySymbol(currencyCode)}${formatAmount(absolute)}`;
  }
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatExportedAt(value: Date): string {
  return value.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function toCsvLine(cells: string[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export function buildSalesCsv({
  rows,
  rangeLabel,
  splitPercentage,
  exportedAt,
  currencyCode,
  convertStoredToDisplay,
}: BuildSalesCsvParams): string {
  const normalizedRows = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const aggregatedByDate = new Map<string, DailySaleAggregate>();

  normalizedRows.forEach((row) => {
    const dateLabel = formatDate(row.createdAt);
    const ts = new Date(row.createdAt).getTime();
    const existing = aggregatedByDate.get(dateLabel);

    if (!existing) {
      aggregatedByDate.set(dateLabel, {
        dateLabel,
        grossStored: row.amount,
        sortTs: Number.isNaN(ts) ? 0 : ts,
      });
      return;
    }

    existing.grossStored += row.amount;

    if (!Number.isNaN(ts) && ts > existing.sortTs) {
      existing.sortTs = ts;
    }
  });

  const dailyRows = [...aggregatedByDate.values()].sort(
    (a, b) => b.sortTs - a.sortTs,
  );

  const roundedSplitPct = roundToTwo(splitPercentage);
  const grossTotalStored = dailyRows.reduce(
    (sum, row) => sum + row.grossStored,
    0,
  );
  const splitTotalStored = dailyRows.reduce(
    (sum, row) => sum + (row.grossStored * splitPercentage) / 100,
    0,
  );
  const netTotalStored = dailyRows.reduce(
    (sum, row) => sum + computeNetSale(row.grossStored, splitPercentage),
    0,
  );

  const grossTotal = convertStoredToDisplay(grossTotalStored);
  const splitTotal = convertStoredToDisplay(splitTotalStored);
  const netTotal = convertStoredToDisplay(netTotalStored);

  const lines: string[] = [];

  lines.push(toCsvLine(["SplytFlow Sales Report", "", "", "", "", "", ""]));
  lines.push(toCsvLine(["Range", rangeLabel]));
  lines.push(toCsvLine(["Exported", formatExportedAt(exportedAt)]));
  lines.push(toCsvLine(["Records", String(dailyRows.length)]));
  lines.push(toCsvLine(["Currency", currencyCode]));
  lines.push(toCsvLine(["Applied Split", `${roundedSplitPct}%`]));
  lines.push(
    toCsvLine(["Total Gross", formatCurrency(grossTotal, currencyCode)]),
  );
  lines.push(
    toCsvLine([
      "Total Split Deducted",
      formatCurrency(splitTotal, currencyCode),
    ]),
  );
  lines.push(toCsvLine(["Total Net", formatCurrency(netTotal, currencyCode)]));
  lines.push("");

  lines.push(
    toCsvLine([
      "#",
      "Date",
      "Gross Sale",
      "Split %",
      "Split Deduction",
      "Net Sale",
    ]),
  );

  dailyRows.forEach((row, index) => {
    const splitDeductionStored = (row.grossStored * splitPercentage) / 100;
    const grossDisplay = convertStoredToDisplay(row.grossStored);
    const splitDeductionDisplay = convertStoredToDisplay(splitDeductionStored);
    const netDisplay = convertStoredToDisplay(
      computeNetSale(row.grossStored, splitPercentage),
    );

    lines.push(
      toCsvLine([
        String(index + 1),
        row.dateLabel,
        formatCurrency(grossDisplay, currencyCode),
        `${roundedSplitPct}%`,
        formatCurrency(splitDeductionDisplay, currencyCode),
        formatCurrency(netDisplay, currencyCode),
      ]),
    );
  });

  lines.push(
    toCsvLine([
      "TOTAL",
      "",
      formatCurrency(grossTotal, currencyCode),
      `${roundedSplitPct}%`,
      formatCurrency(splitTotal, currencyCode),
      formatCurrency(netTotal, currencyCode),
    ]),
  );

  return lines.join("\n");
}
