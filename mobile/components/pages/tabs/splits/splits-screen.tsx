import React from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, XStack, YStack } from "tamagui";
import SplitGroupCard from "./split-group-card";
import useTabResponsive from "../shared/use-tab-responsive";

const expandedItems = [
  {
    icon: "flash-outline" as const,
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
    label: "Electricity Bill",
    value: "10%",
  },
  {
    icon: "water-outline" as const,
    iconColor: "#06b6d4",
    iconBg: "#ccfbf1",
    label: "Water Bill",
    value: "5%",
  },
  {
    icon: "bus" as const,
    iconColor: "#ca8a04",
    iconBg: "#fef9c3",
    label: "Transportation",
    value: "10%",
  },
  {
    icon: "food-outline" as const,
    iconColor: "#ea580c",
    iconBg: "#ffedd5",
    label: "Food Allowance",
    value: "20%",
  },
];

export default function SplitsScreen() {
  const { font, space } = useTabResponsive();

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <XStack
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Paragraph
            style={{
              color: "#0f172a",
              fontSize: font(28, 22, 30),
              lineHeight: font(34, 28, 36),
              fontWeight: "800",
            }}
          >
            Config Splits
          </Paragraph>

          <YStack
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#dde4ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons name="plus" size={22} color="#4f46e5" />
          </YStack>
        </XStack>

        <YStack style={{ marginTop: space(16) }} gap="$3">
          <SplitGroupCard
            title="Default Daily Splits (V1)"
            total="45%"
            active
            expanded
            items={expandedItems}
          />

          <SplitGroupCard title="Weekend Special (V2)" total="30%" />
          <SplitGroupCard title="Low Season Config (V3)" total="25%" />
        </YStack>
      </ScrollView>
    </YStack>
  );
}
