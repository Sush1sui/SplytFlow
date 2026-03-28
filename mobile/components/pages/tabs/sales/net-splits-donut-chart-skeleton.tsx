import React from "react";
import { YStack } from "tamagui";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";
import useTabResponsive from "../shared/use-tab-responsive";

export default function NetSplitsDonutChartSkeleton() {
  const { space } = useTabResponsive();

  return (
    <SkeletonGroup>
      <YStack
        style={{
          marginTop: space(18),
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          padding: space(18),
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Title bar */}
        <Skeleton width={200} height={14} borderRadius={7} />

        {/* Donut ring placeholder */}
        <YStack style={{ position: "relative", width: 160, height: 160, alignItems: "center", justifyContent: "center" }}>
          {/* Outer ring */}
          <Skeleton width={160} height={160} borderRadius={80} />
          {/* Inner cutout (white circle on top) */}
          <YStack
            style={{
              position: "absolute",
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: "#ffffff",
            }}
          />
        </YStack>

        {/* Legend rows */}
        <YStack style={{ width: "100%", gap: 10 }}>
          {[140, 110, 90].map((w, i) => (
            <YStack
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Skeleton width={12} height={12} borderRadius={6} />
              <Skeleton width={w} height={12} borderRadius={6} />
            </YStack>
          ))}
        </YStack>
      </YStack>
    </SkeletonGroup>
  );
}
