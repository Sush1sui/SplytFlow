import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, H4, Image, Input, Paragraph, XStack, YStack } from "tamagui";

export default function SignIn() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <YStack
          style={{
            flex: 1,
            backgroundColor: "#f4f6fb",
            paddingHorizontal: 20,
            paddingVertical: 28,
            justifyContent: "center",
          }}
        >
          <Animated.View entering={FadeInDown.duration(360).delay(80)}>
            <YStack
              style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
              gap="$4"
            >
              <YStack
                style={{ alignItems: "center", paddingBottom: 8 }}
                gap="$3"
              >
                <Image
                  source={require("../../assets/icons/calm.png")}
                  width={64}
                  height={64}
                  resizeMode="contain"
                  alt="SplytFlow logo"
                />

                <YStack style={{ alignItems: "center" }} gap="$1">
                  <H4 style={{ fontSize: 38, lineHeight: 42 }}>SplytFlow</H4>
                  <Paragraph
                    style={{
                      color: "#5f6775",
                      fontSize: 16,
                      textAlign: "center",
                      maxWidth: 290,
                    }}
                  >
                    Track your sales and customize splits effortlessly.
                  </Paragraph>
                </YStack>
              </YStack>

              <YStack gap="$3">
                <YStack gap="$1.5">
                  <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
                    Email
                  </Paragraph>
                  <Input
                    placeholder="hello@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      backgroundColor: "#f4f6fb",
                      borderColor: "#cfd6e4",
                      borderRadius: 10,
                      height: 48,
                    }}
                  />
                </YStack>

                <YStack gap="$1.5">
                  <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
                    Password
                  </Paragraph>
                  <Input
                    placeholder="........"
                    secureTextEntry
                    style={{
                      backgroundColor: "#f4f6fb",
                      borderColor: "#cfd6e4",
                      borderRadius: 10,
                      height: 48,
                    }}
                  />
                </YStack>

                <XStack style={{ justifyContent: "flex-end", marginTop: -2 }}>
                  <Button
                    chromeless
                    style={{
                      color: "#4f46e5",
                      fontWeight: "600",
                      paddingHorizontal: 0,
                      height: 28,
                    }}
                  >
                    Forgot Password?
                  </Button>
                </XStack>

                <Button
                  size="$4"
                  style={{
                    marginTop: 4,
                    backgroundColor: "#4f46e5",
                    borderColor: "#4f46e5",
                    borderRadius: 10,
                    height: 48,
                    justifyContent: "center",
                  }}
                >
                  <Paragraph style={{ color: "#ffffff", fontWeight: "700" }}>
                    Sign In
                  </Paragraph>
                </Button>
              </YStack>

              <XStack
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 8,
                }}
                gap="$1"
              >
                <Paragraph style={{ color: "#5f6775" }}>
                  Don't have an account?
                </Paragraph>
                <Link href="/(auth)/signup" replace asChild>
                  <Button
                    chromeless
                    style={{ color: "#4f46e5", fontWeight: "700" }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </XStack>
            </YStack>
          </Animated.View>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
