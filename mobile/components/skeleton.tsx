import React, { createContext, useContext, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

// ─── Shared shimmer clock ────────────────────────────────────────────────────
// All Skeletons inside a <SkeletonGroup> share the same animated value,
// so only one timer runs for the entire loading screen.

const ShimmerContext = createContext<SharedValue<number> | null>(null);

export function SkeletonGroup({ children }: { children: React.ReactNode }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      false,
    );
  }, []);

  return (
    <ShimmerContext.Provider value={progress}>
      {children}
    </ShimmerContext.Provider>
  );
}

// ─── Skeleton primitive ──────────────────────────────────────────────────────

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width, height, borderRadius = 6, style }: SkeletonProps) {
  // Use the group clock if available, otherwise spin up a local one.
  const groupProgress = useContext(ShimmerContext);
  const localProgress = useSharedValue(0);

  const isLocal = groupProgress === null;

  useEffect(() => {
    if (!isLocal) return;
    localProgress.value = withRepeat(
      withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const progress = isLocal ? localProgress : groupProgress!;

  // The shimmer stripe translates from -100% to +100% of the container width.
  // We approximate the container width via the `width` prop (or 300 for "%").
  const containerWidth = typeof width === "number" ? width : 300;
  const stripeWidth = containerWidth * 0.55;

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX:
          progress.value * (containerWidth + stripeWidth) - stripeWidth,
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#e8edf5",
          overflow: "hidden",
        },
        style,
      ]}
    >
      {/* Bright highlight stripe swept across */}
      <Animated.View
        style={[
          shimmerStyle,
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: stripeWidth,
            // Soft-edge glow: opaque center, transparent edges
            backgroundColor: "#f6f8fc",
            opacity: 0.85,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}
