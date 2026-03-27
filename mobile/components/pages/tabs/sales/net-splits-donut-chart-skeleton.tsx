import React from "react";
import { YStack, Paragraph } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import { Skeleton } from "@/components/skeleton";

export default function NetSplitsDonutChartSkeleton() {
  const { space, font } = useTabResponsive();

  return (
    <YStack
      style={{
        marginTop: space(18),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: space(16),
      }}
      gap="$3"
    >
      <Paragraph
        style={{
          color: "#0f172a",
          fontWeight: "800",
          fontSize: font(18, 15, 20),
          textAlign: "center",
        }}
      >
        Net Sales & Splits Distribution
      </Paragraph>
      <YStack style={{ height: 200, justifyContent: "center", alignItems: "center" }}>
        <Skeleton width={160} height={160} borderRadius={80} />
      </YStack>
    </YStack>
  );
}
