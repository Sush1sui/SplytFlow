import React, { useCallback, useState } from "react";
import { Alert, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input, Paragraph, Spinner, YStack } from "tamagui";
import { useAuthActions } from "@/lib/context/auth-context";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

export default function ChangePasswordPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();
  const { updatePassword } = useAuthActions();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdate = useCallback(async () => {
    if (!currentPassword) {
      Alert.alert("Validation Error", "Please enter your current password.");
      return;
    }
    if (!newPassword) {
      Alert.alert("Validation Error", "Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Validation Error", "New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      await updatePassword(currentPassword, newPassword, confirmPassword);
      Alert.alert("Success", "Password updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message =
        error?.body?.error ?? error?.message ?? "Failed to update password.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [currentPassword, newPassword, confirmPassword, updatePassword, router]);

  return (
    <YStack
      style={{ flex: 1, backgroundColor: "#f4f6fb", paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerStyle={[
          {
            paddingHorizontal: 20,
            paddingTop: 16,
          },
          { paddingBottom: insets.bottom + 110 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <YStack gap="$5">
          <SettingsPageHeader title="Change Password" disabled={saving} />

          <YStack gap="$3">
            <YStack gap="$1.5">
              <Paragraph
                style={{
                  color: "#232c3d",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                Current Password
              </Paragraph>
              <YStack style={{ position: "relative" }}>
                <Input
                  style={{
                    backgroundColor: "#f4f6fb",
                    borderColor: "#cfd6e4",
                    borderRadius: 10,
                    height: 52,
                    paddingRight: 44,
                    color: "#0f172a",
                  }}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showCurrent}
                  autoCapitalize="none"
                  editable={!saving}
                />
                <Button
                  unstyled
                  chromeless
                  onPress={() => setShowCurrent((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 0,
                    bottom: 0,
                    width: 34,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={showCurrent ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </Button>
              </YStack>
            </YStack>

            <YStack gap="$1.5">
              <Paragraph
                style={{
                  color: "#232c3d",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                New Password
              </Paragraph>
              <YStack style={{ position: "relative" }}>
                <Input
                  style={{
                    backgroundColor: "#f4f6fb",
                    borderColor: "#cfd6e4",
                    borderRadius: 10,
                    height: 52,
                    paddingRight: 44,
                    color: "#0f172a",
                  }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Create new password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showNew}
                  autoCapitalize="none"
                  editable={!saving}
                />
                <Button
                  unstyled
                  chromeless
                  onPress={() => setShowNew((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 0,
                    bottom: 0,
                    width: 34,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={showNew ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </Button>
              </YStack>
            </YStack>

            <YStack gap="$1.5">
              <Paragraph
                style={{
                  color: "#232c3d",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                Confirm New Password
              </Paragraph>
              <YStack style={{ position: "relative" }}>
                <Input
                  style={{
                    backgroundColor: "#f4f6fb",
                    borderColor: "#cfd6e4",
                    borderRadius: 10,
                    height: 52,
                    paddingRight: 44,
                    color: "#0f172a",
                  }}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  editable={!saving}
                />
                <Button
                  unstyled
                  chromeless
                  onPress={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 0,
                    bottom: 0,
                    width: 34,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#94a3b8"
                  />
                </Button>
              </YStack>
            </YStack>
          </YStack>

          <Button
            style={{
              marginTop: space(14),
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4f46e5",
              borderColor: "#4f46e5",
            }}
            onPress={handleUpdate}
            disabled={saving}
          >
            {saving ? (
              <Spinner color="#ffffff" />
            ) : (
              <Paragraph
                style={{
                  color: "#ffffff",
                  fontWeight: "700",
                  fontSize: font(16, 14, 17),
                }}
              >
                Update Password
              </Paragraph>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
