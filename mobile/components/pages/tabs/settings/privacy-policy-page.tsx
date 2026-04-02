import React from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Paragraph, YStack } from "tamagui";
import useTabResponsive from "../shared/use-tab-responsive";
import SettingsPageHeader from "./settings-page-header";

const sections = [
  {
    heading: "1. Data Collection",
    body: "We collect information you provide directly to us when you create an account, such as your name, email, and tracking configurations.",
  },
  {
    heading: "2. Use of Information",
    body: "Your sales records and split configurations are stored securely on our servers. We do not sell your data to third parties.",
  },
  {
    heading: "3. Data Security",
    body: "We implement appropriate technical and organizational measures to protect the security of your personal information.",
  },
  {
    heading: "4. Your Rights",
    body: "You have the right to access, update, or delete your information at any time from the account settings page.",
  },
];

export default function PrivacyPolicyPage() {
  const insets = useSafeAreaInsets();
  const { font, space } = useTabResponsive();

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
      >
        <YStack gap="$4">
          <SettingsPageHeader title="Privacy Policy" />

          <YStack
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#e2e8f0",
              backgroundColor: "#ffffff",
              padding: 20,
            }}
            gap="$1"
          >
            {sections.map((section, index) => (
              <YStack
                key={section.heading}
                style={{ marginTop: index === 0 ? 0 : space(14) }}
                gap="$1.5"
              >
                <Paragraph
                  style={{
                    color: "#0f172a",
                    fontWeight: "800",
                    fontSize: font(15, 14, 16),
                  }}
                >
                  {section.heading}
                </Paragraph>
                <Paragraph
                  style={{
                    color: "#475569",
                    fontSize: font(15, 14, 16),
                    lineHeight: font(22, 21, 23),
                  }}
                >
                  {section.body}
                </Paragraph>
              </YStack>
            ))}
          </YStack>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
