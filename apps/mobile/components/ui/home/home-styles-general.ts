import { Spacing, Typography } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const homeStylesGeneral = StyleSheet.create({
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

export { homeStylesGeneral };
