import React, { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export function Skeleton({ width, height, borderRadius }: { width: number; height: number; borderRadius?: number }) {
  const animated = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animated, { toValue: 0.7, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(animated, { toValue: 0.3, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animated]);

  return (
    <View style={{ width, height, borderRadius, backgroundColor: "#e7ecf5", overflow: "hidden" }}>
      <Animated.View style={{ flex: 1, opacity: animated }} />
    </View>
  );
}
