import React from "react";
import { XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import { Skeleton } from "@/components/skeleton";

export default function GrossNetCardSkeleton({ isNarrow }: { isNarrow: boolean }) {
  const { space } = useTabResponsive();

  const SkeletonBox = () => (
    <YStack
      style={{
        flex: 1,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: space(14),
      }}
    >
      <Skeleton width={80} height={14} borderRadius={7} />
      <Skeleton width={140} height={28} borderRadius={6} />
      <Skeleton width={100} height={14} borderRadius={7} />
    </YStack>
  );

  return (
    <XStack
      style={{
        marginTop: space(16),
        flexDirection: isNarrow ? "column" : "row",
      }}
      gap="$3"
    >
      <SkeletonBox />
      <SkeletonBox />
    </XStack>
  );
}
