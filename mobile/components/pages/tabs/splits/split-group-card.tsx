import React, { memo, useMemo, useRef, useState } from "react";
import { Animated, Pressable, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, XStack, YStack } from "tamagui";
import type { SplitRow } from "@/types/split.types";
import { getSplitIcon } from "@/constants/split-icons";
import useTabResponsive from "../shared/use-tab-responsive";

type SplitGroupCardProps = {
  id: string;
  title: string;
  totalPercent: number;
  active?: boolean;
  splits: SplitRow[];
  onSetActive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEditSplits?: (id: string) => void;
};

const SplitGroupCard = memo(function SplitGroupCard({
  id,
  title,
  totalPercent,
  active,
  splits,
  onSetActive,
  onDelete,
  onEditSplits,
}: SplitGroupCardProps) {
  const { font, space } = useTabResponsive();
  const [expanded, setExpanded] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    Animated.spring(rotateAnim, {
      toValue: next ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 10,
    }).start();
  };

  const items = useMemo(
    () =>
      splits.map((split) => ({
        ...split,
        ...getSplitIcon(split.name),
      })),
    [splits]
  );

  const remainingPercent = 100 - totalPercent;

  return (
    <YStack
      style={{
        borderRadius: 18,
        borderWidth: active ? 1.5 : 1,
        borderColor: active ? "#4f46e5" : expanded ? "#c7d2fe" : "#d7deeb",
        backgroundColor: "#ffffff",
        shadowColor: active ? "#4f46e5" : "#0f172a",
        shadowOpacity: active ? 0.1 : 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: active ? 4 : 1,
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <Pressable onPress={toggleExpanded}>
        <XStack
          style={{
            alignItems: "center",
            paddingHorizontal: space(14),
            paddingTop: space(14),
            paddingBottom: space(12),
            gap: 10,
          }}
        >
          {/* Star — set active */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              if (!active) onSetActive?.(id);
            }}
            activeOpacity={0.6}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <MaterialCommunityIcons
              name={active ? "star" : "star-outline"}
              size={22}
              color={active ? "#f59e0b" : "#cbd5e1"}
            />
          </TouchableOpacity>

          {/* Title */}
          <Paragraph
            style={{
              flex: 1,
              color: "#0f172a",
              fontWeight: "800",
              fontSize: font(19, 15, 21),
            }}
            numberOfLines={1}
          >
            {title}
          </Paragraph>

          {/* ACTIVE badge */}
          {active && (
            <XStack
              style={{
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 3,
                backgroundColor: "#dcfce7",
              }}
            >
              <Paragraph
                style={{ color: "#15803d", fontSize: 10, fontWeight: "800" }}
              >
                ACTIVE
              </Paragraph>
            </XStack>
          )}

          {/* Chevron */}
          <Animated.View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
              transform: [{ rotate: rotateInterpolate }],
            }}
          >
            <MaterialCommunityIcons
              name="chevron-down"
              size={18}
              color="#6b7280"
            />
          </Animated.View>
        </XStack>
      </Pressable>

      {/* Sub-label */}
      <Paragraph
        style={{
          color: "#64748b",
          fontSize: font(13, 11, 14),
          paddingHorizontal: space(14),
          paddingBottom: space(12),
          marginTop: -6,
        }}
      >
        Total Deduction: {totalPercent}%
      </Paragraph>

      {/* ── Expanded content ────────────────────────────────────────── */}
      {expanded && (
        <YStack
          style={{ paddingHorizontal: space(14), paddingBottom: space(14) }}
          gap="$2"
        >
          {/* Split rows */}
          {items.map((item) => (
            <XStack
              key={item.id}
              style={{
                alignItems: "center",
                borderRadius: 12,
                backgroundColor: "#f8fafc",
                paddingVertical: 10,
                paddingHorizontal: 10,
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
                  fontSize: font(15, 13, 16),
                }}
              >
                {item.name}
              </Paragraph>
              <Paragraph
                style={{
                  color: "#4f46e5",
                  fontWeight: "800",
                  fontSize: font(15, 13, 16),
                }}
              >
                {item.value}%
              </Paragraph>
            </XStack>
          ))}

          {/* Net profit remaining */}
          {remainingPercent > 0 && items.length > 0 && (
            <XStack
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#bde8d0",
                backgroundColor: "#ecfdf3",
                paddingVertical: 10,
                paddingHorizontal: 12,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Paragraph
                style={{
                  color: "#166534",
                  fontSize: font(14, 12, 15),
                  fontWeight: "700",
                }}
              >
                Net Profit Remaining
              </Paragraph>
              <Paragraph
                style={{
                  color: "#166534",
                  fontSize: font(14, 12, 15),
                  fontWeight: "800",
                }}
              >
                {remainingPercent}%
              </Paragraph>
            </XStack>
          )}

          {/* Edit / Add Splits button */}
          <TouchableOpacity
            onPress={() => onEditSplits?.(id)}
            activeOpacity={0.75}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: items.length === 0 ? "#c7d2fe" : "#d4dae7",
              borderStyle: items.length === 0 ? "dashed" : "solid",
              backgroundColor: items.length === 0 ? "#f5f7ff" : "#ffffff",
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <MaterialCommunityIcons
              name={items.length === 0 ? "plus-circle-outline" : "pencil-outline"}
              size={16}
              color="#4f46e5"
            />
            <Paragraph
              style={{
                color: "#4f46e5",
                fontWeight: "700",
                fontSize: font(14, 12, 15),
              }}
            >
              {items.length === 0 ? "Add Splits" : "Edit Splits"}
            </Paragraph>
          </TouchableOpacity>

          {/* Delete group — subtle, below */}
          <TouchableOpacity
            onPress={() => onDelete?.(id)}
            activeOpacity={0.7}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#fee2e2",
              backgroundColor: "#fff5f5",
              height: 40,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={15}
              color="#ef4444"
            />
            <Paragraph
              style={{
                color: "#ef4444",
                fontWeight: "600",
                fontSize: font(13, 12, 14),
              }}
            >
              Delete Group
            </Paragraph>
          </TouchableOpacity>
        </YStack>
      )}
    </YStack>
  );
});

export default SplitGroupCard;
