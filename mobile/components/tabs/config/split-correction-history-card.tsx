import React, { useMemo } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import { formatPct } from "./split-rules-utils";
import useSplitRulesStyles from "./split-rules-stylesheet";
import type { SplitCorrectionHistoryEntry } from "./types";
import {
  formatHistoryDate,
  groupCorrectionEvents,
  toBreakdownLabel,
  toInclusiveEndDateLabel,
} from "./split-correction-history-utils";

type SplitCorrectionHistoryCardProps = {
  entries: SplitCorrectionHistoryEntry[];
  loading: boolean;
  error: string | null;
  iconColor: string;
};

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
          const breakdownLabel = toBreakdownLabel(startEntry.breakdownJson);

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
