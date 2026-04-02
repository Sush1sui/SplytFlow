import React, { useCallback, useState } from "react";
import { Alert, ScrollView } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input, Paragraph, Spinner, XStack, YStack } from "tamagui";
import { useAuthState, useAuthActions } from "@/lib/context/auth-context";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

export default function EditProfilePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();
  const { user } = useAuthState();
  const { updateProfile } = useAuthActions();

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirst || !trimmedLast) {
      Alert.alert("Validation Error", "First and last name are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert("Validation Error", "Please enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      await updateProfile(trimmedFirst, trimmedLast, trimmedEmail);
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message =
        error?.body?.error ?? error?.message ?? "Failed to update profile.";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  }, [firstName, lastName, email, updateProfile, router]);

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
          <SettingsPageHeader title="Edit Profile" disabled={saving} />

          <YStack
            style={{
              alignSelf: "center",
              width: 96,
              height: 96,
              borderRadius: 48,
              backgroundColor: "#dde4ff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: "#ffffff",
              shadowColor: "#0f172a",
              shadowOpacity: 0.08,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 4 },
              elevation: 2,
            }}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={52}
              color="#4f46e5"
            />
          </YStack>

          <YStack gap="$3">
            <XStack gap="$2.5">
              <YStack style={{ flex: 1 }} gap="$1.5">
                <Paragraph
                  style={{
                    color: "#232c3d",
                    fontWeight: "600",
                    fontSize: font(14, 12, 15),
                  }}
                >
                  First Name
                </Paragraph>
                <Input
                  style={{
                    backgroundColor: "#f4f6fb",
                    borderColor: "#cfd6e4",
                    borderRadius: 10,
                    height: 48,
                  }}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="John"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </YStack>

              <YStack style={{ flex: 1 }} gap="$1.5">
                <Paragraph
                  style={{
                    color: "#232c3d",
                    fontWeight: "600",
                    fontSize: font(14, 12, 15),
                  }}
                >
                  Last Name
                </Paragraph>
                <Input
                  style={{
                    backgroundColor: "#f4f6fb",
                    borderColor: "#cfd6e4",
                    borderRadius: 10,
                    height: 48,
                  }}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Doe"
                  placeholderTextColor="#94a3b8"
                  autoCapitalize="words"
                  editable={!saving}
                />
              </YStack>
            </XStack>

            <YStack gap="$1.5">
              <Paragraph
                style={{
                  color: "#232c3d",
                  fontWeight: "600",
                  fontSize: font(14, 12, 15),
                }}
              >
                Email
              </Paragraph>
              <Input
                style={{
                  backgroundColor: "#f4f6fb",
                  borderColor: "#cfd6e4",
                  borderRadius: 10,
                  height: 48,
                }}
                value={email}
                onChangeText={setEmail}
                placeholder="hello@example.com"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!saving}
              />
            </YStack>
          </YStack>

          <Button
            style={{
              marginTop: space(12),
              height: 52,
              borderRadius: 12,
              backgroundColor: "#4f46e5",
              borderColor: "#4f46e5",
            }}
            onPress={handleSave}
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
                Save Changes
              </Paragraph>
            )}
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
