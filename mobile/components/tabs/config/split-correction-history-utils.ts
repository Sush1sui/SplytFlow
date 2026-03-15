import { formatPct } from "./split-rules-utils";
import type {
  SplitCorrectionHistoryEntry,
  SplitHistoryBreakdownItem,
} from "./types";

export type GroupedCorrectionEvent = {
  id: string;
  batchId: string | null;
  start: SplitCorrectionHistoryEntry | null;
  restore: SplitCorrectionHistoryEntry | null;
  fallback: SplitCorrectionHistoryEntry;
};

export function parseBreakdown(raw: unknown): SplitHistoryBreakdownItem[] {
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

      return { name, value };
    })
    .filter((item): item is SplitHistoryBreakdownItem => item !== null)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
}

export function toTimestamp(value: string) {
  return new Date(value).getTime();
}

export function formatHistoryDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);

  return parsed.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function toInclusiveEndDateLabel(restoreEffectiveFrom: string) {
  const restoreDate = new Date(restoreEffectiveFrom);
  restoreDate.setDate(restoreDate.getDate() - 1);
  return formatHistoryDate(restoreDate);
}

export function toBreakdownLabel(raw: unknown): string {
  const breakdown = parseBreakdown(raw);
  if (breakdown.length === 0) return "No breakdown snapshot";

  return breakdown
    .slice(0, 3)
    .map((item) => `${item.name} ${formatPct(item.value)}`)
    .join(" • ");
}

export function groupCorrectionEvents(
  entries: SplitCorrectionHistoryEntry[],
): GroupedCorrectionEvent[] {
  const grouped = new Map<string, GroupedCorrectionEvent>();

  for (const entry of entries) {
    const key = entry.correctionBatchId ?? `single:${entry.id}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        id: key,
        batchId: entry.correctionBatchId,
        start: entry.source === "correction_start" ? entry : null,
        restore: entry.source === "correction_restore" ? entry : null,
        fallback: entry,
      });
      continue;
    }

    if (entry.source === "correction_start") {
      existing.start = entry;
    } else if (entry.source === "correction_restore") {
      existing.restore = entry;
    }

    if (
      toTimestamp(entry.effectiveFrom) >
      toTimestamp(existing.fallback.effectiveFrom)
    ) {
      existing.fallback = entry;
    }
  }

  return [...grouped.values()].sort((left, right) => {
    const leftAt = left.start ?? left.fallback;
    const rightAt = right.start ?? right.fallback;
    return (
      toTimestamp(rightAt.effectiveFrom) - toTimestamp(leftAt.effectiveFrom)
    );
  });
}
