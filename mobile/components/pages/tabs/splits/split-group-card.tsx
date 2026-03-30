import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { Pressable, TouchableOpacity } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
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
  const expandedRef = useRef(false);

  // All animations run on the UI thread — maxHeight avoids measurement entirely
  const maxHeightSV = useSharedValue(0);
  const opacitySV = useSharedValue(0);
  const rotateSV = useSharedValue(0);

  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: maxHeightSV.value,
    opacity: opacitySV.value,
    overflow: "hidden",
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateSV.value * 180}deg` }],
  }));

  const toggleExpanded = useCallback(() => {
    const next = !expandedRef.current;
    expandedRef.current = next;
    setExpanded(next);

    if (next) {
      // Open: spring up to a generous max, fade in
      maxHeightSV.value = withSpring(800, {
        damping: 22,
        stiffness: 180,
        mass: 0.9,
        overshootClamping: true,
      });
      opacitySV.value = withTiming(1, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Close: spring back to 0, fade out faster
      maxHeightSV.value = withSpring(0, {
        damping: 22,
        stiffness: 200,
        mass: 0.8,
        overshootClamping: true,
      });
      opacitySV.value = withTiming(0, {
        duration: 160,
        easing: Easing.in(Easing.cubic),
      });
    }
    rotateSV.value = withSpring(next ? 1 : 0, {
      damping: 18,
      stiffness: 220,
      mass: 0.7,
    });
  }, [maxHeightSV, opacitySV, rotateSV]);

  const items = useMemo(
    () => splits.map((split) => ({ ...split, ...getSplitIcon(split.name) })),
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
        overflow: "hidden",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
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

          {active && (
            <XStack
              style={{
                borderRadius: 999,
                paddingHorizontal: 8,
                paddingVertical: 3,
                backgroundColor: "#dcfce7",
              }}
            >
              <Paragraph style={{ color: "#15803d", fontSize: 10, fontWeight: "800" }}>
                ACTIVE
              </Paragraph>
            </XStack>
          )}

          {/* Animated chevron — UI thread */}
          <Animated.View
            style={[
              {
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#f3f4f6",
                alignItems: "center",
                justifyContent: "center",
              },
              chevronStyle,
            ]}
          >
            <MaterialCommunityIcons name="chevron-down" size={18} color="#6b7280" />
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

      {/* ── Animated body ───────────────────────────────────── */}
      <Animated.View style={bodyStyle}>
        <YStack
          style={{ paddingHorizontal: space(14), paddingBottom: space(14) }}
          gap="$2"
        >
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
                <MaterialCommunityIcons name={item.icon} size={17} color={item.iconColor} />
              </YStack>
              <Paragraph
                style={{ flex: 1, color: "#0f172a", fontWeight: "600", fontSize: font(15, 13, 16) }}
              >
                {item.name}
              </Paragraph>
              <Paragraph style={{ color: "#4f46e5", fontWeight: "800", fontSize: font(15, 13, 16) }}>
                {item.value}%
              </Paragraph>
            </XStack>
          ))}

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
              <Paragraph style={{ color: "#166534", fontSize: font(14, 12, 15), fontWeight: "700" }}>
                Net Profit Remaining
              </Paragraph>
              <Paragraph style={{ color: "#166534", fontSize: font(14, 12, 15), fontWeight: "800" }}>
                {remainingPercent}%
              </Paragraph>
            </XStack>
          )}

          <TouchableOpacity
            onPress={() => onEditSplits?.(id)}
            activeOpacity={0.75}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#d4dae7",
              backgroundColor: "#ffffff",
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
            }}
          >
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#4f46e5" />
            <Paragraph style={{ color: "#4f46e5", fontWeight: "700", fontSize: font(14, 12, 15) }}>
              Edit Splits
            </Paragraph>
          </TouchableOpacity>

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
            <MaterialCommunityIcons name="trash-can-outline" size={15} color="#ef4444" />
            <Paragraph style={{ color: "#ef4444", fontWeight: "600", fontSize: font(13, 12, 14) }}>
              Delete Group
            </Paragraph>
          </TouchableOpacity>
        </YStack>
      </Animated.View>
    </YStack>
  );
});

export default SplitGroupCard;
