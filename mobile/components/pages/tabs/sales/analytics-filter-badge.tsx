import { memo } from "react";
import { YStack, Paragraph } from "tamagui";

function AnalyticsFilterBadge({
  index,
  range,
  selected,
  space,
  font,
  setSelectedRange,
}: {
  index: number;
  range: string;
  selected: boolean;
  space: (size: number) => number;
  font: (size: number, min?: number, max?: number) => number;
  setSelectedRange: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <YStack
      style={{
        borderRadius: 999,
        borderWidth: 1,
        borderColor: selected ? "#4f46e5" : "#d9e0ec",
        backgroundColor: selected ? "#4f46e5" : "#ffffff",
        paddingHorizontal: space(14),
        paddingVertical: space(8),
      }}
      onPress={() => setSelectedRange(index)}
    >
      <Paragraph
        style={{
          color: selected ? "#ffffff" : "#334155",
          fontSize: font(14, 12, 15),
          fontWeight: selected ? "700" : "500",
        }}
      >
        {range}
      </Paragraph>
    </YStack>
  );
}

export default memo(AnalyticsFilterBadge);
