import { Link } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, H4, Input, Paragraph, XStack, YStack } from "tamagui";

export default function SignUp() {
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
          <Animated.View entering={FadeInDown.duration(380).delay(80)}>
            <YStack
              style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
              gap="$4"
            >
              <YStack gap="$1">
                <H4 style={{ fontSize: 38, lineHeight: 42 }}>Create Account</H4>
                <Paragraph style={{ color: "#5f6775", fontSize: 16 }}>
                  Start tracking your sales today.
                </Paragraph>
              </YStack>

              <YStack gap="$3">
                <XStack gap="$2">
                  <YStack style={{ flex: 1 }} gap="$1.5">
                    <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
                      First Name
                    </Paragraph>
                    <Input
                      placeholder="John"
                      autoCapitalize="words"
                      style={{
                        backgroundColor: "#f4f6fb",
                        borderColor: "#cfd6e4",
                        borderRadius: 10,
                        height: 48,
                      }}
                    />
                  </YStack>

                  <YStack style={{ flex: 1 }} gap="$1.5">
                    <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
                      Last Name
                    </Paragraph>
                    <Input
                      placeholder="Doe"
                      autoCapitalize="words"
                      style={{
                        backgroundColor: "#f4f6fb",
                        borderColor: "#cfd6e4",
                        borderRadius: 10,
                        height: 48,
                      }}
                    />
                  </YStack>
                </XStack>

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
                    placeholder="Create a password"
                    secureTextEntry
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
                    Confirm Password
                  </Paragraph>
                  <Input
                    placeholder="Confirm your password"
                    secureTextEntry
                    style={{
                      backgroundColor: "#f4f6fb",
                      borderColor: "#cfd6e4",
                      borderRadius: 10,
                      height: 48,
                    }}
                  />
                </YStack>
              </YStack>

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
                  Sign Up
                </Paragraph>
              </Button>

              <XStack
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: 8,
                }}
                gap="$1"
              >
                <Paragraph style={{ color: "#5f6775" }}>
                  Already have an account?
                </Paragraph>
                <Link href="/(auth)/signin" replace asChild>
                  <Button
                    chromeless
                    style={{ color: "#4f46e5", fontWeight: "700" }}
                  >
                    Sign In
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
