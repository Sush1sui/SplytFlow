import { Spacing, Typography } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const analyticsGeneralStyles = StyleSheet.create({
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

export { analyticsGeneralStyles };
