import React, { memo } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { colorWithOpacity } from "./colors";
import { formatMoney } from "./formatters";
import type { SplitBreakdownTimelineItem, SplitItem } from "./types";

type SalesSplitImpactCardProps = {
  loading: boolean;
  totalSplitPct: number;
  retainedPct: number;
  deductions: number;
  topSplits: SplitItem[];
  splitTimelineRows: SplitBreakdownTimelineItem[];
};

const formatSnapshotDate = (value: string | null) => {
  if (!value) return "Earlier setup";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Earlier setup";

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function SalesSplitImpactCardComponent({
  loading,
  totalSplitPct,
  retainedPct,
  deductions,
  topSplits,
  splitTimelineRows,
}: SalesSplitImpactCardProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const splitTrackColor = colorWithOpacity(iconColor, 0.13);
  const splitFillColor = colorWithOpacity(tint, 0.66);
  const previousTimelineRows = splitTimelineRows.slice(0, -1).reverse();

  return (
    <View style={salesStyles.sectionWrap}>
      <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
        SPLIT IMPACT
      </ThemedText>
      <Card style={salesStyles.splitCard}>
        <View style={salesStyles.splitTopStats}>
          <View style={salesStyles.splitStatBox}>
            <ThemedText
              style={[salesStyles.splitStatLabel, { color: iconColor }]}
            >
              Total Split
            </ThemedText>
            {loading ? (
              <Skeleton width={72} height={22} borderRadius={8} />
            ) : (
              <ThemedText style={salesStyles.splitStatValue}>
                {`${totalSplitPct.toFixed(1)}%`}
              </ThemedText>
            )}
          </View>
          <View style={salesStyles.splitStatBox}>
            <ThemedText
              style={[salesStyles.splitStatLabel, { color: iconColor }]}
            >
              Retained
            </ThemedText>
            {loading ? (
              <Skeleton width={72} height={22} borderRadius={8} />
            ) : (
              <ThemedText style={salesStyles.splitStatValue}>
                {`${retainedPct.toFixed(1)}%`}
              </ThemedText>
            )}
          </View>
        </View>

        {loading ? (
          <View style={[salesStyles.splitMeta, { marginBottom: 12 }]}>
            <Skeleton width={168} height={12} borderRadius={6} />
          </View>
        ) : (
          <ThemedText style={[salesStyles.splitMeta, { color: iconColor }]}>
            Estimated deductions: {formatMoney(deductions)}
          </ThemedText>
        )}

        {loading ? (
          <View style={salesStyles.splitList}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`split-skeleton-${index}`}
                style={salesStyles.splitRow}
              >
                <View style={salesStyles.splitRowHeader}>
                  <Skeleton width={84} height={12} borderRadius={6} />
                  <Skeleton width={40} height={12} borderRadius={6} />
                </View>
                <Skeleton width="100%" height={8} borderRadius={999} />
              </View>
            ))}
          </View>
        ) : topSplits.length === 0 ? (
          <View style={salesStyles.emptyRowCompact}>
            <ThemedText style={[salesStyles.emptyText, { color: iconColor }]}>
              No configured splits
            </ThemedText>
          </View>
        ) : (
          <View style={salesStyles.splitList}>
            {topSplits.map((split) => {
              const pct = Math.max(0, Math.min(100, Number(split.value) || 0));

              return (
                <View key={split.id} style={salesStyles.splitRow}>
                  <View style={salesStyles.splitRowHeader}>
                    <ThemedText style={salesStyles.splitName}>
                      {split.name}
                    </ThemedText>
                    <ThemedText
                      style={[salesStyles.splitPct, { color: iconColor }]}
                    >
                      {pct.toFixed(1)}%
                    </ThemedText>
                  </View>
                  <View
                    style={[
                      salesStyles.splitBarTrack,
                      { backgroundColor: splitTrackColor },
                    ]}
                  >
                    <View
                      style={[
                        salesStyles.splitBarFill,
                        {
                          width: `${pct}%`,
                          backgroundColor: splitFillColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {loading ? null : previousTimelineRows.length > 0 ? (
          <View style={salesStyles.splitHistoryWrap}>
            <ThemedText
              style={[salesStyles.splitHistoryTitle, { color: iconColor }]}
            >
              Also used in this range
            </ThemedText>

            {previousTimelineRows.slice(0, 3).map((snapshot, index) => {
              const breakdownLabel = snapshot.breakdown
                .slice(0, 3)
                .map((item) => `${item.name} ${Number(item.value).toFixed(1)}%`)
                .join(" • ");

              return (
                <View
                  key={`${snapshot.effectiveFrom ?? "none"}-${index}`}
                  style={salesStyles.splitHistoryItem}
                >
                  <ThemedText
                    style={[salesStyles.splitHistoryDate, { color: iconColor }]}
                  >
                    From {formatSnapshotDate(snapshot.effectiveFrom)}
                  </ThemedText>
                  <ThemedText style={salesStyles.splitHistorySummary}>
                    {`${Number(snapshot.totalSplitPct).toFixed(1)}% split`}
                    {breakdownLabel ? ` • ${breakdownLabel}` : ""}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        ) : null}
      </Card>
    </View>
  );
}

export const SalesSplitImpactCard = memo(SalesSplitImpactCardComponent);
