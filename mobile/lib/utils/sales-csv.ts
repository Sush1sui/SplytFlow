import { SaleRow } from "@/types/sale.types";
import { computeNetSale } from "./sale";

type BuildSalesCsvParams = {
  rows: SaleRow[];
  rangeLabel: string;
  splitPercentage: number;
  exportedAt: Date;
};

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatAmount(value: number): string {
  return roundToTwo(value).toFixed(2);
}

function formatCurrency(value: number): string {
  return `$${formatAmount(value)}`;
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
}: BuildSalesCsvParams): string {
  const normalizedRows = [...rows].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const roundedSplitPct = roundToTwo(splitPercentage);
  const grossTotal = normalizedRows.reduce((sum, row) => sum + row.amount, 0);
  const splitTotal = normalizedRows.reduce(
    (sum, row) => sum + (row.amount * splitPercentage) / 100,
    0,
  );
  const netTotal = normalizedRows.reduce(
    (sum, row) => sum + computeNetSale(row.amount, splitPercentage),
    0,
  );

  const lines: string[] = [];

  lines.push(toCsvLine(["SplytFlow Sales Report", "", "", "", "", "", ""]));
  lines.push(toCsvLine(["Range", rangeLabel]));
  lines.push(toCsvLine(["Exported", formatExportedAt(exportedAt)]));
  lines.push(toCsvLine(["Records", String(normalizedRows.length)]));
  lines.push(toCsvLine(["Applied Split", `${roundedSplitPct}%`]));
  lines.push(toCsvLine(["Total Gross", formatCurrency(grossTotal)]));
  lines.push(toCsvLine(["Total Split Deducted", formatCurrency(splitTotal)]));
  lines.push(toCsvLine(["Total Net", formatCurrency(netTotal)]));
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
    const splitDeduction = (row.amount * splitPercentage) / 100;

    lines.push(
      toCsvLine([
        String(index + 1),
        formatDate(row.createdAt),
        formatTime(row.createdAt),
        formatCurrency(row.amount),
        `${roundedSplitPct}%`,
        formatCurrency(splitDeduction),
        formatCurrency(computeNetSale(row.amount, splitPercentage)),
      ]),
    );
  });

  lines.push(
    toCsvLine([
      "TOTAL",
      "",
      "",
      formatCurrency(grossTotal),
      `${roundedSplitPct}%`,
      formatCurrency(splitTotal),
      formatCurrency(netTotal),
    ]),
  );

  return lines.join("\n");
}
