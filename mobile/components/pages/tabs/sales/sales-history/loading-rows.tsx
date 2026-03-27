import React from "react";
import { YStack } from "tamagui";

export default function LoadingRows() {
  return (
    <>
      {Array.from({ length: 3 }).map((_, index) => (
        <YStack
          key={`loading-row-${index}`}
          style={{
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            paddingVertical: 14,
            paddingHorizontal: 14,
          }}
          gap="$2"
        >
          <YStack
            style={{
              width: 120,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#e7ecf5",
            }}
          />
          <YStack
            style={{
              width: 170,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#edf2f9",
            }}
          />
        </YStack>
      ))}
    </>
  );
}
