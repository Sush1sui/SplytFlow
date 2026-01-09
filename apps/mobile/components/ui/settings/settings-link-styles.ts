import { Spacing, Typography } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const settingsStyles = StyleSheet.create({
  settingsLink: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  linkContent: {
    flex: 1,
  },
  linkHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  linkTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.semibold,
  },
  linkSubtitle: {
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
});

export { settingsStyles };
