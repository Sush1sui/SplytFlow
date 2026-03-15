import React, { memo, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useHomeStyles from "@/app/(tabs)/home-stylesheet";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { formatAmount } from "./formatters";

type TodaySalesStatsProps = {
  totalSales: number;
  netSales: number;
  loading: boolean;
};

function TodaySalesStatsComponent({
  totalSales,
  netSales,
  loading,
}: TodaySalesStatsProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const { width } = useWindowDimensions();
  const homeStyles = useHomeStyles();
  const tabsStyles = useTabsStyles();
  const isNarrow = width < 360;

  const stats = useMemo(
    () => [
      {
        label: "Total Sales",
        value: loading ? "—" : formatAmount(totalSales),
        icon: "cash-outline" as const,
      },
      {
        label: "Net Sales",
        value: loading ? "—" : formatAmount(netSales),
        icon: "trending-up-outline" as const,
      },
    ],
    [loading, netSales, totalSales],
  );

  return (
    <>
      <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
        TODAY&apos;S SALES
      </ThemedText>
      <View style={[homeStyles.statsRow, isNarrow && homeStyles.statsRowStack]}>
        {stats.map((stat) => (
          <Card
            key={stat.label}
            style={[homeStyles.statCard, isNarrow && homeStyles.statCardStack]}
          >
            <Ionicons name={stat.icon} size={20} color={tint} />
            <ThemedText style={homeStyles.statValue}>{stat.value}</ThemedText>
            <ThemedText style={[homeStyles.statLabel, { color: iconColor }]}>
              {stat.label}
            </ThemedText>
          </Card>
        ))}
      </View>
    </>
  );
}

export const TodaySalesStats = memo(TodaySalesStatsComponent);
