import { Spacing, Typography } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const profileSectionStyles = StyleSheet.create({
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.xs,
  },
  profileEmail: {
    fontSize: Typography.size.sm,
  },
});

export { profileSectionStyles };
