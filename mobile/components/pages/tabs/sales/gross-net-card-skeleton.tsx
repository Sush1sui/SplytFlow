import React from "react";
import { XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";

function SkeletonBox({ space }: { space: (a: number, b?: number, c?: number) => number }) {
  return (
    <YStack
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: space(16),
        gap: 10,
      }}
    >
      {/* Label */}
      <Skeleton width={72} height={12} borderRadius={6} />
      {/* Big number */}
      <Skeleton width={130} height={32} borderRadius={8} />
      {/* Sub-label */}
      <Skeleton width={90} height={11} borderRadius={5} />
    </YStack>
  );
}

export default function GrossNetCardSkeleton({ isNarrow }: { isNarrow: boolean }) {
  const { space } = useTabResponsive();

  return (
    <SkeletonGroup>
      <XStack
        style={{
          marginTop: space(16),
          flexDirection: isNarrow ? "column" : "row",
        }}
        gap="$3"
      >
        <SkeletonBox space={space} />
        <SkeletonBox space={space} />
      </XStack>
    </SkeletonGroup>
  );
}
