import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { View, Text } from "@/components/Themed";
import { Card } from "@/components/ui";
import { Typography, Spacing } from "@/constants/Theme";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useState } from "react";

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
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.value}
              style={[
                styles.periodButton,
                {
                  backgroundColor:
                    selectedPeriod === period.value
                      ? colors.primary
                      : colors.backgroundSecondary,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedPeriod(period.value)}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color:
                      selectedPeriod === period.value
                        ? colors.textInverse
                        : colors.textSecondary,
                    fontWeight:
                      selectedPeriod === period.value
                        ? Typography.weight.semibold
                        : Typography.weight.medium,
                  },
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Stats */}
        <Card style={styles.overviewCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Overview
          </Text>

          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Sales
              </Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                $0.00
              </Text>
            </View>

            <View style={styles.stat}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Costs
              </Text>
              <Text style={[styles.statValue, { color: colors.error }]}>
                $0.00
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Net Profit
            </Text>
            <Text style={[styles.profitValue, { color: colors.success }]}>
              $0.00
            </Text>
            <Text style={[styles.profitMargin, { color: colors.textTertiary }]}>
              0% profit margin
            </Text>
          </View>
        </Card>

        {/* Sales Breakdown */}
        <Card style={styles.breakdownCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Sales Breakdown
          </Text>

          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No sales data for this period
            </Text>
          </View>
        </Card>

        {/* Top Products/Categories */}
        <Card style={styles.topItemsCard}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Top Items
          </Text>

          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              Start tracking sales to see top items
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const React = require("react");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing["2xl"],
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },
  periodSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  periodText: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  overviewCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  statRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  profitValue: {
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  profitMargin: {
    fontSize: Typography.size.sm,
  },
  breakdownCard: {
    marginBottom: Spacing.lg,
  },
  topItemsCard: {
    marginBottom: Spacing.lg,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.size.base,
  },
});
