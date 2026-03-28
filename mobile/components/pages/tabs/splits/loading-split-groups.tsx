import React from "react";
import { YStack } from "tamagui";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";

function SplitGroupSkeleton() {
  return (
    <YStack
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 14,
      }}
    >
      {/* Header row: name + badge */}
      <YStack style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Skeleton width={140} height={16} borderRadius={8} />
        <Skeleton width={52} height={22} borderRadius={11} />
      </YStack>

      {/* Split rows */}
      <YStack style={{ gap: 10 }}>
        {[170, 130, 110].map((w, i) => (
          <YStack key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Skeleton width={30} height={30} borderRadius={15} />
            <YStack style={{ gap: 5, flex: 1 }}>
              <Skeleton width={w} height={12} borderRadius={6} />
              <Skeleton width={w * 0.55} height={10} borderRadius={5} />
            </YStack>
            <Skeleton width={36} height={14} borderRadius={7} />
          </YStack>
        ))}
      </YStack>
    </YStack>
  );
}

export default function LoadingSplitGroups() {
  return (
    <SkeletonGroup>
      <YStack style={{ gap: 14 }}>
        <SplitGroupSkeleton />
        <SplitGroupSkeleton />
      </YStack>
    </SkeletonGroup>
  );
}