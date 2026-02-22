import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

interface LoadingProps {
  /** message to display under the dots; defaults to "Loading..." */
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animatedValue: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    const anim1 = createAnimation(dot1, 0);
    const anim2 = createAnimation(dot2, 150);
    const anim3 = createAnimation(dot3, 300);

    Animated.parallel([anim1, anim2, anim3]).start();

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
    };
  }, [dot1, dot2, dot3]);

  const textColor = useThemeColor({}, "text");

  const interpolateScale = (animatedValue: Animated.Value) =>
    animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.5],
    });

  const dotColor = useThemeColor({}, "tint");

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {[dot1, dot2, dot3].map((anim, idx) => (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              { backgroundColor: dotColor },
              { transform: [{ scale: interpolateScale(anim) }] },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#888",
    marginHorizontal: 4,
  },
  message: {
    fontSize: 16,
    opacity: 0.8,
  },
});
