import React from "react";
import { ScrollView } from "react-native";
import { XStack, YStack } from "tamagui";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";
import useTabResponsive from "../shared/use-tab-responsive";

// Mirrors the exact layout of SettingsScreen so the skeleton looks like
// the real content before user data has loaded.

function SectionRowSkeleton({
  space,
  isFirst,
}: {
  space: ReturnType<typeof useTabResponsive>["space"];
  isFirst: boolean;
}) {
  return (
    <XStack
      style={{
        alignItems: "center",
        paddingHorizontal: space(14),
        paddingVertical: space(14),
        borderTopWidth: isFirst ? 0 : 1,
        borderTopColor: "#edf1f8",
        gap: 10,
      }}
    >
      {/* Icon placeholder */}
      <Skeleton width={19} height={19} borderRadius={4} />
      {/* Label placeholder — varies width for natural look */}
      <Skeleton width={120} height={14} borderRadius={7} />
      {/* Chevron placeholder */}
      <XStack style={{ flex: 1 }} />
      <Skeleton width={14} height={14} borderRadius={4} />
    </XStack>
  );
}

function SectionSkeleton({
  rowCount,
  labelWidth,
  space,
}: {
  rowCount: number;
  labelWidth: number;
  space: ReturnType<typeof useTabResponsive>["space"];
}) {
  return (
    <YStack style={{ gap: 8 }}>
      {/* Section title */}
      <Skeleton width={labelWidth} height={11} borderRadius={5} />

      {/* Section card */}
      <YStack
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: rowCount }).map((_, i) => (
          <SectionRowSkeleton key={i} space={space} isFirst={i === 0} />
        ))}
      </YStack>
    </YStack>
  );
}

export default function SettingsScreenSkeleton() {
  const { font, space } = useTabResponsive();

  return (
    <SkeletonGroup>
      <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
        <ScrollView
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 20,
            paddingTop: 56,
            paddingBottom: 110,
          }}
        >
          {/* Page title */}
          <Skeleton width={110} height={font(28, 22, 30)} borderRadius={8} />

          {/* Profile card */}
          <XStack
            style={{
              marginTop: space(16),
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: space(14),
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Avatar circle */}
            <Skeleton width={52} height={52} borderRadius={26} />

            {/* Name + email stacked */}
            <YStack style={{ flex: 1, gap: 8 }}>
              <Skeleton width={140} height={16} borderRadius={7} />
              <Skeleton width={180} height={12} borderRadius={6} />
            </YStack>

            {/* Edit pill placeholder */}
            <Skeleton width={46} height={30} borderRadius={8} />
          </XStack>

          {/* Sections */}
          <YStack style={{ marginTop: space(18), gap: 14 }}>
            {/* ACCOUNT — 2 rows */}
            <SectionSkeleton rowCount={2} labelWidth={62} space={space} />

            {/* GENERAL — 3 rows */}
            <SectionSkeleton rowCount={3} labelWidth={52} space={space} />

            {/* Log Out button placeholder */}
            <Skeleton
              width="100%"
              height={48}
              borderRadius={12}
              style={{ marginTop: 4 }}
            />
          </YStack>
        </ScrollView>
      </YStack>
    </SkeletonGroup>
  );
}
