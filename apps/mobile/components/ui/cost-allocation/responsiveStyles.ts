import { Spacing, Typography } from "@/constants/Theme";

export type CostAllocationResponsiveStylesType = {
  scrollContent: {
    padding: number;
  };
  title: {
    fontSize: number;
  };
  summaryAmount: {
    fontSize: number;
  };
  actionsRow: {
    flexDirection: "column" | "row";
    gap: number;
  };
  itemHeader: {
    flexDirection: "column" | "row";
    gap: number;
  };
  itemAmount: {
    fontSize: number;
    alignSelf: "flex-start" | "flex-end";
  };
  recipientTags: {
    gap: number;
    maxWidth: string;
  };
};

export function costAllocationResponsiveStyles({
  isSmallScreen,
  isLargeScreen,
}: {
  isSmallScreen: boolean;
  isLargeScreen: boolean;
}) {
  return {
    scrollContent: {
      padding: isSmallScreen ? Spacing.sm : Spacing.md,
    },
    title: {
      fontSize: isSmallScreen ? Typography.size.xl : Typography.size["2xl"],
    },
    summaryAmount: {
      fontSize: isSmallScreen ? Typography.size["2xl"] : Typography.size["3xl"],
    },
    actionsRow: {
      flexDirection: (isSmallScreen ? "column" : "row") as "column" | "row",
      gap: Spacing.sm,
    },
    itemHeader: {
      flexDirection: (isSmallScreen ? "column" : "row") as "column" | "row",
      gap: isSmallScreen ? Spacing.xs : 0,
    },
    itemAmount: {
      fontSize: isSmallScreen ? Typography.size.lg : Typography.size.xl,
      alignSelf: isSmallScreen
        ? "flex-start"
        : ("flex-end" as "flex-start" | "flex-end"),
    },
    recipientTags: {
      gap: Spacing.xs,
      maxWidth: isLargeScreen ? "80%" : "100%",
    },
  };
}
