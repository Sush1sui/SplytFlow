import React from "react";
import { YStack } from "tamagui";

export default function LoadingSplitGroups() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <YStack
          key={`loading-split-group-${index}`}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            paddingVertical: 16,
            paddingHorizontal: 16,
          }}
          gap="$3"
        >
          <YStack
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <YStack
              style={{
                width: 140,
                height: 18,
                borderRadius: 9,
                backgroundColor: "#e7ecf5",
              }}
            />
            <YStack
              style={{
                width: 50,
                height: 20,
                borderRadius: 10,
                backgroundColor: "#e7ecf5",
              }}
            />
          </YStack>

          <YStack gap="$2">
            <YStack
              style={{
                width: 180,
                height: 14,
                borderRadius: 7,
                backgroundColor: "#edf2f9",
              }}
            />
            <YStack
              style={{
                width: 120,
                height: 12,
                borderRadius: 6,
                backgroundColor: "#edf2f9",
              }}
            />
          </YStack>
        </YStack>
      ))}
    </>
  );
}