import React from "react";
import { YStack } from "tamagui";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

export default function NoSplitCard() {
  const { font, space } = useTabResponsive();

  return (
    <YStack
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <YStack
        style={{
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#d7deeb",
          backgroundColor: "#ffffff",
          padding: space(20),
          alignItems: "center",
          width: "100%",
          maxWidth: 320,
        }}
      >
        <MaterialCommunityIcons
          name="chart-donut"
          size={48}
          color="#9ca3af"
        />
        <Paragraph
          style={{
            color: "#6b7280",
            fontSize: font(16, 14, 18),
            fontWeight: "600",
            marginTop: 12,
          }}
        >
          No Split Groups
        </Paragraph>
        <Paragraph
          style={{
            color: "#9ca3af",
            fontSize: font(14, 12, 15),
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Tap + to create your first split group
        </Paragraph>
      </YStack>
    </YStack>
  );
}
