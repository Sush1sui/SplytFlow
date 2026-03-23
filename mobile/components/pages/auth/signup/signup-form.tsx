import { Button, Input, Paragraph, Spinner, XStack, YStack } from "tamagui";
import SignupHeader from "./signup-header";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import type { Dispatch, SetStateAction } from "react";

export default function SignupForm({
  form,
  setForm,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  handleSubmit,
  loading,
}: {
  form: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setForm: Dispatch<
    SetStateAction<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    }>
  >;
  showPassword: boolean;
  setShowPassword: Dispatch<SetStateAction<boolean>>;
  showConfirmPassword: boolean;
  setShowConfirmPassword: Dispatch<SetStateAction<boolean>>;
  handleSubmit: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <YStack
      style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      gap="$4"
    >
      <SignupHeader />

      <YStack gap="$3">
        <XStack gap="$2">
          <YStack style={{ flex: 1 }} gap="$1.5">
            <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
              First Name
            </Paragraph>
            <Input
              placeholder="John"
              autoCapitalize="words"
              value={form.firstName}
              onChangeText={(text) => setForm({ ...form, firstName: text })}
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
              value={form.lastName}
              onChangeText={(text) => setForm({ ...form, lastName: text })}
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
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
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
          <YStack style={{ position: "relative" }}>
            <Input
              placeholder="Create a password"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
              style={{
                backgroundColor: "#f4f6fb",
                borderColor: "#cfd6e4",
                borderRadius: 10,
                height: 48,
                paddingRight: 44,
              }}
            />
            <Button
              unstyled
              chromeless
              onPress={() => setShowPassword((prev) => !prev)}
              pressStyle={{ opacity: 0.65, background: "transparent" }}
              style={{
                position: "absolute",
                right: 6,
                top: 0,
                bottom: 0,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                color: "#4f46e5",
                backgroundColor: "transparent",
              }}
            >
              {showPassword ? (
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  size={20}
                  color="#4f46e5"
                />
              ) : (
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#4f46e5"
                />
              )}
            </Button>
          </YStack>
        </YStack>

        <YStack gap="$1.5">
          <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
            Confirm Password
          </Paragraph>
          <YStack style={{ position: "relative" }}>
            <Input
              placeholder="Confirm your password"
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
              style={{
                backgroundColor: "#f4f6fb",
                borderColor: "#cfd6e4",
                borderRadius: 10,
                height: 48,
                paddingRight: 44,
              }}
            />
            <Button
              unstyled
              chromeless
              onPress={() => setShowConfirmPassword((prev) => !prev)}
              pressStyle={{ opacity: 0.65, background: "transparent" }}
              style={{
                position: "absolute",
                right: 6,
                top: 0,
                bottom: 0,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                color: "#4f46e5",
                backgroundColor: "transparent",
              }}
            >
              {showConfirmPassword ? (
                <MaterialCommunityIcons
                  name="eye-off-outline"
                  size={20}
                  color="#4f46e5"
                />
              ) : (
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={20}
                  color="#4f46e5"
                />
              )}
            </Button>
          </YStack>
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
        onPress={handleSubmit}
        disabled={loading}
      >
        <Paragraph style={{ color: "#ffffff", fontWeight: "700" }}>
          {loading ? <Spinner /> : "Sign Up"}
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
          <Button chromeless style={{ color: "#4f46e5", fontWeight: "700" }}>
            Sign In
          </Button>
        </Link>
      </XStack>
    </YStack>
  );
}
