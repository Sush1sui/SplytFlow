import React, { useMemo } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import { formatPct } from "./split-rules-utils";
import useSplitRulesStyles from "./split-rules-stylesheet";
import type {
  SplitCorrectionHistoryEntry,
  SplitHistoryBreakdownItem,
} from "./types";

type SplitCorrectionHistoryCardProps = {
  entries: SplitCorrectionHistoryEntry[];
  loading: boolean;
  error: string | null;
  iconColor: string;
};

type GroupedCorrectionEvent = {
  id: string;
  batchId: string | null;
  start: SplitCorrectionHistoryEntry | null;
  restore: SplitCorrectionHistoryEntry | null;
  fallback: SplitCorrectionHistoryEntry;
};

function parseBreakdown(raw: unknown): SplitHistoryBreakdownItem[] {
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

function toTimestamp(value: string) {
  return new Date(value).getTime();
}

function formatHistoryDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);

  return parsed.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toInclusiveEndDateLabel(restoreEffectiveFrom: string) {
  const restoreDate = new Date(restoreEffectiveFrom);
  restoreDate.setDate(restoreDate.getDate() - 1);
  return formatHistoryDate(restoreDate);
}

function groupCorrectionEvents(
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

export function SplitCorrectionHistoryCard({
  entries,
  loading,
  error,
  iconColor,
}: SplitCorrectionHistoryCardProps) {
  const splitStyles = useSplitRulesStyles();

  const groupedEvents = useMemo(
    () => groupCorrectionEvents(entries),
    [entries],
  );
  const topEvents = useMemo(() => groupedEvents.slice(0, 8), [groupedEvents]);

  return (
    <Card style={splitStyles.historyCard}>
      <ThemedText style={splitStyles.listTitle}>Recent Corrections</ThemedText>

      {loading ? (
        Array.from({ length: 3 }).map((_, index) => (
          <View
            key={`history-skeleton-${index}`}
            style={splitStyles.historyItem}
          >
            <Skeleton width={140} height={12} borderRadius={6} />
            <View style={{ height: 6 }} />
            <Skeleton width="92%" height={12} borderRadius={6} />
            <View style={{ height: 4 }} />
            <Skeleton width="72%" height={12} borderRadius={6} />
          </View>
        ))
      ) : error ? (
        <ThemedText style={[splitStyles.emptyText, { color: iconColor }]}>
          {error}
        </ThemedText>
      ) : topEvents.length === 0 ? (
        <ThemedText style={[splitStyles.emptyText, { color: iconColor }]}>
          No correction events yet.
        </ThemedText>
      ) : (
        topEvents.map((event) => {
          const startEntry = event.start ?? event.fallback;
          const restoreEntry = event.restore;
          const breakdown = parseBreakdown(startEntry.breakdownJson);
          const breakdownLabel =
            breakdown.length > 0
              ? breakdown
                  .slice(0, 3)
                  .map((item) => `${item.name} ${formatPct(item.value)}`)
                  .join(" • ")
              : "No breakdown snapshot";

          const startLabel = formatHistoryDate(startEntry.effectiveFrom);
          const restoreLabel = restoreEntry
            ? toInclusiveEndDateLabel(restoreEntry.effectiveFrom)
            : null;
          const reason = startEntry.reason ?? restoreEntry?.reason ?? null;

          return (
            <View key={event.id} style={splitStyles.historyItem}>
              <View style={splitStyles.historyMetaRow}>
                <ThemedText
                  style={[splitStyles.historyDate, { color: iconColor }]}
                >
                  From {startLabel}
                </ThemedText>
                <View
                  style={[
                    splitStyles.historySourceChip,
                    {
                      borderColor: restoreEntry
                        ? "rgba(245,158,11,0.45)"
                        : "rgba(16,185,129,0.45)",
                      backgroundColor: restoreEntry
                        ? "rgba(245,158,11,0.12)"
                        : "rgba(16,185,129,0.12)",
                    },
                  ]}
                >
                  <ThemedText style={splitStyles.historySourceText}>
                    {restoreEntry ? "Date Range" : "Ongoing"}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={splitStyles.historySummary}>
                Applied split {formatPct(startEntry.totalSplitPct)} •{" "}
                {breakdownLabel}
              </ThemedText>

              {restoreEntry && restoreLabel ? (
                <ThemedText
                  style={[splitStyles.historyReason, { color: iconColor }]}
                >
                  Until {restoreLabel}, then back to{" "}
                  {formatPct(restoreEntry.totalSplitPct)}
                </ThemedText>
              ) : null}

              {reason ? (
                <ThemedText
                  style={[splitStyles.historyReason, { color: iconColor }]}
                >
                  Reason: {reason}
                </ThemedText>
              ) : null}
            </View>
          );
        })
      )}
    </Card>
  );
}
