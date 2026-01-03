import { StyleSheet, ScrollView } from "react-native";
import { View } from "@/components/Themed";
import { Typography, Spacing } from "@/constants/Theme";
import { Text } from "@/components/Themed";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import RecentSalesHome from "@/components/ui/home/recent_sales/recent_sales_home";
import QuickAddSalesHome from "@/components/ui/home/quick_add_sales/quick_add_sales_home";
import TodaysStatsHome from "@/components/ui/home/todays_stats/todays_stats";

export default function HomeScreen() {
  const colorScheme = "light";
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: colors.text }]}>
            Good morning 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's your business today
          </Text>
        </View>

        {/* Today's Stats */}
        <TodaysStatsHome styles={styles} />

        {/* Quick Add Sale Card */}
        <QuickAddSalesHome styles={styles} />

        {/* Recent Sales */}
        <RecentSalesHome styles={styles} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
    marginTop: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.base,
    lineHeight: Typography.size.base * 1.5,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.size.sm,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  statValue: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  statChange: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.regular,
  },
  quickAddCard: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  input: {
    marginBottom: Spacing.md,
  },
  recentCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  emptyState: {
    paddingVertical: Spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.size.base,
    marginBottom: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },
  emptySubtext: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.regular,
  },
});
export type HomeStylesType = typeof styles;
