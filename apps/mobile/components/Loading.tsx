import { View, Text, StyleSheet, Animated } from "react-native";
import { useEffect, useRef } from "react";
import Colors from "@/constants/Colors";
import { Typography, Spacing } from "@/constants/Theme";
import { useColorScheme } from "./useColorScheme";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Animation values for each dot
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createDotAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 150),
      createDotAnimation(dot3Anim, 300),
    ]);

    animations.start();

    return () => animations.stop();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  const dotStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary },
              dotStyle(dot1Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary },
              dotStyle(dot2Anim),
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: colors.primary },
              dotStyle(dot3Anim),
            ]}
          />
        </View>
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: Spacing.md,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  message: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    textAlign: "center",
  },
});
