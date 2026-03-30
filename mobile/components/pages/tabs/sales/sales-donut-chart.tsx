import React, { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { Paragraph, XStack, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";

// Use Reanimated's createAnimatedComponent so animatedProps run on the UI thread
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Segment = {
  label: string;
  value: number;
  color: string;
};

export default function SalesDonutChart({
  segments,
  centerPercentage,
}: {
  segments: Segment[];
  centerPercentage: number;
}) {
  const { width, font } = useTabResponsive();
  const chartSize = Math.max(150, Math.min(width - 130, 210));
  const strokeWidth = Math.max(20, Math.min(chartSize * 0.16, 30));
  const radius = (chartSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // UI-thread shared value — no bridge crossing per frame
  const maskProgress = useSharedValue(0);

  // Re-animate only when segment data actually changes
  const segmentKey = useMemo(
    () => segments.map((s) => `${s.label}:${s.value.toFixed(2)}`).join("|"),
    [segments]
  );

  useEffect(() => {
    cancelAnimation(maskProgress);
    maskProgress.value = 0;
    maskProgress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentKey]);

  // Runs entirely on the UI thread — zero JS involvement per frame
  const maskProps = useAnimatedProps(() => ({
    strokeDashoffset: -(maskProgress.value * circumference),
  }));

  // Static geometry — computed once, no animation
  let offset = 0;
  const builtSegments = useMemo(() => {
    let off = 0;
    return segments.map((seg) => {
      const valueLength = (seg.value / 100) * circumference;
      const dashOffset = off;
      off += valueLength;
      return { ...seg, valueLength, dashOffset };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [segmentKey, circumference]);

  const cx = chartSize / 2;
  const cy = chartSize / 2;

  return (
    <YStack gap="$4" style={{ alignItems: "center" }}>
      <View style={{ width: chartSize, height: chartSize }}>
        <Svg width={chartSize} height={chartSize}>
          {/* Track ring */}
          <Circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#e7ecf5"
            strokeWidth={strokeWidth}
          />

          {/* Coloured segments — static SVG, rendered at full values */}
          {builtSegments.map((seg) => (
            <Circle
              key={seg.label}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.valueLength} ${circumference}`}
              strokeDashoffset={-seg.dashOffset}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${cx}, ${cy}`}
            />
          ))}

          {/*
            White sweep mask.
            strokeDasharray = full circumference (one solid ring covering everything).
            strokeDashoffset animated 0 → -circumference on UI thread via useAnimatedProps.
            Result: mask sweeps clockwise away, revealing coloured segments beneath.
          */}
          <AnimatedCircle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#ffffff"
            strokeWidth={strokeWidth + 2}
            strokeDasharray={circumference}
            strokeLinecap="butt"
            rotation={-90}
            origin={`${cx}, ${cy}`}
            animatedProps={maskProps}
          />
        </Svg>

        {/* Centre label — static */}
        <YStack
          style={{
            position: "absolute",
            top: 0, right: 0, left: 0, bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Paragraph style={{ color: "#64748b", fontSize: font(13, 11, 14) }}>
            Net Sales
          </Paragraph>
          <Paragraph
            style={{ color: "#16a34a", fontSize: font(32, 24, 34), fontWeight: "800" }}
          >
            {Math.round(centerPercentage)}%
          </Paragraph>
        </YStack>
      </View>

      {/* Legend */}
      <XStack
        style={{ flexWrap: "wrap", justifyContent: "center", rowGap: 10, columnGap: 18 }}
      >
        {segments.map((item) => (
          <XStack key={item.label} style={{ alignItems: "center" }} gap="$2">
            <YStack
              style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }}
            />
            <Paragraph style={{ color: "#334155", fontSize: font(13, 11, 14) }}>
              {item.label} ({Number(item.value.toFixed(1))}%)
            </Paragraph>
          </XStack>
        ))}
      </XStack>
    </YStack>
  );
}
