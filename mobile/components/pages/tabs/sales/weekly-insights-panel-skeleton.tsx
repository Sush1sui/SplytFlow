import React from "react";
import { XStack, YStack } from "tamagui";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";

type WeeklyInsightsPanelSkeletonProps = {
  isNarrow: boolean;
};

export default function WeeklyInsightsPanelSkeleton({
  isNarrow,
}: WeeklyInsightsPanelSkeletonProps) {
  return (
    <SkeletonGroup>
      <YStack
        style={{
          marginTop: 14,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          padding: 14,
        }}
        gap="$3"
      >
        <Skeleton width="46%" height={16} borderRadius={8} />

        <XStack
          style={{ flexDirection: isNarrow ? "column" : "row", width: "100%" }}
          gap="$2.5"
        >
          <YStack
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
              padding: 12,
            }}
            gap="$1.5"
          >
            <Skeleton width="64%" height={12} borderRadius={6} />
            <Skeleton width="80%" height={28} borderRadius={10} />
            <Skeleton width="70%" height={12} borderRadius={6} />
          </YStack>

          <YStack
            style={{
              flex: 1,
              minWidth: 0,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#f8fafc",
              padding: 12,
            }}
            gap="$1.5"
          >
            <Skeleton width="58%" height={12} borderRadius={6} />
            <Skeleton width="76%" height={28} borderRadius={10} />
            <Skeleton width="72%" height={12} borderRadius={6} />
          </YStack>
        </XStack>

        <YStack
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#f8fafc",
            padding: 12,
          }}
          gap="$1.5"
        >
          <Skeleton width="42%" height={12} borderRadius={6} />
          <Skeleton width="100%" height={12} borderRadius={6} />
          <Skeleton width="88%" height={12} borderRadius={6} />
          <Skeleton width="70%" height={12} borderRadius={6} />
        </YStack>

        <YStack gap="$1.5">
          <Skeleton width="38%" height={12} borderRadius={6} />
          <XStack style={{ alignItems: "center" }} gap="$2">
            <Skeleton width={14} height={14} borderRadius={7} />
            <YStack style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="100%" height={12} borderRadius={6} />
            </YStack>
          </XStack>
          <XStack style={{ alignItems: "center" }} gap="$2">
            <Skeleton width={14} height={14} borderRadius={7} />
            <YStack style={{ flex: 1, minWidth: 0 }}>
              <Skeleton width="90%" height={12} borderRadius={6} />
            </YStack>
          </XStack>
        </YStack>
      </YStack>
    </SkeletonGroup>
  );
}
