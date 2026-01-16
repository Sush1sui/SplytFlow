import { ScrollView } from "react-native";
import { View, Text } from "@/components/Themed";
import { Card } from "@/components/ui";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { analyticsGeneralStyles as styles } from "@/components/ui/analytics/analytics-general-styles";
import PeriodSelector from "@/components/ui/analytics/period-selector";
import OverviewStats from "@/components/ui/analytics/overview-stats";
import SalesBreakdown from "@/components/ui/analytics/sales-breakdown";

type TimePeriod = "today" | "week" | "month" | "year";

export default function AnalyticsScreen() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("today");

  const periods: { value: TimePeriod; label: string }[] = [
    { value: "today", label: "Today" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your business performance
          </Text>
        </View>

        {/* Period Selector */}
        <PeriodSelector
          periods={periods}
          selectedPeriod={selectedPeriod}
          setSelectedPeriod={setSelectedPeriod}
        />

        {/* Overview Stats */}
        <OverviewStats />

        {/* Sales Breakdown */}
        <SalesBreakdown />
      </ScrollView>
    </View>
  );
}
