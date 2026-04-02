import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Button, Paragraph, XStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

type SettingsPageHeaderProps = {
  title: string;
  disabled?: boolean;
};

export default function SettingsPageHeader({
  title,
  disabled = false,
}: SettingsPageHeaderProps) {
  const router = useRouter();
  const { font } = useTabResponsive();

  return (
    <XStack style={{ alignItems: "center" }} gap="$3">
      <Button
        unstyled
        chromeless
        disabled={disabled}
        onPress={() => router.back()}
        pressStyle={{ opacity: 0.72, background: "transparent" }}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          opacity: disabled ? 0.55 : 1,
        }}
      >
        <MaterialCommunityIcons name="arrow-left" size={18} color="#64748b" />
      </Button>

      <Paragraph
        style={{
          color: "#0f172a",
          fontSize: font(28, 22, 30),
          lineHeight: font(34, 28, 36),
          fontWeight: "800",
        }}
      >
        {title}
      </Paragraph>
    </XStack>
  );
}
