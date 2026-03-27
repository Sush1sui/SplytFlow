import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Button, Paragraph, XStack } from "tamagui";

export default function HistoryHeader() {
  const router = useRouter();

  return (
    <XStack style={{ alignItems: "center" }} gap="$3">
      <Button
        unstyled
        chromeless
        onPress={() => router.back()}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={18}
          color="#64748b"
        />
      </Button>

      <Paragraph
        style={{ color: "#0f172a", fontSize: 34, fontWeight: "800" }}
      >
        History
      </Paragraph>
    </XStack>
  );
}
