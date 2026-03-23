import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Paragraph, XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

type Segment = {
  label: string;
  value: number;
  color: string;
};

const segments: Segment[] = [
  { label: "Net Profit", value: 55, color: "#10b981" },
  { label: "Electricity", value: 10, color: "#3b82f6" },
  { label: "Food", value: 20, color: "#f97316" },
  { label: "Transport", value: 10, color: "#eab308" },
  { label: "Water", value: 5, color: "#06b6d4" },
];

export default function SalesDonutChart() {
  const { width, font } = useTabResponsive();
  const chartSize = Math.max(150, Math.min(width - 130, 210));
  const strokeWidth = Math.max(20, Math.min(chartSize * 0.16, 30));
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <YStack gap="$4" style={{ alignItems: "center" }}>
      <View style={{ width: chartSize, height: chartSize }}>
        <Svg width={chartSize} height={chartSize}>
          <Circle
            cx={chartSize / 2}
            cy={chartSize / 2}
            r={radius}
            fill="none"
            stroke="#e7ecf5"
            strokeWidth={strokeWidth}
          />

          {segments.map((segment) => {
            const valueLength = (segment.value / 100) * circumference;
            const currentOffset = offset;
            offset += valueLength;

            return (
              <Circle
                key={segment.label}
                cx={chartSize / 2}
                cy={chartSize / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${valueLength} ${circumference}`}
                strokeDashoffset={-currentOffset}
                strokeLinecap="butt"
                rotation={-90}
                origin={`${chartSize / 2}, ${chartSize / 2}`}
              />
            );
          })}
        </Svg>

        <YStack
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paragraph style={{ color: "#64748b", fontSize: font(13, 11, 14) }}>
            Net Profit
          </Paragraph>
          <Paragraph
            style={{
              color: "#16a34a",
              fontSize: font(32, 24, 34),
              fontWeight: "800",
            }}
          >
            55%
          </Paragraph>
        </YStack>
      </View>

      <XStack
        style={{
          flexWrap: "wrap",
          justifyContent: "center",
          rowGap: 10,
          columnGap: 18,
        }}
      >
        {segments.map((item) => (
          <XStack key={item.label} style={{ alignItems: "center" }} gap="$2">
            <YStack
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: item.color,
              }}
            />
            <Paragraph style={{ color: "#334155", fontSize: font(13, 11, 14) }}>
              {item.label} ({item.value}%)
            </Paragraph>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}
