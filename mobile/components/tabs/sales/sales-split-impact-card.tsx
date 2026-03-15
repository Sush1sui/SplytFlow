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
import type { SplitItem } from "./types";

type SalesSplitImpactCardProps = {
  loading: boolean;
  totalSplitPct: number;
  retainedPct: number;
  deductions: number;
  topSplits: SplitItem[];
};

function SalesSplitImpactCardComponent({
  loading,
  totalSplitPct,
  retainedPct,
  deductions,
  topSplits,
}: SalesSplitImpactCardProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const splitTrackColor = colorWithOpacity(iconColor, 0.13);
  const splitFillColor = colorWithOpacity(tint, 0.66);

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
      </Card>
    </View>
  );
}

export const SalesSplitImpactCard = memo(SalesSplitImpactCardComponent);
