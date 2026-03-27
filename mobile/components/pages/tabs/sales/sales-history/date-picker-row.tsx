import React from "react";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Paragraph, XStack } from "tamagui";

type DatePickerRowProps = {
  monthLabel: string;
  yearLabel: string;
  onSelectMonth: () => void;
  onSelectYear: () => void;
};

export default function DatePickerRow({
  monthLabel,
  yearLabel,
  onSelectMonth,
  onSelectYear,
}: DatePickerRowProps) {
  return (
    <XStack style={{ marginTop: 20 }} gap="$2.5">
      <Button
        unstyled
        onPress={onSelectMonth}
        style={{
          flex: 1,
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          paddingHorizontal: 14,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
        >
          {monthLabel}
        </Paragraph>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color="#64748b"
        />
      </Button>

      <Button
        unstyled
        onPress={onSelectYear}
        style={{
          width: 122,
          height: 52,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          paddingHorizontal: 14,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "700", fontSize: 16 }}
        >
          {yearLabel}
        </Paragraph>
        <MaterialCommunityIcons
          name="chevron-down"
          size={18}
          color="#64748b"
        />
      </Button>
    </XStack>
  );
}
