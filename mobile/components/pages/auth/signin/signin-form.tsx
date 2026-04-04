import {
  YStack,
  Image,
  H4,
  Paragraph,
  Input,
  Button,
  XStack,
  Spinner,
} from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Link } from "expo-router";
import calmPng from "@/assets/icons/calm.png";

export default function SigninForm({
  showPassword,
  setShowPassword,
  handleSubmit,
  loading,
  form,
  setForm,
}: {
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  handleSubmit: () => void;
  loading: boolean;
  form: {
    email: string;
    password: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      email: string;
      password: string;
    }>
  >;
}) {
  return (
    <YStack
      style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      gap="$4"
    >
      <YStack style={{ alignItems: "center", paddingBottom: 8 }} gap="$3">
        <Image
          source={calmPng}
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
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
        </YStack>

        <YStack gap="$1.5">
          <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
            Password
          </Paragraph>
          <YStack style={{ position: "relative" }}>
            <Input
              placeholder="........"
              secureTextEntry={!showPassword}
              style={{
                backgroundColor: "#f4f6fb",
                borderColor: "#cfd6e4",
                borderRadius: 10,
                height: 48,
                paddingRight: 44,
              }}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
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

        <XStack style={{ justifyContent: "flex-end", marginTop: -2 }}>
          <Link
            href="/(auth)/forgot-password"
            push
            style={{
              color: "#4f46e5",
              fontWeight: "600",
              paddingVertical: 4,
            }}
          >
            Forgot Password?
          </Link>
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
          onPress={handleSubmit}
          disabled={loading}
        >
          <Paragraph style={{ color: "#ffffff", fontWeight: "700" }}>
            {loading ? <Spinner /> : "Sign In"}
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
          <Button chromeless style={{ color: "#4f46e5", fontWeight: "700" }}>
            Sign Up
          </Button>
        </Link>
      </XStack>
    </YStack>
  );
}
