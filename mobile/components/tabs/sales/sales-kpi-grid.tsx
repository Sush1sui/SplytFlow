import React, { memo, useMemo } from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { colorWithOpacity } from "./colors";
import { formatMoney } from "./formatters";

type SalesKpiGridProps = {
  loading: boolean;
  grossSales: number;
  netSales: number;
  avgSalesPerDay: number;
  avgSalesPerActiveDay: number;
  saleCount: number;
};

function SalesKpiGridComponent({
  loading,
  grossSales,
  netSales,
  avgSalesPerDay,
  avgSalesPerActiveDay,
  saleCount,
}: SalesKpiGridProps) {
  const tint = useThemeColor({}, "tint");
  const iconColor = useThemeColor({}, "icon");
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const tintSoft = colorWithOpacity(tint, 0.1);

  const cards = useMemo(
    () => [
      {
        label: "Total Sales",
        value: formatMoney(grossSales),
        icon: "cash-outline" as const,
      },
      {
        label: "You Keep",
        value: formatMoney(netSales),
        icon: "trending-up-outline" as const,
      },
      {
        label: "Avg Per Day (Range)",
        value: formatMoney(avgSalesPerDay),
        icon: "analytics-outline" as const,
      },
      {
        label: "Avg Per Active Day",
        value: formatMoney(avgSalesPerActiveDay),
        icon: "bar-chart-outline" as const,
      },
      {
        label: "Active Days",
        value: String(saleCount),
        icon: "layers-outline" as const,
      },
    ],
    [avgSalesPerActiveDay, avgSalesPerDay, grossSales, netSales, saleCount],
  );

  return (
    <View style={salesStyles.sectionWrap}>
      <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
        OVERVIEW
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={salesStyles.kpiRowScroll}
        contentContainerStyle={salesStyles.kpiRowContent}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Card key={`kpi-skeleton-${index}`} style={salesStyles.kpiCard}>
                <View style={salesStyles.kpiHeader}>
                  <Skeleton width={28} height={28} borderRadius={9} />
                  <Skeleton width={86} height={12} borderRadius={6} />
                </View>
                <Skeleton
                  width={index === 4 ? 48 : 112}
                  height={22}
                  borderRadius={8}
                />
              </Card>
            ))
          : cards.map((item) => (
              <Card key={item.label} style={salesStyles.kpiCard}>
                <View style={salesStyles.kpiHeader}>
                  <View
                    style={[
                      tabsStyles.centerContent,
                      salesStyles.kpiIcon,
                      { backgroundColor: tintSoft },
                    ]}
                  >
                    <Ionicons name={item.icon} size={16} color={tint} />
                  </View>
                  <ThemedText
                    style={[salesStyles.kpiLabel, { color: iconColor }]}
                  >
                    {item.label}
                  </ThemedText>
                </View>
                <ThemedText style={salesStyles.kpiValue}>
                  {item.value}
                </ThemedText>
              </Card>
            ))}
      </ScrollView>
    </View>
  );
}

export const SalesKpiGrid = memo(SalesKpiGridComponent);
