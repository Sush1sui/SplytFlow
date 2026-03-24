import React from "react";
import { YStack, Paragraph } from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function NoLogCard() {
  return (
    <YStack
      style={{
        borderRadius: 14,
        backgroundColor: "#ffffff",
        borderColor: "#e5eaf3",
        borderWidth: 1,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
      }}
      gap="$2"
    >
      <MaterialCommunityIcons name="history" size={24} color="#6b7280" />
      <Paragraph
        style={{
          color: "#6b7280",
          fontSize: 15,
          fontWeight: "600",
        }}
      >
        No recent logs yet
      </Paragraph>
      <Paragraph style={{ color: "#94a3b8", fontSize: 13 }}>
        Your last activity will appear here.
      </Paragraph>
    </YStack>
  );
}
