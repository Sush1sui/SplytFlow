import React, { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { Image, Paragraph, XStack, YStack } from "tamagui";
import loadingGif from "@/assets/icons/gif-loading.gif";

interface LoadingProps {
  message?: string;
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
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

    const handle = Animated.parallel([anim1, anim2, anim3]);
    handle.start();

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      handle.stop();
    };
  }, [dot1, dot2, dot3]);

  const scale = (value: Animated.Value) =>
    value.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.6],
    });

  return (
    <YStack
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6fb",
        padding: 16,
      }}
    >
      <XStack
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Image
          source={loadingGif}
          width={220}
          height={220}
          resizeMode="contain"
          alt="Loading animation"
        />
      </XStack>

      {/*
      <XStack
        style={{
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 12,
        }}
        space="$2"
      >
        {[dot1, dot2, dot3].map((dot, index) => (
          <Animated.View
            key={index}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: "#4f46e5",
              marginHorizontal: 4,
              transform: [{ scale: scale(dot) }],
            }}
          />
        ))}
      </XStack>
      */}

      <Paragraph fontSize={16} color="#334155" opacity={0.88}>
        {message}
      </Paragraph>
    </YStack>
  );
}
