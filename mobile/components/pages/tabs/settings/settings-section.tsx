import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

type SettingsItem = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

type SettingsSectionProps = {
  title: string;
  items: SettingsItem[];
};

export default function SettingsSection({
  title,
  items,
}: SettingsSectionProps) {
  const { font, space } = useTabResponsive();

  return (
    <YStack gap="$2">
      <Paragraph
        style={{
          color: "#94a3b8",
          fontWeight: "800",
          fontSize: font(12, 10, 13),
        }}
      >
        {title}
      </Paragraph>

      <YStack
        style={{
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {items.map((item, index) => (
          <XStack
            key={item.label}
            style={{
              alignItems: "center",
              paddingHorizontal: space(14),
              paddingVertical: space(14),
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: "#edf1f8",
            }}
            gap="$2"
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={19}
              color="#6b7280"
            />
            <Paragraph
              style={{
                flex: 1,
                color: "#0f172a",
                fontWeight: "600",
                fontSize: font(16, 13, 17),
              }}
            >
              {item.label}
            </Paragraph>
            <MaterialCommunityIcons
              name="chevron-right"
              size={19}
              color="#9aa5b5"
            />
          </XStack>
        ))}
      </YStack>
    </YStack>
  );
}
