import { Spacing, Typography } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const settingsGeneralStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },

  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    letterSpacing: 0.5,
  },
  sectionCard: {
    padding: 0,
  },
  logoutButton: {
    padding: Spacing.md,
    alignItems: "center",
  },
  logoutText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});

export { settingsGeneralStyles };
