import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Button, Input, Paragraph, Spinner, YStack } from "tamagui";

type ResetPasswordFormProps = {
  email: string;
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
  loading: boolean;
  onSubmit: () => void;
};

export default function ResetPasswordForm({
  email,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  loading,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <YStack
      style={{ width: "100%", maxWidth: 360, alignSelf: "center" }}
      gap="$4"
    >
      <YStack style={{ alignItems: "center", paddingBottom: 8 }} gap="$3">
        <YStack
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: "#dde4ff",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons
            name="key-variant"
            size={30}
            color="#4f46e5"
          />
        </YStack>

        <YStack style={{ alignItems: "center" }} gap="$1">
          <Paragraph
            style={{
              color: "#0f172a",
              fontSize: 32,
              lineHeight: 40,
              fontWeight: "800",
              textAlign: "center",
              paddingBottom: 2,
            }}
          >
            Create New Password
          </Paragraph>
          <Paragraph
            style={{
              color: "#5f6775",
              fontSize: 15,
              textAlign: "center",
              maxWidth: 300,
              lineHeight: 22,
            }}
          >
            Set a new password for {email || "your account"}.
          </Paragraph>
        </YStack>
      </YStack>

      <YStack gap="$3">
        <YStack gap="$1.5">
          <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
            New Password
          </Paragraph>
          <YStack style={{ position: "relative" }}>
            <Input
              placeholder="Create a new password"
              secureTextEntry={!showNewPassword}
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
              onPress={() => setShowNewPassword(!showNewPassword)}
              pressStyle={{ opacity: 0.65, background: "transparent" }}
              style={{
                position: "absolute",
                right: 6,
                top: 0,
                bottom: 0,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            >
              <MaterialCommunityIcons
                name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#4f46e5"
              />
            </Button>
          </YStack>
        </YStack>

        <YStack gap="$1.5">
          <Paragraph style={{ color: "#232c3d", fontWeight: "600" }}>
            Confirm Password
          </Paragraph>
          <YStack style={{ position: "relative" }}>
            <Input
              placeholder="Confirm your new password"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
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
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              pressStyle={{ opacity: 0.65, background: "transparent" }}
              style={{
                position: "absolute",
                right: 6,
                top: 0,
                bottom: 0,
                width: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent",
              }}
            >
              <MaterialCommunityIcons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#4f46e5"
              />
            </Button>
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
          onPress={onSubmit}
          disabled={loading}
        >
          <Paragraph style={{ color: "#ffffff", fontWeight: "700" }}>
            {loading ? <Spinner color="#ffffff" /> : "Reset Password"}
          </Paragraph>
        </Button>
      </YStack>
    </YStack>
  );
}
