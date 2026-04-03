import React from "react";
import { ScrollView } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { useRouter } from "expo-router";
import SettingsSection from "./settings-section";
import useTabResponsive from "../shared/use-tab-responsive";
import { useAuthActions, useAuthState } from "@/lib/context/auth-context";
import SettingsScreenSkeleton from "./settings-screen-skeleton";

const accountItems = [
  {
    label: "Edit Profile",
    icon: "account-outline" as const,
    route: "/edit-profile" as const,
  },
  {
    label: "Change Password",
    icon: "lock-outline" as const,
    route: "/change-password" as const,
  },
];

const generalItems = [
  {
    label: "Privacy Policy",
    icon: "shield-outline" as const,
    route: "/privacy-policy" as const,
  },
  {
    label: "Terms of Service",
    icon: "file-document-outline" as const,
    route: "/terms-of-service" as const,
  },
  {
    label: "FAQs & Support",
    icon: "help-circle-outline" as const,
    route: "/faqs-support" as const,
  },
];

export default function SettingsScreen() {
  const { font, space } = useTabResponsive();
  const router = useRouter();
  const { user, loading: authLoading } = useAuthState();
  const { logout } = useAuthActions();

  if (authLoading) {
    return <SettingsScreenSkeleton />;
  }

  return (
    <YStack style={{ flex: 1, backgroundColor: "#f4f6fb" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        decelerationRate="normal"
        alwaysBounceVertical
        overScrollMode="always"
        contentContainerStyle={{
          padding: 20,
          paddingTop: 56,
          paddingBottom: 110,
        }}
      >
        <Paragraph
          style={{
            color: "#0f172a",
            fontSize: font(28, 22, 30),
            lineHeight: font(34, 28, 36),
            fontWeight: "800",
          }}
        >
          Settings
        </Paragraph>

        <XStack
          style={{
            marginTop: space(16),
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#ffffff",
            padding: space(14),
            alignItems: "center",
          }}
          gap="$3"
        >
          <YStack
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: "#dde4ff",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialCommunityIcons
              name="account-outline"
              size={28}
              color="#4f46e5"
            />
          </YStack>

          <YStack style={{ flex: 1 }}>
            <Paragraph
              style={{
                color: "#0f172a",
                fontWeight: "800",
                fontSize: font(20, 16, 22),
              }}
            >
              {user ? `${user.firstName} ${user.lastName}` : "—"}
            </Paragraph>
            <Paragraph style={{ color: "#64748b", fontSize: font(13, 11, 14) }}>
              {user?.email ?? "—"}
            </Paragraph>
          </YStack>
        </XStack>

        <YStack style={{ marginTop: space(18) }} gap="$3">
          <SettingsSection title="ACCOUNT" items={accountItems} />
          <SettingsSection title="GENERAL" items={generalItems} />

          <Button
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#fecaca",
              backgroundColor: "#fff1f2",
              height: 48,
              marginTop: 4,
            }}
            onPress={logout}
          >
            <XStack style={{ alignItems: "center" }} gap="$1.5">
              <MaterialCommunityIcons name="logout" size={17} color="#ef4444" />
              <Paragraph
                style={{
                  color: "#ef4444",
                  fontWeight: "800",
                  fontSize: font(15, 13, 16),
                }}
              >
                Log Out
              </Paragraph>
            </XStack>
          </Button>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
