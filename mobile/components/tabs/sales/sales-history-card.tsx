import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { colorWithOpacity } from "./colors";
import { formatHistoryDate, formatMoney } from "./formatters";
import type { SaleRow } from "./types";

type SalesHistoryCardProps = {
  loading: boolean;
  rows: SaleRow[];
};

function SalesHistoryCardComponent({ loading, rows }: SalesHistoryCardProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const tintSoft = colorWithOpacity(tint, 0.1);

  return (
    <View style={salesStyles.sectionWrap}>
      <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
        SALES HISTORY
      </ThemedText>
      <Card style={salesStyles.historyCard}>
        {loading ? (
          <View>
            {Array.from({ length: 4 }).map((_, index) => (
              <View key={`history-skeleton-${index}`}>
                <View style={salesStyles.historyRow}>
                  <Skeleton width={32} height={32} borderRadius={9} />
                  <View style={salesStyles.historyInfo}>
                    <Skeleton width={86} height={12} borderRadius={6} />
                    <View style={{ height: 5 }} />
                    <Skeleton width={104} height={10} borderRadius={6} />
                  </View>
                  <Skeleton width={72} height={14} borderRadius={7} />
                </View>
                {index < 3 && <View style={tabsStyles.divider} />}
              </View>
            ))}
          </View>
        ) : rows.length === 0 ? (
          <View style={salesStyles.emptyRow}>
            <ThemedText style={[salesStyles.emptyText, { color: iconColor }]}>
              No sales in this range
            </ThemedText>
          </View>
        ) : (
          rows.map((row, index) => (
            <View key={row.id}>
              <View style={salesStyles.historyRow}>
                <View
                  style={[
                    tabsStyles.centerContent,
                    salesStyles.historyIcon,
                    { backgroundColor: tintSoft },
                  ]}
                >
                  <Ionicons name="calendar-outline" size={16} color={tint} />
                </View>
                <View style={salesStyles.historyInfo}>
                  <ThemedText style={salesStyles.historyLabel}>
                    Day Bucket
                  </ThemedText>
                  <ThemedText
                    style={[salesStyles.historyDate, { color: iconColor }]}
                  >
                    {formatHistoryDate(row.createdAt)}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[salesStyles.historyAmount, { color: tint }]}
                >
                  {formatMoney(Number(row.amount) || 0)}
                </ThemedText>
              </View>
              {index < rows.length - 1 && <View style={tabsStyles.divider} />}
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

export const SalesHistoryCard = memo(SalesHistoryCardComponent);
