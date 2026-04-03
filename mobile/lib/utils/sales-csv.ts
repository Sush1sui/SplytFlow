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

function formatTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
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

  const roundedSplitPct = roundToTwo(splitPercentage);
  const grossTotalStored = normalizedRows.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const splitTotalStored = normalizedRows.reduce(
    (sum, row) => sum + (row.amount * splitPercentage) / 100,
    0,
  );
  const netTotalStored = normalizedRows.reduce(
    (sum, row) => sum + computeNetSale(row.amount, splitPercentage),
    0,
  );

  const grossTotal = convertStoredToDisplay(grossTotalStored);
  const splitTotal = convertStoredToDisplay(splitTotalStored);
  const netTotal = convertStoredToDisplay(netTotalStored);

  const lines: string[] = [];

  lines.push(toCsvLine(["SplytFlow Sales Report", "", "", "", "", "", ""]));
  lines.push(toCsvLine(["Range", rangeLabel]));
  lines.push(toCsvLine(["Exported", formatExportedAt(exportedAt)]));
  lines.push(toCsvLine(["Records", String(normalizedRows.length)]));
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
      "Time",
      "Gross Sale",
      "Split %",
      "Split Deduction",
      "Net Sale",
    ]),
  );

  normalizedRows.forEach((row, index) => {
    const splitDeductionStored = (row.amount * splitPercentage) / 100;
    const grossDisplay = convertStoredToDisplay(row.amount);
    const splitDeductionDisplay = convertStoredToDisplay(splitDeductionStored);
    const netDisplay = convertStoredToDisplay(
      computeNetSale(row.amount, splitPercentage),
    );

    lines.push(
      toCsvLine([
        String(index + 1),
        formatDate(row.createdAt),
        formatTime(row.createdAt),
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
      "",
      formatCurrency(grossTotal, currencyCode),
      `${roundedSplitPct}%`,
      formatCurrency(splitTotal, currencyCode),
      formatCurrency(netTotal, currencyCode),
    ]),
  );

  return lines.join("\n");
}
