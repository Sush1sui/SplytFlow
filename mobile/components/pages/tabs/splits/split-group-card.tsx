import React, { useState, memo, useMemo } from "react";
import { Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import type { SplitRow } from "@/types/split.types";
import { getSplitIcon } from "@/constants/split-icons";
import useTabResponsive from "../shared/use-tab-responsive";

type SplitGroupCardProps = {
  title: string;
  totalPercent: number;
  active?: boolean;
  splits: SplitRow[];
};

const SplitGroupCard = memo(function SplitGroupCard({
  title,
  totalPercent,
  active,
  splits,
}: SplitGroupCardProps) {
  const { font, space } = useTabResponsive();
  const [expanded, setExpanded] = useState(false);

  const items = useMemo(
    () =>
      splits.map((split) => ({
        ...split,
        ...getSplitIcon(split.name),
      })),
    [splits]
  );

  return (
    <YStack
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: expanded ? "#4f46e5" : "#d7deeb",
        backgroundColor: "#ffffff",
        padding: space(14),
      }}
      gap="$2"
    >
      <Pressable onPress={() => setExpanded(!expanded)}>
        <XStack style={{ alignItems: "center", justifyContent: "space-between" }}>
        <XStack
          style={{ alignItems: "center", flex: 1, paddingRight: 8 }}
          gap="$2"
        >
          <Paragraph
            style={{
              color: "#0f172a",
              fontWeight: "800",
              fontSize: font(22, 17, 24),
              flexShrink: 1,
            }}
          >
            {title}
          </Paragraph>
          {active ? (
            <YStack
              style={{
                borderRadius: 999,
                paddingHorizontal: 9,
                paddingVertical: 2,
                backgroundColor: "#dcfce7",
              }}
            >
              <Paragraph
                style={{ color: "#15803d", fontSize: 11, fontWeight: "800" }}
              >
                ACTIVE
              </Paragraph>
            </YStack>
          ) : null}
        </XStack>

        <YStack
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "#f3f4f6",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#6b7280"
          />
        </YStack>
      </XStack>
      </Pressable>

      <Paragraph style={{ color: "#64748b", fontSize: font(13, 11, 14) }}>
        Total Deduction: {totalPercent}%
      </Paragraph>

      {expanded && items.length > 0 && (
        <YStack gap="$2" style={{ paddingTop: 6 }}>
          {items.map((item) => (
            <XStack
              key={item.id}
              style={{
                alignItems: "center",
                borderRadius: 12,
                backgroundColor: "#f8fafc",
                padding: space(10),
              }}
              gap="$2"
            >
              <YStack
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: item.iconBg,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon}
                  size={17}
                  color={item.iconColor}
                />
              </YStack>

              <Paragraph
                style={{
                  flex: 1,
                  color: "#0f172a",
                  fontWeight: "600",
                  fontSize: font(17, 14, 18),
                }}
              >
                {item.name}
              </Paragraph>

              <Paragraph
                style={{
                  color: "#0f172a",
                  fontWeight: "800",
                  fontSize: font(18, 15, 20),
                }}
              >
                {item.value}%
              </Paragraph>
            </XStack>
          ))}

          {totalPercent < 100 && (
            <YStack
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#bde8d0",
                backgroundColor: "#ecfdf3",
                paddingVertical: 10,
                paddingHorizontal: 12,
              }}
            >
              <Paragraph
                style={{
                  color: "#166534",
                  fontSize: font(15, 12, 16),
                  fontWeight: "700",
                }}
              >
                Net Profit Remaining {100 - totalPercent}%
              </Paragraph>
            </YStack>
          )}

          <Button
            style={{
              borderRadius: 10,
              backgroundColor: "#ffffff",
              borderColor: "#d4dae7",
              height: 42,
            }}
          >
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "600",
                fontSize: font(14, 12, 15),
              }}
            >
              Edit Splits
            </Paragraph>
          </Button>
        </YStack>
      )}
    </YStack>
  );
});

export default SplitGroupCard;
