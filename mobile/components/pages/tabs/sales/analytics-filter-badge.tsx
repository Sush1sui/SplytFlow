import { memo } from "react";
import { YStack, Paragraph } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

function AnalyticsFilterBadge({
  index,
  range,
  selected,
  setSelectedRange,
}: {
  index: number;
  range: string;
  selected: boolean;
  setSelectedRange: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { space, font } = useTabResponsive();

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
