import React, { memo } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useHomeStyles from "@/app/(tabs)/home-stylesheet";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { formatAmount, formatSaleTime } from "./formatters";
import type { TodaySale } from "./types";

type RecentSalesCardProps = {
  sales: TodaySale[];
  loading: boolean;
};

function RecentSalesCardComponent({ sales, loading }: RecentSalesCardProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const homeStyles = useHomeStyles();
  const tabsStyles = useTabsStyles();

  return (
    <View style={homeStyles.recentSection}>
      <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
        RECENT SALES
      </ThemedText>
      <Card>
        {loading ? (
          <View style={homeStyles.recentEmptyRow}>
            <ThemedText
              style={[homeStyles.recentEmptyText, { color: iconColor }]}
            >
              Loading recent sales...
            </ThemedText>
          </View>
        ) : sales.length === 0 ? (
          <View style={homeStyles.recentEmptyRow}>
            <ThemedText
              style={[homeStyles.recentEmptyText, { color: iconColor }]}
            >
              No sales yet for today
            </ThemedText>
          </View>
        ) : (
          sales.map((sale, index) => (
            <View key={sale.id}>
              <View style={homeStyles.recentRow}>
                <View
                  style={[
                    tabsStyles.centerContent,
                    homeStyles.recentIcon,
                    { backgroundColor: `${tint}16` },
                  ]}
                >
                  <Ionicons name="time-outline" size={16} color={tint} />
                </View>
                <View style={homeStyles.recentInfo}>
                  <ThemedText style={homeStyles.recentLabel}>Sale</ThemedText>
                  <ThemedText
                    style={[homeStyles.recentTime, { color: iconColor }]}
                  >
                    {formatSaleTime(sale.createdAt)}
                  </ThemedText>
                </View>
                <ThemedText style={[homeStyles.recentAmount, { color: tint }]}>
                  {formatAmount(Number(sale.amount) || 0)}
                </ThemedText>
              </View>
              {index < sales.length - 1 && <View style={tabsStyles.divider} />}
            </View>
          ))
        )}
      </Card>
    </View>
  );
}

export const RecentSalesCard = memo(RecentSalesCardComponent);
